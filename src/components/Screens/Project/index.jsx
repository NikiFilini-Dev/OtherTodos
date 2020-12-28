import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"

const Project = observer(() => {
  const {
    selectedProject,
    tasks: { all },
  } = useMst()

  const tasks = all.filter((task) => task.project === selectedProject)

  return (
    <div>
      <div className={styles.info}>
        <span className={styles.title}>{selectedProject.name}</span>
      </div>
      <TaskList tasks={tasks} name={"Задачи"} />
    </div>
  )
})

export default Project
