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
import { useFloatMenu, useClickOutsideRef, useInput } from "tools/hooks"
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

const Task = observer(({ task, active = false, onConfirm }) => {
  const { createTag } = useMst()
  const [isActive, setIsActive] = useState(active)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isFullDatePickerOpen, setIsFullDatePickerOpen] = useState(false)
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false)
  const [isTagsSelectorOpen, setIsTagsSelectorOpen] = useState(false)

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
  })

  React.useEffect(() => {
    if (inputRef.current && active) inputRef.current.focus()
  }, ["active"])

  useInput(inputRef, e => {
    console.log(e)
    if (e.key === "Enter" && onConfirm) onConfirm()
  })

  const onTaskClick = e => {
    e.preventDefault()
    if (inRefs([dateRef, fullDateRef, projectRef, checkRef], e)) return
    if (e.target) setIsActive(true)
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
    const tag = createTag(name)
    task.addTag(tag)
  }

  return (
    <div
      ref={containerRef}
      key={`task_${task.id}`}
      className={classNames({
        [styles.task]: true,
        [styles.done]: task.done,
        [styles.active]: isActive,
      })}
      onClick={onTaskClick}
    >
      <div className={styles.line}>
        <Checkbox
          ref={checkRef}
          className={styles.check}
          onChange={done => task.changeStatus(done)}
          checked={task.done}
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
        })}
      >
        <span className={styles.project} ref={projectRef}>
          <span onClick={() => setIsProjectSelectorOpen(true)}>
            <FolderIcon className={styles.projectIcon} />
            {task.project ? task.project.name : "Без проекта"}
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
        <textarea
          className={styles.notes}
          placeholder="Заметки"
          onChange={e => task.setNote(e.target.value)}
          value={task.note}
        />
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
          </span>
          {isFullDatePickerOpen && (
            <DateSelector
              value={moment(task.date ? task.date : new Date())._d}
              onSelect={onDateSelect}
              // onSelect={onDateSelect}
              triggerRef={fullDateRef}
            />
          )}
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
    id: PropTypes.string,
    text: PropTypes.text,
  }),
}

export default Task
