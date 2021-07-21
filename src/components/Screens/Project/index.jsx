import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TagsFilter from "components/TagsFilter"
import TaskList from "components/TaskList"
import Task from "../../Task"
import Button from "../../Button"
import PlusIcon from "assets/line_awesome/plus-solid.svg"
import FolderPlusIcon from "assets/line_awesome/folder-plus-solid.svg"
import {
  useClick,
  useClickOutsideRef,
  useKeyListener,
  useTrap,
} from "../../../tools/hooks"
import { IconsMap } from "../../../palette/icons"
import ListIconMenu from "../../ListIconMenu"
import TrashIcon from "assets/line_awesome/trash-alt.svg"

const Project = observer(() => {
  const {
    selectedProject,
    projects,
    tempTask,
    tasks: { all },
    setTempTask,
    insertTempTask,
    deleteCategory,
    deleteProject,
  } = useMst()

  const inputRef = React.useRef()

  const [selectedTag, setSelectedTag] = React.useState(null)
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  React.useEffect(() => {
    setTempTask(initialTaskData)
  }, [])

  let tasks = all.filter(
    task => task.project === selectedProject && task.done === false,
  )

  const initialTaskData = {
    project:
      projects.find(project => project.id === selectedProject) ||
      selectedProject,
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
  if (selectedTag) {
    tasks = tasks.filter(task => task.tags.indexOf(selectedTag) >= 0)
  }

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

  const categories = [...selectedProject.categories]
  categories.sort((a, b) => a.index - b.index)
  const Icon = IconsMap[selectedProject.icon]
  const triggerRef = React.useRef(null)
  const menuRef = React.useRef(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  useClick(document, e => {
    if (!menuOpen) return
    const notInRef =
      !triggerRef.current ||
      (e.target !== triggerRef.current &&
        !triggerRef.current.contains(e.target))
    if (notInRef) setMenuOpen(false)
  })

  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <div className={styles.info}>
          <div
            className={styles.icon}
            onClick={() => setMenuOpen(true)}
            ref={triggerRef}
          >
            <Icon />
          </div>
          {menuOpen && (
            <ListIconMenu
              triggerRef={triggerRef}
              menuRef={menuRef}
              setIcon={selectedProject.setIcon}
              currentIconName={selectedProject.icon}
            />
          )}
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
              icon={TrashIcon}
              square
              awesome
              secondary
              size={"42px"}
              onClick={() => deleteProject(selectedProject)}
            />
            <Button
              square
              awesome
              secondary
              size={"42px"}
              icon={FolderPlusIcon}
              onClick={() => addCategory()}
            />
            <Button
              square
              awesome
              size={"42px"}
              icon={PlusIcon}
              onClick={() => {
                setTempTask(initialTaskData)
                setIsNewTaskShown(!isNewTaskShown)
              }}
              activated={isNewTaskShown}
            />
          </div>
        </div>
        <TagsFilter
          selected={selectedTag}
          select={tag => {
            if (!isNewTaskShown && tempTask) {
              tempTask.removeTag(selectedTag)
              if (tag) tempTask.addTag(tag)
            }
            setSelectedTag(tag)
          }}
          tags={tags}
        />
      </div>

      {isNewTaskShown && tempTask !== null && (
        <div style={{ marginBottom: "24px" }}>
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
        <TaskList
          tasks={tasks.filter(t => !t.category)}
          name={"Без категории"}
          showEmpty
          hideEmptyHeader
          dnd={"nocategory"}
        />
        {categories.map(category => (
          <TaskList
            tasks={category.sortedTasks.filter(task => {
              if (!selectedTag) return true
              return task.tags.indexOf(selectedTag) >= 0
            })}
            key={category.id}
            name={category.name}
            renamable
            showEmpty
            setIcon={category.setIcon}
            iconName={category.icon}
            dnd={`tasklist_${category.id}`}
            deletable={!category.tasks.length}
            onDelete={() => deleteCategory(category)}
            onNameChange={e => category.setName(e.target.value)}
          />
        ))}
      </div>
    </div>
  )
})

export default Project
