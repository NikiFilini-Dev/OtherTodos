import React, { useState } from "react"
import PropTypes from "prop-types"
import { observer } from "mobx-react"
import classNames from "classnames"
import styles from "./styles.styl"
import { useMst } from "../../models/RootStore"

const Project = observer(({ project }) => {
  const { addTask } = useMst()
  const [newTaskText, setNewTaskText] = useState("")

  const createTask = () => {
    addTask(newTaskText, project.id)
    setNewTaskText("")
  }

  const tasks = project.sortedTasks

  return (
    <div>
      <span className="name">{project.name}:</span>
      <ul>
        <li>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
          />
          <button onClick={createTask}>Add</button>
        </li>
        {tasks.map((task) => (
          <li
            key={`task_${task.id}`}
            className={classNames({
              [styles.task]: true,
              [styles.done]: task.done,
            })}
          >
            <input
              onChange={(e) => task.changeStatus(e.target.checked)}
              type="checkbox"
              checked={task.done}
            />
            {task.text}
          </li>
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
