import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"
import Task from "../../Task"
import Button from "../../Button"
import PlusIcon from "../../../assets/plus.svg"

const Tag = observer(() => {
  const {
    selectedTag,
    tasks: { all, add },
    createTask,
    setTempTask,
    detachTempTask,
  } = useMst()

  const tasks = all.filter(task => task.tags.toJSON().includes(selectedTag.id))
  const [task, setTask] = React.useState(createTask({ tags: [selectedTag] }))
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  setTempTask(task)

  const onReject = () => {
    setTask(createTask(""))
    setIsNewTaskShown(false)
  }

  const onConfirm = () => {
    if (!task.text) return
    detachTempTask()
    add(task)
    setTask(createTask(""))
    setIsNewTaskShown(false)
  }

  return (
    <div>
      <div className={styles.info}>
        <span className={styles.title}>{selectedTag.name}</span>
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
      <TaskList tasks={tasks} name={"Задачи"} />
    </div>
  )
})

export default Tag
