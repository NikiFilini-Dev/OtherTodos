import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import classNames from "classnames"

import styles from "./styles.styl"

import Checkbox from "components/Checkbox"
import PrioritySelector from "components/PrioritySelector"
import TaskDateSelector from "components/TaskDateSelector"
import ProjectSelector from "components/ProjectSelector"
import FloatMenu from "components/FloatMenu"
import TagsSelector from "components/TagsSelector"

import FolderIcon from "assets/folder.svg"
import CalendarIcon from "assets/calendar.svg"
import StarIcon from "assets/star.svg"
import TrashIcon from "assets/awesome/regular/trash-alt.svg"
import TagsIcon from "assets/awesome/solid/tags.svg"
import RedoIcon from "assets/awesome/solid/redo.svg"
import CalendarWeekIcon from "assets/awesome/solid/calendar-week.svg"
import PalletIcon from "assets/line_awesome/palette-solid.svg"
import {
  useClick,
  useClickOutsideRef,
  useClickOutsideRefs,
  useContextMenu,
  useDateFormat,
  useKeyListener,
} from "tools/hooks"
import { IRootStore, useMst } from "models/RootStore"
import TaskState from "./state"
import { DateTime } from "luxon"
import TextareaAutosize from "react-textarea-autosize"
import Button from "../Button"
import BakaEditor from "../../editor"
import { ISubtask } from "../../models/Subtask"
import Emitter from "eventemitter3"

const TaskContext = React.createContext(new Emitter())

const Tags = observer(({ task }) => {
  const [selectedTagId, setSelectedTagId] = React.useState(null)
  const ref = React.useRef(null)
  const onTagClick = tag => {
    if (tag.id === selectedTagId) {
      task.removeTag(tag)
      setSelectedTagId(null)
    } else {
      setSelectedTagId(tag.id)
    }
  }
  useClickOutsideRef(ref, () => setSelectedTagId(null))
  return (
    <div
      ref={ref}
      className={classNames({
        [styles.line]: true,
        [styles.padding]: true,
        [styles.fullOnly]: true,
      })}
    >
      {task.tags.map(tag => (
        <span
          key={`task_${task.id}#tag_${tag.id}`}
          className={classNames({
            [styles.tag]: true,
            [styles.active]: task.colorTag === tag,
          })}
          style={{ "--tag-color": tag.color } as CSSProperties}
        >
          <span
            onClick={() => onTagClick(tag)}
            style={{ userSelect: tag.id === selectedTagId ? "none" : "auto" }}
          >
            {tag.name}
          </span>
          <PalletIcon
            onClick={() => {
              if (task.colorTag === tag) {
                task.setColorTag(null)
              } else {
                task.setColorTag(tag)
              }
            }}
          />
        </span>
      ))}
    </div>
  )
})

const Subtask = observer(({ subtask }: { subtask: ISubtask }) => {
  const { deleteSubtask }: IRootStore = useMst()
  const [lastText, setLastText] = React.useState("")
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null)
  const emitter = React.useContext(TaskContext)

  React.useEffect(() => {
    emitter.on("focus_subtask", (subtaskId: string) => {
      if (subtaskId !== subtask.id || !inputRef.current) return
      inputRef.current.focus()
    })
  }, [emitter])

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && lastText.length === 0) {
      e.preventDefault()
      const prev = subtask.task.subtasks.find(
        st => st.index === subtask.index - 1,
      )
      if (prev) emitter.emit("focus_subtask", prev.id)
      deleteSubtask(subtask.id)
    }
    setLastText((e.target as HTMLTextAreaElement).value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return
    e.preventDefault()
    emitter.emit("add_subtask", subtask.index + 1)
  }

  return (
    <div key={subtask.id} className={styles.subtask}>
      <Checkbox
        checked={subtask.status === "DONE"}
        circle
        onChange={val => subtask.setStatus(val ? "DONE" : "ACTIVE")}
      />
      <TextareaAutosize
        placeholder={"Новая подзадача"}
        value={subtask.text}
        onChange={e => subtask.setText(e.target.value)}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        ref={inputRef}
      />
    </div>
  )
})

