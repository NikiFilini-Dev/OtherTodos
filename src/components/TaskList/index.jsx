import React from "react"
import PropTypes from "prop-types"
// import { observer } from "mobx-react"
// import classNames from "classnames"
import styles from "./styles.styl"
import Task from "../Task/index.jsx"
import Label from "../Label/index.jsx"

import ListIcon from "../../assets/list.svg"
import { observer } from "mobx-react"
import { useMst } from "../../models/RootStore"
import moment from "moment"

const TaskList = observer(({ tasks, name, showHidden }) => {
  const { selectedDate, screen } = useMst()
  if (!showHidden) tasks = tasks.filter(task => !task.done)

  tasks = tasks.filter(
    task =>
      !task.repeating ||
      (task.date === selectedDate && screen === "TODAY") ||
      moment(task.date, "YYYY-MM-DD")._d <= new Date(),
  )

  tasks.sort((a, b) => b.id - a.id)
  tasks.sort((a, b) => a.priority - b.priority)

  if (!tasks.length) return <div />

  const totalCount = tasks.length
  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>

        <div className={styles.actions}>
          <Label icon={ListIcon} text={totalCount} />
        </div>
      </div>
      <div className={styles.tasks}>
        {tasks.map(task => (
          <Task key={`task_${task.id}`} task={task} />
        ))}
      </div>
    </div>
  )
})

TaskList.propTypes = {
  tasks: PropTypes.any,
  name: PropTypes.string,
}

export default TaskList
