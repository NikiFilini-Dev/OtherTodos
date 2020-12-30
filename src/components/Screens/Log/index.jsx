import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"
import moment from "moment"

const Log = observer(() => {
  const {
    tasks: { all },
  } = useMst()

  const days = []
  all.forEach(task => {
    if (!task.done) return
    if (days[task.closeDate]) days[task.closeDate].push(task)
    else days[task.closeDate] = [task]
  })

  return (
    <div>
      <div className={styles.info}>
        <span className={styles.title}>Закрытые задачи</span>
      </div>
      {Object.keys(days).map(day => (
        <TaskList
          showHidden
          key={`day_${day}`}
          tasks={days[day]}
          name={moment(day).format("DD MMM YYYY")}
        />
      ))}
    </div>
  )
})

export default Log
