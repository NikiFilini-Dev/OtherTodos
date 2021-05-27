import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TagsFilter from "components/TagsFilter"
import TaskList from "components/TaskList"
import Task from "../../Task"
import Button from "../../Button"
import PlusIcon from "../../../assets/plus.svg"
import FolderPlusIcon from "assets/line_awesome/folder-plus-solid.svg"
import {
  useClickOutsideRef,
  useKeyListener,
  useTrap,
} from "../../../tools/hooks"
import { Droppable, Draggable } from "react-beautiful-dnd"

const Content = observer(({ provided, selectedProject, deleteCategory, setIsNewTaskShown, tasks }) => {
  const categories = [...selectedProject.categories]
  categories.sort((a, b) => a.index - b.index)
  const Category = observer(({ provided, category }) => (
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
        dnd={`tasklist_${category.id}`}
        deletable={!category.tasks.length}
        onDelete={() => deleteCategory(category)}
        onNameChange={e => category.setName(e.target.value)}
      />
    </div>
  ))
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
          {provided => <Category provided={provided} category={category} />}
        </Draggable>
      ))}
      {provided.placeholder}
      <div
        className={styles.addCategory}
        onClick={() => setIsNewTaskShown(true)}
      >
        <PlusIcon />
        Добавить задачу
      </div>
    </div>
  )
})

const Project = observer(() => {
  const {
    selectedProject,
    projects,
    tempTask,
    tasks: { all },
    setTempTask,
    insertTempTask,
    deleteCategory,
  } = useMst()

  const inputRef = React.useRef()

  const [selectedTag, setSelectedTag] = React.useState(null)
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  React.useEffect(() => {
    setTempTask(initialTaskData)
  }, [])

  let tasks = all.filter(task => task.project === selectedProject && task.done === false)

  const initialTaskData = {
    project: projects.find(project => project.id === selectedProject) || selectedProject,
  }
  if (selectedTag) initialTaskData.tags = [selectedTag]

  useTrap("alt+n", () => {
    setIsNewTaskShown(!isNewTaskShown)
  })

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
    setTempTask(initialTaskData)
    setIsNewTaskShown(false)
  }
  const onConfirm = () => {
    if (!tempTask.text) return
    insertTempTask()
    setTempTask(initialTaskData)
    setIsNewTaskShown(false)
  }

  const addCategory = () => {
    selectedProject.addCategory()
  }

  let onDragEnd = args => {
    if (!args) return
    let { destination, source, draggableId } = args
    if (!destination) return
    console.log(destination, source, draggableId)

    const id = draggableId.match(/.+?_(.+)/)[1]

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
      let match = destination.droppableId.match(/.+?_(.+)/)
      const targetCategory = match ? match[1] : null

      let task = all.find(t => t.id === id)
      task.setCategory(targetCategory)

      console.log("SET CATEGORY", task)
    }
  }
  React.useEffect(() => (window.onDragEndFunc = onDragEnd))
  window.onDragEndFunc = onDragEnd


  return (
    <div className={styles.screen}>
      <div className={styles.head}>
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

          <div className={styles.actions}>
            <Button
              icon={FolderPlusIcon}
              awesome={true}
              onClick={() => addCategory()}
              secondary={true}
            />
            <Button
              icon={PlusIcon}
              onClick={() => setIsNewTaskShown(!isNewTaskShown)}
              activated={isNewTaskShown}
            />
          </div>
        </div>
        <TagsFilter
          selected={selectedTag}
          select={tag => {
            if (!isNewTaskShown && tag) {
              tempTask.removeTag(selectedTag)
              tempTask.addTag(tag)
            }
            setSelectedTag(tag)
          }}
          tags={tags}
        />
      </div>

      {isNewTaskShown && tempTask !== null && (
        <div style={{marginBottom: "24px"}}>
          <Task task={tempTask} active onConfirm={onConfirm} onReject={onReject} newPrompt />
        </div>
      )}

      <Droppable droppableId={"projectsList"} type={"PROJECT"}>
        {(provided, snapshot) => (
          <Content provided={provided} snapshot={snapshot} selectedProject={selectedProject}
                   deleteCategory={deleteCategory} setIsNewTaskShown={setIsNewTaskShown} tasks={tasks} />
        )}
      </Droppable>
    </div>
  )
})

export default Project
