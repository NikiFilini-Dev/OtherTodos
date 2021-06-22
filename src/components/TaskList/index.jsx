import React from "react"
import PropTypes from "prop-types"
import styles from "./styles.styl"
import Task from "../Task"

import { observer } from "mobx-react"
import { useMst } from "../../models/RootStore"
import classNames from "classnames"
import ChevronRight from "../../assets/awesome/solid/chevron-right.svg"
import TrashIcon from "../../assets/awesome/regular/trash-alt.svg"
import { Draggable, Droppable } from "react-beautiful-dnd"
import { useClick, useInput } from "../../tools/hooks"
import { DateTime } from "luxon"
import { IconsMap } from "../../palette/icons"
import ListIconMenu from "../ListIconMenu"
import AutosizeInput from "react-input-autosize"

const Content = observer(({ provided, tasks, selectedTaskId }) => {
  return (
    <div className={styles.tasks} ref={provided.innerRef}>
      {tasks.map((task, index) => (
        <Draggable
          key={`task_${task.id}`}
          draggableId={`task_${task.id}`}
          type={"TASK"}
          index={index}
          isDragDisabled={selectedTaskId === task.id}
        >
          {provided => (
            <div>
              <div
                id={`task_${task.id}`}
                style={provided.draggableStyle}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
                className={styles.project}
              >
                <Task key={`task_${task.id}`} task={task} />
              </div>
              {provided.placeholder}
            </div>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </div>
  )
})

const TaskList = observer(
  ({
    tasks,
    name,
    showHidden,
    renamable,
    onNameChange,
    showEmpty,
    hideEmptyHeader,
    deletable,
    onDelete,
    dnd,
    iconName,
    setIcon
  }) => {
    const { selectedDate, screen, tasks: {selected} } = useMst()
    if (!showHidden) tasks = tasks.filter(task => !task.done)

    const [folded, setIsFolded] = React.useState(false)
    const inputRef = React.useRef(null)

    tasks = tasks.filter(
      task =>
        !task.repeating ||
        (task.date === selectedDate && screen === "TODAY") ||
        DateTime.fromFormat(task.date, "M/d/yyyy").toJSDate() <= new Date(),
    )

    tasks.sort((a, b) => b.id - a.id)
    tasks.sort((a, b) => a.priority - b.priority)

    const totalCount = tasks.length

    useInput(inputRef, e => {
      if (e.key !== "Enter") return
      inputRef.current.blur()
    })

    const Icon = IconsMap[iconName] || IconsMap["check_list"]

    const triggerRef = React.useRef(null)
    const menuRef = React.useRef(null)

    const [menuOpen, setMenuOpen] = React.useState(false)
    useClick(document, e => {
      if (!menuOpen) return
      const notInRef =
        !triggerRef.current ||
        (e.target !== triggerRef.current && !triggerRef.current.contains(e.target))
      // const notInMenuRef =
      //   !menuRef.current ||
      //   (e.target !== menuRef.current && !menuRef.current.contains(e.target))
      if (notInRef)
        setMenuOpen(false)
    })

    if (!tasks.length && !showEmpty) return <div />
    return (
      <div className={styles.wrapper}>
        {(tasks.length !== 0 || !hideEmptyHeader) && <div className={styles.info}>
          <span ref={triggerRef} onClick={() => setMenuOpen(true)}><Icon className={styles.icon} /></span>
          {Boolean(setIcon) && menuOpen &&
            <ListIconMenu triggerRef={triggerRef} menuRef={menuRef} setIcon={setIcon} currentIconName={iconName} />}
          {renamable ? (
            <AutosizeInput
              value={name}
              onChange={onNameChange}
              inputClassName={styles.nameInput}
              inputRef={inputRef}
            />
          ) : (
            <span className={styles.name}>{name}</span>
          )}
          <span className={styles.tasksCount}>({totalCount})</span>

          <div className={styles.actions}>
            {deletable && (
              <div className={styles.delete} onClick={onDelete}>
                <TrashIcon />
              </div>
            )}
          </div>
          <div
            className={classNames({
              [styles.fold]: true,
              [styles.active]: folded,
            })}
            onClick={() => setIsFolded(!folded)}
          >
            <ChevronRight />
          </div>
        </div>}
        <div
          className={classNames({
            [styles.listWrapper]: true,
            [styles.folded]: folded,
          })}
        >
          <Droppable
            droppableId={dnd || Math.random() + "cat"}
            type={"TASK"}
            isDropDisabled={!dnd}
          >
            {(provided, snapshot) => (
              <Content provided={provided} snapshot={snapshot} tasks={tasks} selectedTaskId={selected} />
            )}
          </Droppable>
        </div>
      </div>
    )
  },
)

TaskList.propTypes = {
  tasks: PropTypes.any,
  name: PropTypes.string,
}

export default TaskList
