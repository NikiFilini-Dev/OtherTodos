import React from "react"
import PropTypes from "prop-types"
// import { observer } from "mobx-react"
// import classNames from "classnames"
import styles from "./styles.styl"
import Task from "../Task/index.jsx"
import Label from "../Label/index.jsx"

import ListIcon from "../../assets/list.svg"
import DoneIcon from "../../assets/done.svg"
import TimesIcon from "../../assets/times.svg"
import PieIcon from "../../assets/pie_chart.svg"

const TaskList = ({ tasks, name }) => {
  const doneCount = tasks.filter((t) => t.done).length
  const pendingCount = tasks.filter((t) => !t.done).length
  const totalCount = tasks.length
  let donePercent = Math.abs(doneCount / (totalCount / 100))
  if (isNaN(donePercent)) donePercent = 100.0
  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>

        <div className={styles.actions}>
          <Label icon={ListIcon} text={totalCount} />
          <Label icon={DoneIcon} text={doneCount} />
          <Label icon={PieIcon} text={`${donePercent.toFixed()}%`} />
          <Label icon={TimesIcon} text={pendingCount} />
        </div>
      </div>
      <div className={styles.tasks}>
        {tasks.map((task) => (
          <Task key={`task_${task.id}`} task={task} />
        ))}
      </div>
    </div>
  )
}

TaskList.propTypes = {
  tasks: PropTypes.object,
  name: PropTypes.string,
}

export default TaskList
