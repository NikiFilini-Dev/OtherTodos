import React from "react"
import PropTypes from "prop-types"
import styles from "./styles.styl"
import Task from "../Task/index.jsx"
import Label from "../Label/index.jsx"

import ListIcon from "../../assets/list.svg"
import { observer } from "mobx-react"
import { useMst } from "../../models/RootStore"
import classNames from "classnames"
import ChevronRight from "../../assets/awesome/solid/chevron-right.svg"
import TrashIcon from "../../assets/awesome/regular/trash-alt.svg"
import { Draggable, Droppable } from "react-beautiful-dnd"
import { useInput } from "../../tools/hooks"
import { DateTime } from "luxon"

const TaskList = observer(
  ({
    tasks,
    name,
    showHidden,
    renamable,
    onNameChange,
    showEmpty,
    deletable,
    onDelete,
    dnd,
  }) => {
    const { selectedDate, screen } = useMst()
    if (!showHidden) tasks = tasks.filter(task => !task.done)

    const [folded, setIsFolded] = React.useState(false)
    const inputRef = React.useRef(null)

    tasks = tasks.filter(
      task =>
        !task.repeating ||
        (task.date === selectedDate && screen === "TODAY") ||
        DateTime.fromFormat(task.date, "D").toJSDate() <= new Date(),
    )

    tasks.sort((a, b) => b.id - a.id)
    tasks.sort((a, b) => a.priority - b.priority)

    const totalCount = tasks.length

    useInput(inputRef, e => {
      if (e.key !== "Enter") return
      inputRef.current.blur()
    })

    const Content = observer(({ provided }) => {
      return (
        <div className={styles.tasks} ref={provided.innerRef}>
          {tasks.map((task, index) => (
            <Draggable
              key={`task_${task.id}`}
              draggableId={`task_${task.id}`}
              type={"TASK"}
              index={index}
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

    if (!tasks.length && !showEmpty) return <div />
    return (
      <div className={styles.wrapper}>
        <div className={styles.info}>
          <div
            className={classNames({
              [styles.fold]: true,
              [styles.active]: folded,
            })}
            onClick={() => setIsFolded(!folded)}
          >
            <ChevronRight />
          </div>
          {renamable ? (
            <input
              value={name}
              onChange={onNameChange}
              className={styles.nameInput}
              ref={inputRef}
            />
          ) : (
            <span className={styles.name}>{name}</span>
          )}

          <div className={styles.actions}>
            {deletable && (
              <div className={styles.delete} onClick={onDelete}>
                <TrashIcon />
              </div>
            )}
            <Label icon={ListIcon} text={totalCount} />
          </div>
        </div>
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
              <Content provided={provided} snapshot={snapshot} />
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
