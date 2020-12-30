import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"

const Tag = observer(() => {
  const {
    selectedTag,
    tasks: { all },
  } = useMst()

  console.log(all[0].tags)
  const tasks = all.filter(task => task.tags.toJSON().includes(selectedTag.id))

  return (
    <div>
      <div className={styles.info}>
        <span className={styles.title}>{selectedTag.name}</span>
      </div>
      <TaskList tasks={tasks} name={"Задачи"} />
    </div>
  )
})

export default Tag
