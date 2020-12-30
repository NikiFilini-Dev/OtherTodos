import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"
import Task from "components/Task"
import PlusIcon from "assets/plus.svg"
import Button from "components/Button"
import TagsFilter from "../../TagsFilter"

const Inbox = observer(() => {
  const {
    tasks: { all, add },
    createTask,
    setTempTask,
    detachTempTask,
  } = useMst()

  const [task, setTask] = React.useState(createTask({}))
  const [selectedTag, setSelectedTag] = React.useState(null)
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  setTempTask(task)

  const inbox = all.filter(task => !task.done && !task.date)

  let tags = new Set()
  inbox.forEach(task => {
    if (task.tags.length) task.tags.forEach(tag => tags.add(tag))
  })
  tags = [...tags]
  const tasks = selectedTag
    ? inbox.filter(task => task.tags.indexOf(selectedTag) >= 0)
    : inbox

  let projects = new Set()
  tasks.forEach(task => {
    if (task.project) projects.add(task.project)
  })
  projects = [...projects]

  const onReject = () => {
    setTask(createTask(""))
    setIsNewTaskShown(false)
  }
  const onConfirm = () => {
    if (!task.text) return
    detachTempTask()
    let next = createTask({})
    setTempTask(next)
    setIsNewTaskShown(false)
    add(task)
    setTask(next)
  }

  return (
    <div>
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
      <TagsFilter
        tags={tags}
        selected={selectedTag}
        select={tag => setSelectedTag(tag)}
      />
      {projects.map(project => (
        <TaskList
          tasks={tasks.filter(task => task.project === project)}
          name={project.name}
        />
      ))}
    </div>
  )
})

export default Inbox
