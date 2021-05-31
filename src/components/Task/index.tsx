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

import Tags from "./components/Tags"
import Subtask from "./components/Subtask"

import FolderIcon from "assets/folder.svg"
import CalendarIcon from "assets/calendar.svg"
import StarIcon from "assets/star.svg"
import TrashIcon from "assets/awesome/regular/trash-alt.svg"
import TagsIcon from "assets/awesome/solid/tags.svg"
import RedoIcon from "assets/awesome/solid/redo.svg"
import CalendarWeekIcon from "assets/awesome/solid/calendar-week.svg"
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
import Emitter from "eventemitter3"
import _, { noop } from "lodash"
import Tag from "components/Tag"
import { toJS } from "mobx"
import { v4 } from "uuid"

export const TaskContext = React.createContext(new Emitter())

const Task = observer(
  ({
     task: source,
     active = false,
     onConfirm,
     onReject,
     expired,
     newPrompt = false,
   }) => {
    const {
      tasks: { deleteTask, selected, select },
      addSubtask,
      editingTask,
      setEditingTask
    }: IRootStore = useMst()
    const [state] = React.useState(new TaskState())
    const [taskEmitter] = React.useState(new Emitter())
    const noteAndSubtasksContainer = React.useRef<HTMLDivElement | null>(null)

    const task = state.active && !newPrompt? editingTask : source

    React.useEffect(() => {
      taskEmitter.on("*", console.log)
      taskEmitter.on("add_subtask", (index: number) => {
        const id = addSubtask({ task: source, index })
        setTimeout(() => taskEmitter.emit("focus_subtask", id), 200)
      })
    }, [taskEmitter])

    React.useEffect(() => {
      if (state.done !== (task.status === "DONE"))
        state.done = task.status === "DONE"
      if (state.active !== active) state.active = active
    }, [task.status, active])

    const onActivation = () => {
      const json = {...source.toJSON()}
      json.project = source.project?.id
      json.id = v4()
      setEditingTask(json)
    }

    const onDeactivation = () => {
      if (!editingTask) return
      if (editingTask.text !== source.text)
        source.setText(editingTask.text)
      if (editingTask.note !== source.note)
        source.setNote(editingTask.note)
      if (editingTask.project !== source.project)
        source.setProject(editingTask.project)
      if (!_.eq(editingTask.tags.map(t => t.id), source.tags.map(t => t.id)))
        source.setTags(editingTask.tags.map(t => t.id))
      if (editingTask.repeatEvery !== source.repeatEvery)
        source.setRepeatEvery(editingTask.repeatEvery)
      if (editingTask.status !== source.status)
        source.setStatus(editingTask.status)
      if (editingTask.priority !== source.priority)
        source.setPriority(editingTask.priority)
      if (editingTask.date !== source.date)
        source.setDate(editingTask.date)
      if (editingTask.repeating !== source.repeating)
        source.setRepeating(editingTask.repeating)
      if (editingTask.category !== source.category)
        source.setRepeating(editingTask.category)
      if (editingTask.event !== source.event)
        source.setEvent(editingTask.event)
      if (editingTask.colorTag !== source.colorTag)
        source.setColorTag(editingTask.colorTag)

      setEditingTask({})
    }

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

      if (!active && state.active) {
        state.active = false
        onDeactivation()
      }
      if (selected === task.id) {
        select(null)
      }
    })

    React.useEffect(() => {
      if (state.refs.input.current && active) state.refs.input.current.focus()
    }, ["active"])

    useKeyListener("Enter", (e) => {
      if (e.path.includes(noteAndSubtasksContainer.current)) return
      if (onConfirm) onConfirm()
    })

    useKeyListener("Escape", () => {
      if (active) return
      if (state.active) {
        state.active = false
        onDeactivation()
      }
      if (state.active || selected) {
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
      if (selected === task.id && !state.active) deleteTask(source)
    })

    useKeyListener("Backspace", () => {
      if (selected === task.id && !state.active) deleteTask(source)
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
        onDeactivation()
        return
      }

      if (
        state.elementInAnyMenuOrTrigger(e.target) ||
        state.inRef(e.target, state.refs.checkbox)
      )
        return


      if (selected === source.id && !state.active) {
        state.active = true
        onActivation()
      }
      if (selected !== source.id) {
        select(task)
      }
    }

    const onPrioritySelect = priority => {
      if (editingTask)
        editingTask.setPriority(priority)
      else
        source.setPriority(priority)
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
      const id = addSubtask({ task: source })
      setTimeout(() => taskEmitter.emit("focus_subtask", id), 200)
    }

    const tags = [...task.tags]
    tags.sort((a, b) => a.index - b.index)

    const editorRef = React.useRef<BakaEditor | null>(null)
    React.useEffect(() => {
      if (!editorRef.current || !editorRef.current.setText) return
      editorRef.current.setText(task.note)

      editorRef.current.addEventListener(
        "change",
        // @ts-ignore
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
                <Tag tag={tag} key={tag.id} onClick={noop} selected={false} />
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
                menuRef={state.refs.menus.priority.menu}
                triggerRef={state.refs.menus.priority.trigger}
              />
            </div>
          </div>
          {source.subtasks.length > 0 && (
            <div className={styles.line}>
              <span className={styles.subtasksProgressInfo}>
                {source.doneSubtasks.length}/{source.subtasks.length}
              </span>
              <div
                className={styles.subtasksProgress}
                style={
                  { "--donePercent": `${source.progress}%` } as CSSProperties
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
            <div className={styles.noteWrapper} ref={noteAndSubtasksContainer}>
              {/*@ts-ignore */}
              <baka-editor class={styles.note} ref={editorRef} />
              <div className={styles.subtasks}>
                {source.subtasks.map(st => (
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
              <div className={styles.delete} onClick={() => deleteTask(source)}>
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
