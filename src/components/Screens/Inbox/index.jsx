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
    createTask,
    setTempTask,
    insertTempTask,
  } = useMst()

  const [task, setTask] = React.useState(createTask({}))
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  setTempTask(task)

  const buttonRef = React.createRef()

  useTrap("command+n", () => {
    setIsNewTaskShown(!isNewTaskShown)
  })

  const inbox = all.filter(task => !task.done && !task.project)

  const onReject = () => {
    setTask(createTask(""))
    setIsNewTaskShown(false)
  }
  const onConfirm = () => {
    if (!task.text) return
    insertTempTask()
    let next = createTask({})
    setTempTask(next)
    setTask(next)
    setIsNewTaskShown(false)
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
          <Task
            task={task}
            active
            onConfirm={() => buttonRef.current.click()}
          />
          <div className={styles.newTaskActions}>
            <Button text={"Добавить"} onClick={onConfirm} ref={buttonRef} />
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
