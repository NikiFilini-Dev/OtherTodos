import React from "react"
import PropTypes from "prop-types"
import { observer } from "mobx-react"
import classNames from "classnames"
import moment from "moment"
import "moment/locale/ru"

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
import {
  useClick,
  useClickOutsideRef,
  useClickOutsideRefs,
  useContextMenu,
  useKeyListener,
} from "tools/hooks"
import { useMst } from "models/RootStore"
import TaskState from "./state"

const Task = observer(({ task, active = false, onConfirm, expired }) => {
  const {
    createTag,
    tasks: { deleteTask, selected, select },
  } = useMst()
  const [state] = React.useState(new TaskState())
  if (active && !state.active) state.active = active

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
  useClickOutsideRef(state.refs.container, () => {
    if (!state.allMenusClosed) return

    if (!active) state.active = false
    if (selected?.id === task.id) {
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
    if (selected?.id === task.id && !state.active) deleteTask(task)
  })

  useKeyListener("Backspace", () => {
    if (selected?.id === task.id && !state.active) deleteTask(task)
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

    if (selected?.id === task.id) state.active = true
    else {
      select(task)
    }
  }

  const onPrioritySelect = priority => {
    task.setPriority(priority)
  }

  const selectTag = tag => task.addTag(tag)
  const unselectTag = tag => task.removeTag(tag)
  const addTag = name => {
    const tag = createTag(name, task.project)
    task.addTag(tag)
  }

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

  let tags = [...task.tags]
  tags.sort((a, b) => a.index - b.index)

  const editorRef = React.useRef(null)
  React.useEffect(() => {
    if (!editorRef.current) return
    editorRef.current.setText(task.note)
    editorRef.current.addEventListener("change", e => {
      console.log(e.detail.original)
      task.setNote(e.detail.original)
    })
  }, [])

  return (
    <div
      ref={state.refs.container}
      className={classNames({
        [styles.task]: true,
        [styles.done]: state.done,
        [styles.active]: state.active,
        [styles.selected]: selected?.id === task.id,
      })}
      onClick={onTaskClick}
    >
      <div className={styles.line}>
        <Checkbox
          ref={state.refs.checkbox}
          className={styles.check}
          onChange={onCheckboxChange}
          checked={state.done}
        />
        {!state.active && <span className={styles.taskText}>{task.text}</span>}
        {state.active && (
          <input
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
          <span className={styles.hasEvent}>
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
            {moment(task.date).format("DD MMM")}
          </span>
        )}
        <div className={styles.priorityWrapper}>
          <PrioritySelector
            onSelect={onPrioritySelect}
            priority={task.priority}
          />
        </div>
      </div>
      <div
        className={classNames({
          [styles.line]: true,
          [styles.padding]: true,
          [styles.fullOnly]: true,
        })}
      >
        <span className={styles.project} ref={state.refs.menus.project.trigger}>
          <span onClick={() => state.openMenu("project")}>
            <FolderIcon className={styles.projectIcon} />
            {task.project ? task.project.name : "Входящие"}
          </span>
        </span>

        {task.date && !state.active && (
          <span className={styles.date}>
            <CalendarIcon className={styles.dateIcon} />
            {moment(task.date).format("DD MMM")}
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
        <baka-editor ref={editorRef} />
      </div>
      <div
        className={classNames({
          [styles.line]: true,
          [styles.padding]: true,
          [styles.fullOnly]: true,
        })}
      >
        {task.tags.map(tag => (
          <span key={`task_${task.id}#tag_${tag.id}`} className={styles.tag}>
            {tag.name}
          </span>
        ))}
      </div>
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
            {task.date === moment().format()
              ? "Сегодня"
              : task.date
              ? moment(task.date).format("DD MMM")
              : "Без даты"}
          </span>
        </div>
        {!active && (
          <div className={styles.delete} onClick={() => deleteTask(task)}>
            <TrashIcon />
          </div>
        )}
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
          д.
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
          </div>
        </div>
      </div>

      {state.menus.tags && (
        <FloatMenu
          target={state.refs.menus.tags.trigger}
          menuRef={state.refs.menus.tags.menu}
          position={"vertical_right"}
        >
          <TagsSelector
            selected={task.tags}
            project={task.project}
            select={selectTag}
            unselect={unselectTag}
            add={addTag}
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
  )
})

Task.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string,
  }),
  expired: PropTypes.bool,
}

export default Task
