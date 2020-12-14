import React, { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { observer } from "mobx-react"
import classNames from "classnames"
import styles from "./styles.styl"

import Checkbox from "../Checkbox/index.jsx"

const Task = observer(({ task }) => {
  const [isActive, setIsActive] = useState(false)
  const refContainer = useRef(null)
  const checkRefContainer = useRef(null)

  useEffect(() => {
    const onDocumentClick = (e) => {
      if (
        refContainer &&
        e.target !== refContainer.current &&
        !refContainer.current.contains(e.target) &&
        isActive
      )
        setIsActive(false)
    }
    document.addEventListener("click", onDocumentClick)
    return () => {
      document.removeEventListener("click", onDocumentClick)
    }
  })

  const onTaskClick = (e) => {
    e.preventDefault()
    if (
      checkRefContainer &&
      (e.target === checkRefContainer.current ||
        checkRefContainer.current.contains(e.target))
    )
      return
    if (e.target) setIsActive(true)
  }

  return (
    <li
      ref={refContainer}
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
          ref={checkRefContainer}
          className={styles.check}
          onChange={(done) => task.changeStatus(done)}
          checked={task.done}
        />
        <span className={styles.taskText}>{task.text}</span>
      </div>
      <div
        className={classNames({
          [styles.line]: true,
          [styles.fullOnly]: true,
        })}
      >
        <textarea
          className={styles.notes}
          placeholder="Заметки"
          onChange={(e) => task.setNote(e.target.value)}
          value={task.note}
        />
      </div>
    </li>
  )
})

Task.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.text,
  }),
}

export default Task
