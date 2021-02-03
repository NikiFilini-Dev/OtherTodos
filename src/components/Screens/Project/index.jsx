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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

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

  const addCategory = () => {
    selectedProject.addCategory()
  }

  let onDragEnd = ({ destination, source, draggableId }) => {
    if (!destination) return
    console.log(destination, source, draggableId)

    const id = parseInt(draggableId.match(/.+?_(\d+)/)[1])

    if (draggableId.startsWith("category")) {
      const arr = [...selectedProject.categories]

      arr.forEach(item => {
        if (item.id === id) return item.setIndex(destination.index)

        if (
          source.index < destination.index &&
          item.index > source.index &&
          item.index <= destination.index
        ) {
          item.setIndex(item.index - 1)
        }

        if (
          source.index > destination.index &&
          item.index >= destination.index &&
          item.index < source.index
        ) {
          item.setIndex(item.index + 1)
        }
      })
    }
    if (draggableId.startsWith("task")) {
      let match = destination.droppableId.match(/.+?_(\d+)/)
      const targetCategory = match ? parseInt(match[1]) : null

      let task = all.find(t => t.id === id)
      task.setCategory(targetCategory)

      console.log("SET CATEGORY", task)
    }
  }
  window.onDragEndFunc = onDragEnd

  const Content = observer(({ provided, snapshot }) => {
    const categories = [...selectedProject.categories]
    categories.sort((a, b) => a.index - b.index)
    return (
      <div className={styles.listOfLists} ref={provided.innerRef}>
        <TaskList
          tasks={tasks.filter(t => !t.category)}
          name={"Без категории"}
          showEmpty
          dnd={"nocategory"}
        />
        {categories.map((category, index) => (
          <Draggable
            key={`category_${category.id}`}
            draggableId={`category_${category.id}`}
            type={"CATEGORY"}
            index={index}
          >
            {(provided, snapshot) => (
              <div
                style={provided.draggableStyle}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
                className={styles.project}
              >
                <TaskList
                  tasks={category.sortedTasks}
                  name={category.name}
                  renamable
                  showEmpty
                  dnd={`task_list_${category.id}`}
                  deletable={!category.tasks.length}
                  onDelete={() => selectedProject.removeCategory(category)}
                  onNameChange={e => category.setName(e.target.value)}
                />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
        <div className={styles.addCategory} onClick={addCategory}>
          <PlusIcon />
          Добавить категорию
        </div>
      </div>
    )
  })

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

      <Droppable droppableId={"projectsList"} type={"PROJECT"}>
        {(provided, snapshot) => (
          <Content provided={provided} snapshot={snapshot} />
        )}
      </Droppable>
    </div>
  )
})

export default Project
