import React from "react"
import PropTypes from "prop-types"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import Task from "../Task"

const Project = observer(({ project }) => {
  const tasks = project.sortedTasks

  return (
    <div>
      <h2 className={styles.title}>{project.name}:</h2>
      <ul className={styles.list}>
        {tasks.map(task => (
          <Task key={`task_${task.id}`} task={task} />
        ))}
      </ul>
    </div>
  )
})

Project.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string,
    tasks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.text,
      }),
    ),
  }),
}

export default Project
