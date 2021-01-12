import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"
import Task from "components/Task"
import PlusIcon from "assets/plus.svg"
import Button from "components/Button"

const Inbox = observer(() => {
  const {
    tasks: { all, add },
    createTask,
    setTempTask,
    detachTempTask,
  } = useMst()

  const [task, setTask] = React.useState(createTask({}))
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  setTempTask(task)

  const inbox = all.filter(task => !task.done && !task.project)

  const onReject = () => {
    setTask(createTask(""))
    setIsNewTaskShown(false)
  }
  const onConfirm = () => {
    if (!task.text) return
    detachTempTask()
    let next = null
    setTempTask(next)
    setIsNewTaskShown(false)
    add(task)
    next = createTask({})
    setTempTask(next)
    setTask(next)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        <span className={styles.title}>Входящие</span>
        <Button
          icon={PlusIcon}
          onClick={() => setIsNewTaskShown(!isNewTaskShown)}
          activated={isNewTaskShown}
        />
      </div>
      {isNewTaskShown && (
        <div>
          <Task task={task} active />
          <div className={styles.newTaskActions}>
            <Button text={"Добавить"} onClick={onConfirm} />
            <Button text={"Отменить"} secondary onClick={onReject} />
          </div>
        </div>
      )}
      <div className={styles.listOfLists}>
        <TaskList tasks={inbox} name={"Задачи"} />
      </div>
    </div>
  )
})

export default Inbox
