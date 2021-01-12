import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TagsFilter from "components/TagsFilter"
import TaskList from "components/TaskList"
import Task from "../../Task"
import Button from "../../Button"
import PlusIcon from "../../../assets/plus.svg"
import { useTrap } from "../../../tools/hooks"

const Project = observer(() => {
  const {
    selectedProject,
    tasks: { all },
    createTask,
    setTempTask,
    insertTempTask,
  } = useMst()

  let tasks = all.filter(task => task.project === selectedProject)
  const [task, setTask] = React.useState(
    createTask({ project: selectedProject }),
  )
  const [selectedTag, setSelectedTag] = React.useState(null)
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  setTempTask(task)

  useTrap("command+n", () => {
    setIsNewTaskShown(!isNewTaskShown)
  })

  let tags = new Set()
  tasks.forEach(task => {
    if (task.tags.length) task.tags.forEach(tag => tags.add(tag))
  })
  tags = [...tags]
  if (selectedTag)
    tasks = tasks.filter(task => task.tags.indexOf(selectedTag) >= 0)

  const onReject = () => {
    setTask(createTask({ project: selectedProject }))
    setIsNewTaskShown(false)
  }
  const onConfirm = () => {
    if (!task.text) return
    insertTempTask()
    let next = createTask({ project: selectedProject })
    setTempTask(next)
    setTask(next)
    setIsNewTaskShown(false)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        <span className={styles.title}>{selectedProject.name}</span>
        <Button
          icon={PlusIcon}
          onClick={() => setIsNewTaskShown(!isNewTaskShown)}
          activated={isNewTaskShown}
        />
      </div>
      {isNewTaskShown && (
        <div>
          <Task task={task} active onConfirm={onConfirm} />
          <div className={styles.newTaskActions}>
            <Button text={"Добавить"} onClick={onConfirm} />
            <Button text={"Отменить"} secondary onClick={onReject} />
          </div>
        </div>
      )}
      <TagsFilter
        selected={selectedTag}
        select={tag => setSelectedTag(tag)}
        tags={tags}
      />
      <div className={styles.listOfLists}>
        <TaskList tasks={tasks} name={"Задачи"} />
      </div>
    </div>
  )
})

export default Project
