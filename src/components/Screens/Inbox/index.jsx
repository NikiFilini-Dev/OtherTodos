import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"
import Task from "components/Task"
import PlusIcon from "assets/plus.svg"
import Button from "components/Button"
import { useTrap } from "../../../tools/hooks"

const Inbox = observer(() => {
  const {
    tasks: { all },
    setTempTask,
    insertTempTask,
    tempTask,
  } = useMst()

  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  React.useEffect(() => {
    setTempTask({})
  }, [])

  useTrap("alt+n", () => {
    setIsNewTaskShown(!isNewTaskShown)
  })

  useTrap("command+n", () => {
    setIsNewTaskShown(!isNewTaskShown)
  })

  const inbox = all.filter(task => !task.done && !task.project)

  const onReject = () => {
    setTempTask({})
    setIsNewTaskShown(false)
  }
  const onConfirm = () => {
    if (!tempTask.text) return
    insertTempTask()
    setTempTask({})
    setIsNewTaskShown(false)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <div className={styles.info}>
          <span className={styles.title}>Входящие</span>
          <Button
            icon={PlusIcon}
            onClick={() => setIsNewTaskShown(!isNewTaskShown)}
            activated={isNewTaskShown}
          />
        </div>
      </div>
      {isNewTaskShown && tempTask !== null && (
        <div style={{marginBottom: "24px"}}>
          <Task
            task={tempTask}
            active
            onConfirm={onConfirm}
            onReject={onReject}
            newPrompt
          />
        </div>
      )}
      <div className={styles.listOfLists}>
        <TaskList tasks={inbox} name={"Задачи"} />
      </div>
    </div>
  )
})

export default Inbox