const Task = observer(
  ({
    task,
    active = false,
    onConfirm,
    onReject,
    expired,
    newPrompt = false,
  }) => {
    const {
      tasks: { deleteTask, selected, select },
      addSubtask,
    }: IRootStore = useMst()
    const [state] = React.useState(new TaskState())
    const [taskEmitter] = React.useState(new Emitter())

    React.useEffect(() => {
      taskEmitter.on("*", console.log)
      taskEmitter.on("add_subtask", (index: number) => {
        const id = addSubtask({ task, index })
        setTimeout(() => taskEmitter.emit("focus_subtask", id), 200)
      })
    }, [taskEmitter])

    React.useEffect(() => {
      if (state.done !== (task.status === "DONE"))
        state.done = task.status === "DONE"
      if (state.active !== active) state.active = active
    }, [task.status, active])

    useClick(document, e => {
      if (
        !state.menus.datePicker ||
        state.elementInMenuOrTrigger(e.target, "datePicker") ||
        state.elementInMenuOrTrigger(e.target, "datePicker_start") ||
        state.elementInMenuOrTrigger(e.target, "datePicker_end")
      )
        return

      state.closeMenu("datePicker")
    })

    useClickOutsideRefs(
      [state.refs.menus.project.menu, state.refs.menus.project.trigger],
      () => state.closeMenu("project"),
    )
    useClickOutsideRefs(
      [state.refs.menus.tags.menu, state.refs.menus.tags.trigger],
      () => state.closeMenu("tags"),
    )
    useClickOutsideRef(state.refs.container, e => {
      if (!state.allMenusClosed) return
      if (e.target.classList.contains(styles.taskText)) return
      if (state.active) console.log("Click outside ref", e)

      if (!active) state.active = false
      if (selected === task.id) {
        select(null)
      }
    })

    React.useEffect(() => {
      if (state.refs.input.current && active) state.refs.input.current.focus()
    }, ["active"])

    useKeyListener("Enter", () => {
      if (onConfirm) onConfirm()
    })

    useKeyListener("Escape", () => {
      if (active) return
      if (state.active || selected) {
        state.active = false
        select(null)
      }
    })

    useContextMenu(state.refs.container, [
      {
        label: "Удалить",
        click: () => deleteTask(task),
      },
    ])

    useKeyListener("Delete", () => {
      if (selected === task.id && !state.active) deleteTask(task)
    })

    useKeyListener("Backspace", () => {
      if (selected === task.id && !state.active) deleteTask(task)
    })

    const onTaskClick = e => {
      if (
        state.active &&
        !active &&
        (e.target.classList.contains(styles.task) ||
          e.target.classList.contains(styles.line)) &&
        state.allMenusClosed
      ) {
        state.active = false
        return
      }

      if (
        state.elementInAnyMenuOrTrigger(e.target) ||
        state.inRef(e.target, state.refs.checkbox)
      )
        return

      if (selected === task.id) state.active = true
      else {
        select(task)
      }
    }

    const onPrioritySelect = priority => {
      task.setPriority(priority)
    }

    const selectTag = tag => task.addTag(tag)
    const unselectTag = tag => task.removeTag(tag)

    const [isUpdated, setIsUpdated] = React.useState(false)
    const onCheckboxChange = val => {
      state.done = val
      setTimeout(() => {
        setIsUpdated(true)
        task.changeStatus(val)
      }, 1500)
    }

    if (isUpdated) {
      state.done = task.done
      setIsUpdated(false)
    }

    const onAddSubtaskClick = () => {
      const id = addSubtask({ task })
      setTimeout(() => taskEmitter.emit("focus_subtask", id), 200)
    }

    const tags = [...task.tags]
    tags.sort((a, b) => a.index - b.index)

    const editorRef = React.useRef<BakaEditor | null>(null)
    React.useEffect(() => {
      if (!editorRef.current || !editorRef.current.setText) return
      editorRef.current.setText(task.note)
      // @ts-ignore
      editorRef.current.addEventListener(
        "change",
        (e: Event & { detail: { original: string } }) => {
          console.log(e.detail.original)
          task.setNote(e.detail.original)
        },
      )
    }, [])

    const date = useDateFormat(task.date, "M/d/yyyy", "dd LLL")

    // @ts-ignore
    return (
      <TaskContext.Provider value={taskEmitter}>
        <div
          ref={state.refs.container}
          className={classNames({
            [styles.task]: true,
            [styles.done]: state.done,
            [styles.active]: state.active,
            [styles.selected]: selected === task.id,
            [styles.colored]: task.colorTag !== null,
          })}
          style={
            {
              "--task-color": task.colorTag?.color,
            } as CSSProperties
          }
          onClick={onTaskClick}
        >
          <div className={styles.line}>
            {!task.isNote && (
              <Checkbox
                color={task.colorTag?.color}
                ref={state.refs.checkbox}
                className={styles.check}
                onChange={onCheckboxChange}
                checked={state.done}
              />
            )}
            {task.isNote && <div className={styles.checkPlaceholder} />}

            {!state.active && (
              <span className={styles.taskText}>
                {task.isNote ? task.noteText : task.text}
              </span>
            )}
            {state.active && (
              <TextareaAutosize
                autoFocus={newPrompt}
                ref={state.refs.input}
                className={styles.taskTextEdit}
                value={task.text}
                placeholder={"Задача"}
                onChange={e => task.setText(e.target.value)}
              />
            )}
            <div className={styles.puller} />
            <div className={styles.tags}>
              {!state.active &&
                Boolean(task.tags.length) &&
                tags.map(tag => (
                  <span
                    key={`inline_tag_${tag.id}`}
                    className={classNames({
                      [styles.tag]: true,
                      [styles.inline]: true,
                    })}
                  >
                    {tag.name}
                  </span>
                ))}
            </div>
            {!state.active && Boolean(expired) && Boolean(task.project) && (
              <span
                className={classNames({
                  [styles.project]: true,
                  [styles.inline]: true,
                })}
              >
                <FolderIcon className={styles.projectIcon} />
                {task.project.name}
              </span>
            )}
            {task.event && (
              <span
                className={styles.hasEvent}
                style={
                  { "--tag-color": task.event.tag?.color } as CSSProperties
                }
              >
                <CalendarWeekIcon />
              </span>
            )}
            {!state.active && task.date && (
              <span
                className={classNames({
                  [styles.date]: true,
                  [styles.inline]: true,
                  [styles.expired]: expired,
                })}
              >
                <CalendarIcon className={styles.dateIcon} />
                {date}
              </span>
            )}
            <div className={styles.priorityWrapper}>
              <PrioritySelector
                onSelect={onPrioritySelect}
                priority={task.priority}
              />
            </div>
          </div>
          {task.subtasks.length > 0 && (
            <div className={styles.line}>
              <span className={styles.subtasksProgressInfo}>
                {task.doneSubtasks.length}/{task.subtasks.length}
              </span>
              <div
                className={styles.subtasksProgress}
                style={
                  { "--donePercent": `${task.progress}%` } as CSSProperties
                }
              />
            </div>
          )}
          <div
            className={classNames({
              [styles.line]: true,
              [styles.padding]: true,
              [styles.fullOnly]: true,
            })}
          >
            <span
              className={styles.project}
              ref={state.refs.menus.project.trigger}
            >
              <span onClick={() => state.openMenu("project")}>
                <FolderIcon className={styles.projectIcon} />
                {task.project ? task.project.name : "Входящие"}
              </span>
            </span>

            {task.date && !state.active && (
              <span className={styles.date}>
                <CalendarIcon className={styles.dateIcon} />
                {date}
              </span>
            )}
          </div>

          <div
            className={classNames({
              [styles.line]: true,
              [styles.padding]: true,
              [styles.fullOnly]: true,
            })}
          >
            <div className={styles.noteWrapper}>
              {/*@ts-ignore */}
              <baka-editor class={styles.note} ref={editorRef} />
              <div className={styles.subtasks}>
                {task.subtasks.map(st => (
                  <Subtask subtask={st} key={st.id} />
                ))}
                <div className={styles.addNew} onClick={onAddSubtaskClick}>
                  + Добавить подзадачу
                </div>
              </div>
            </div>
          </div>
          <Tags task={task} />
          <div
            className={classNames({
              [styles.line]: true,
              [styles.padding]: true,
              [styles.fullOnly]: true,
            })}
          >
            <div style={{ position: "relative" }}>
              <span
                className={styles.fullDate}
                ref={state.refs.menus.datePicker.trigger}
                onClick={() => state.openMenu("datePicker")}
              >
                <StarIcon className={styles.fullDateIcon} />
                {task.date === DateTime.now().toFormat("M/d/yyyy")
                  ? "Сегодня"
                  : task.date
                  ? date
                  : "Без даты"}
              </span>
            </div>
            <div
              className={classNames({
                [styles.redo]: true,
                [styles.active]: task.repeatEvery,
              })}
            >
              <RedoIcon />
              <input
                type={"number"}
                className={styles.repeatCount}
                value={task.repeatEvery || 0}
                onChange={e => task.setRepeatEvery(e.target.value)}
                min={0}
              />{" "}
              дней
            </div>
            <div
              style={{ position: "relative" }}
              ref={state.refs.menus.tags.trigger}
            >
              <div
                className={classNames({
                  [styles.tagsTrigger]: true,
                  [styles.active]: state.menus.tags,
                })}
                onClick={() => state.openMenu("tags")}
              >
                <TagsIcon className={styles.tagsTriggerIcon} />
                Тэги
              </div>
            </div>
            {!active && (
              <div className={styles.delete} onClick={() => deleteTask(task)}>
                <TrashIcon />
              </div>
            )}
            {newPrompt && (
              <div className={styles.promptButtons}>
                <div className={styles.promptButton}>
                  <Button text={"Добавить"} onClick={onConfirm} />
                </div>
                <div className={styles.promptButton}>
                  <Button text={"Отменить"} onClick={onReject} secondary />
                </div>
              </div>
            )}
          </div>

          {state.menus.tags && (
            <FloatMenu
              target={state.refs.menus.tags.trigger}
              menuRef={state.refs.menus.tags.menu}
              position={"vertical_right"}
            >
              <TagsSelector
                type={"TASK"}
                selected={task.tags}
                select={selectTag}
                unselect={unselectTag}
              />
            </FloatMenu>
          )}

          {state.menus.project && (
            <FloatMenu
              target={state.refs.menus.project.trigger}
              menuRef={state.refs.menus.project.menu}
              position={"vertical_left"}
            >
              <ProjectSelector
                selected={task.project ? task.project.id : null}
                onSelect={project => {
                  state.closeMenu("project")
                  task.setProject(project)
                }}
              />
            </FloatMenu>
          )}

          {state.menus.datePicker && (
            <FloatMenu
              target={state.refs.menus.datePicker.trigger}
              position={"vertical_left"}
              menuRef={state.refs.menus.datePicker.menu}
            >
              <TaskDateSelector
                task={task}
                startMenuRef={state.refs.menus.datePicker_start.menu}
                endMenuRef={state.refs.menus.datePicker_end.menu}
                tagMenuRef={state.refs.menus.tags.menu}
              />
            </FloatMenu>
          )}
        </div>
      </TaskContext.Provider>
    )
  },
)

export default Task
