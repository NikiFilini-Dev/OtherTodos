import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TagsFilter from "components/TagsFilter"
import TaskList from "components/TaskList"
import Task from "../../Task"
import Button from "../../Button"
import PlusIcon from "../../../assets/plus.svg"
import {
  useClickOutsideRef,
  useKeyListener,
  useTrap,
} from "../../../tools/hooks"

const Project = observer(() => {
  const {
    selectedProject,
    tempTask,
    tasks: { all },
    createTask,
    setTempTask,
    insertTempTask,
  } = useMst()

  const inputRef = React.useRef()

  const [selectedTag, setSelectedTag] = React.useState(null)
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)

  let tasks = all.filter(task => task.project === selectedProject)

  const initialTaskData = {
    project: selectedProject,
  }
  if (selectedTag) initialTaskData.tags = [selectedTag]

  let task
  if (tempTask) task = tempTask
  else {
    task = createTask(initialTaskData)
    setTempTask(task)
  }

  useTrap("command+n", () => {
    setIsNewTaskShown(!isNewTaskShown)
  })

  useClickOutsideRef(inputRef, () => {
    if (isEditingTitle) setIsEditingTitle(false)
  })

  useKeyListener("Enter", () => {
    if (isEditingTitle) setIsEditingTitle(false)
  })

  let tags = new Set()
  tasks.forEach(task => {
    if (task.tags.length) task.tags.forEach(tag => tags.add(tag))
  })
  tags = [...tags]
  if (selectedTag)
    tasks = tasks.filter(task => task.tags.indexOf(selectedTag) >= 0)

  const onReject = () => {
    task = createTask(initialTaskData)
    setTempTask(task)
    setIsNewTaskShown(false)
  }
  const onConfirm = () => {
    if (!task.text) return
    insertTempTask()
    let next = createTask(initialTaskData)
    setTempTask(next)
    task = createTask(initialTaskData)
    setTempTask(task)
    setIsNewTaskShown(false)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        {isEditingTitle ? (
          <input
            type={"text"}
            value={selectedProject.name}
            className={styles.nameEdit}
            onChange={e => selectedProject.setName(e.target.value)}
            ref={inputRef}
            autoFocus={true}
          />
        ) : (
          <span
            onClick={() => setIsEditingTitle(true)}
            className={styles.title}
          >
            {selectedProject.name}
          </span>
        )}

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
        select={tag => {
          if (!isNewTaskShown && tag) task.addTag(tag)
          setSelectedTag(tag)
        }}
        tags={tags}
      />
      <div className={styles.listOfLists}>
        <TaskList tasks={tasks} name={"Задачи"} />
      </div>
    </div>
  )
})

export default Project
