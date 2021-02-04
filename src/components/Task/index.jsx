import React, { useState, useRef } from "react"
import PropTypes from "prop-types"
import { observer } from "mobx-react"
import classNames from "classnames"
import moment from "moment"
import "moment/locale/ru"

import styles from "./styles.styl"

import Checkbox from "components/Checkbox"
import PrioritySelector from "components/PrioritySelector"
import DateSelector from "components/DateSelector"
import ProjectSelector from "components/ProjectSelector"
import FloatMenu from "components/FloatMenu"
import TagsSelector from "components/TagsSelector"

import FolderIcon from "assets/folder.svg"
import CalendarIcon from "assets/calendar.svg"
import StarIcon from "assets/star.svg"
import ListIcon from "assets/list.svg"
import {
  useFloatMenu,
  useClickOutsideRef,
  useContextMenu,
  useKeyListener,
} from "tools/hooks"
import { useMst } from "models/RootStore"

const inRef = (ref, e) => {
  return (
    ref.current && (e.target === ref.current || ref.current.contains(e.target))
  )
}

const inRefs = (refs, e) => {
  for (let ref of refs) if (inRef(ref, e)) return true
  return false
}

const Task = observer(({ task, active = false, onConfirm, expired }) => {
  const {
    createTag,
    tasks: { deleteTask, selected, select },
  } = useMst()
  const [isActive, setIsActive] = useState(active)
  const [isDone, setIsDone] = useState(task.done)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isFullDatePickerOpen, setIsFullDatePickerOpen] = useState(false)
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false)
  const [isTagsSelectorOpen, setIsTagsSelectorOpen] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const isSelected = selected === task

  const containerRef = useRef(null)
  const checkRef = useRef(null)
  const inputRef = useRef(null)

  const dateRef = useRef(null)
  const fullDateRef = useRef(null)
  const [projectRef, projectBox] = useFloatMenu()
  const [tagsRef, tagsBox] = useFloatMenu()

  useClickOutsideRef(dateRef, () => setIsDatePickerOpen(false))
  useClickOutsideRef(fullDateRef, () => setIsFullDatePickerOpen(false))
  useClickOutsideRef(projectRef, () => setIsProjectSelectorOpen(false))
  useClickOutsideRef(tagsRef, () => setIsTagsSelectorOpen(false))
  useClickOutsideRef(containerRef, () => {
    if (!active) setIsActive(false)
    if (isSelected) select(null)
  })

  React.useEffect(() => {
    if (inputRef.current && active) inputRef.current.focus()
  }, ["active"])

  useKeyListener("Enter", () => {
    if (onConfirm) onConfirm()
  })

  useKeyListener("Escape", () => {
    if (isActive || selected) {
      setIsActive(false)
      select(null)
    }
  })

  useContextMenu(containerRef, [
    {
      label: "Удалить",
      click() {
        deleteTask(task)
      },
    },
  ])

  useKeyListener("Delete", () => {
    if (isSelected && !isActive) deleteTask(task)
  })

  useKeyListener("Backspace", () => {
    if (isSelected && !isActive) deleteTask(task)
  })

  const onTaskClick = e => {
    if (
      isActive &&
      (e.target.classList.contains(styles.task) ||
        e.target.classList.contains(styles.line)) &&
      !isDatePickerOpen &&
      !isFullDatePickerOpen &&
      !isProjectSelectorOpen &&
      !isTagsSelectorOpen
    )
      return setIsActive(false)
    if (inRefs([dateRef, fullDateRef, projectRef, checkRef], e)) return
    if (e.target) {
      if (isSelected) setIsActive(true)
      else select(task)
    }
  }

  const onPrioritySelect = priority => {
    task.setPriority(priority)
  }

  const onDateSelect = day => {
    let date = day.date
    if (moment.isDate(date)) date = moment(date).format("YYYY-MM-DD")
    task.setDate(date)
    setIsDatePickerOpen(false)
    setIsFullDatePickerOpen(false)
  }

  const selectTag = tag => task.addTag(tag)
  const unselectTag = tag => task.removeTag(tag)
  const addTag = name => {
    const tag = createTag(name, task.project)
    task.addTag(tag)
  }

  const onCheckboxChange = val => {
    setIsDone(val)
    setTimeout(() => {
      setIsUpdated(true)
      task.changeStatus(val)
    }, 1500)
  }

  if (isUpdated) {
    setIsDone(task.done)
    setIsUpdated(false)
  }

  let tags = [...task.tags]
  tags.sort((a, b) => a.index - b.index)

  const editorRef = React.useRef(null)
  React.useEffect(() => {
    editorRef.current.setText(task.note)
    editorRef.current.addEventListener("change", e => {
      console.log(e.detail.original)
      task.setNote(e.detail.original)
    })
  }, [])

  return (
    <div
      ref={containerRef}
      key={`task_${task.id}`}
      className={classNames({
        [styles.task]: true,
        [styles.done]: isDone,
        [styles.active]: isActive,
        [styles.selected]: isSelected,
      })}
      onClick={onTaskClick}
    >
      <div className={styles.line}>
        <Checkbox
          ref={checkRef}
          className={styles.check}
          onChange={onCheckboxChange}
          checked={isDone}
        />
        {!isActive && <span className={styles.taskText}>{task.text}</span>}
        {isActive && (
          <input
            ref={inputRef}
            className={styles.taskTextEdit}
            value={task.text}
            placeholder={"Задача"}
            onChange={e => task.setText(e.target.value)}
          />
        )}
        {!isActive && Boolean(expired) && Boolean(task.project) && (
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
        <div className={styles.tags}>
          {!isActive &&
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
        {!isActive && task.date && (
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
        <span className={styles.project} ref={projectRef}>
          <span onClick={() => setIsProjectSelectorOpen(true)}>
            <FolderIcon className={styles.projectIcon} />
            {task.project ? task.project.name : "Входящие"}
          </span>
          {isProjectSelectorOpen && (
            <FloatMenu targetBox={projectBox} position={"left"}>
              <ProjectSelector
                selected={task.project ? task.project.id : null}
                onSelect={project => {
                  setIsProjectSelectorOpen(false)
                  task.setProject(project)
                }}
              />
            </FloatMenu>
          )}
        </span>
        {task.date && !isActive && (
          <span style={{ position: "relative" }}>
            <span
              className={styles.date}
              ref={dateRef}
              onClick={() => setIsDatePickerOpen(true)}
            >
              <CalendarIcon className={styles.dateIcon} />
              {moment(task.date).format("DD MMM")}
            </span>
            {isDatePickerOpen && (
              <DateSelector
                value={moment(task.date)._d}
                onSelect={onDateSelect}
                triggerRef={dateRef}
              />
            )}
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
        {/*<TextareaAutosize*/}
        {/*  className={styles.notes}*/}
        {/*  placeholder="Заметки"*/}
        {/*  onChange={e => task.setNote(e.target.value)}*/}
        {/*  value={task.note}*/}
        {/*/>*/}
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
          [styles.spaceBetween]: true,
        })}
      >
        <div style={{ position: "relative" }}>
          <span
            className={styles.fullDate}
            ref={fullDateRef}
            onClick={() => setIsFullDatePickerOpen(true)}
          >
            <StarIcon className={styles.fullDateIcon} />
            {task.date === moment().format("YYYY-MM-DD")
              ? "Сегодня"
              : task.date
              ? moment(task.date).format("DD MMM")
              : "Без даты"}
            {isFullDatePickerOpen && (
              <DateSelector
                value={moment(task.date ? task.date : new Date())._d}
                onSelect={onDateSelect}
                // onSelect={onDateSelect}
                triggerRef={fullDateRef}
              />
            )}
          </span>
        </div>
        <div>
          Повторять каждые{" "}
          <input
            type={"number"}
            className={styles.repeatCount}
            value={task.repeatEvery || 0}
            onChange={e => task.setRepeatEvery(e.target.value)}
          />{" "}
          дней
        </div>
        <div style={{ position: "relative" }} ref={tagsRef}>
          <div
            className={styles.tagsTrigger}
            onClick={() => setIsTagsSelectorOpen(true)}
          >
            <ListIcon className={styles.tagsTriggerIcon} viewBox={"0 0 14 8"} />
          </div>
          {isTagsSelectorOpen && (
            <FloatMenu targetBox={tagsBox}>
              <TagsSelector
                selected={task.tags}
                project={task.project}
                select={selectTag}
                unselect={unselectTag}
                add={addTag}
              />
            </FloatMenu>
          )}
        </div>
      </div>
    </div>
  )
})

Task.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number,
    text: PropTypes.text,
  }),
  expired: PropTypes.bool,
}

export default Task
