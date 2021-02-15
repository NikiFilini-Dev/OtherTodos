import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import Logo from "assets/logo.svg"
import classNames from "classnames"
import ArrowRightIcon from "assets/arrow_right.svg"
import FolderIcon from "assets/folder.svg"
import PlusIcon from "assets/plus.svg"
import HistoryIcon from "assets/awesome/solid/history.svg"
import PlaneIcon from "assets/awesome/regular/paper-plane.svg"
import EnvelopeIcon from "assets/awesome/regular/envelope.svg"
import propTypes from "prop-types"
import { useContextMenu, useInput } from "tools/hooks"
import moment from "moment"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"

const Element = observer(
  ({
    active,
    onClick,
    icon,
    text,
    deletable,
    onDelete,
    droppableId,
    provided,
  }) => {
    const Icon = icon
    const [savedRef, setSavedRef] = React.useState({ current: null })

    const setRef = ref => {
      provided.innerRef(ref)
      if (savedRef.current !== ref) setSavedRef({ current: ref })
    }

    if (deletable)
      useContextMenu(savedRef, [{ label: "Delete", click: () => onDelete() }])

    return (
      <div
        className={classNames({
          [styles.groupElement]: true,
          [styles.active]: active,
        })}
        onClick={onClick}
        ref={setRef}
        id={droppableId}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Icon className={styles.groupElementIcon} />
        {text}
      </div>
    )
  },
)

Element.propTypes = {
  active: propTypes.bool,
  onClick: propTypes.func,
  icon: propTypes.any,
  text: propTypes.string,
  deletable: propTypes.bool,
  onDelete: propTypes.func,
}

const Group = observer(
  ({
    name,
    elements,
    isActive,
    onElementClick,
    onAdd,
    onDelete,
    type,
    initiallyFolded,
  }) => {
    const [isOpen, setIsOpen] = React.useState(!initiallyFolded)
    const [isAddActive, setIsAddActive] = React.useState(false)
    const [newName, setNewName] = React.useState("")
    if (!isActive) isActive = () => {}
    const addTriggerRef = React.useRef(null)
    const addInputRef = React.useRef(null)

    React.useEffect(() => {
      console.log(isAddActive)
      if (isAddActive) addInputRef.current.focus()
    }, [isAddActive])

    const onTitleClick = e => {
      if (
        addTriggerRef.current &&
        (e.target === addTriggerRef.current ||
          addTriggerRef.current.contains(e.target))
      )
        return
      setIsOpen(!isOpen)
    }

    useInput(addInputRef, e => {
      if (e.code === "Enter") {
        onAdd(newName)
        setNewName("")
        setIsAddActive(false)
      }
    })

    const onAddClick = () => {
      setNewName("")
      setIsAddActive(!isAddActive)
    }

    let onDragEnd = ({ destination, source, draggableId }) => {
      if (!destination) return
      console.log(destination, source, draggableId)

      const id = parseInt(draggableId.match(/.+?_(\d+)/)[1])

      const arr = [...elements]

      arr.forEach(tag => {
        if (tag.id === id) return tag.setIndex(destination.index)

        if (
          source.index < destination.index &&
          tag.index > source.index &&
          tag.index <= destination.index
        ) {
          tag.setIndex(tag.index - 1)
        }

        if (
          source.index > destination.index &&
          tag.index >= destination.index &&
          tag.index < source.index
        ) {
          tag.setIndex(tag.index + 1)
        }
      })
    }

    const Content = observer(({ provided }) => {
      return (
        <div className={styles.elements} ref={provided.innerRef}>
          {isOpen &&
            elements.map((element, i) => (
              <Draggable
                draggableId={`${type}_${element.id}`}
                type={type}
                index={i}
                key={`${type}_${i}`}
              >
                {provided => (
                  <Element
                    key={`${type}_${element.id}`}
                    text={element.name}
                    icon={FolderIcon}
                    active={isActive(element)}
                    onClick={onElementClick(element)}
                    deletable={!!onDelete}
                    onDelete={() => onDelete(element)}
                    provided={provided}
                  />
                )}
              </Draggable>
            ))}
          {provided.placeholder}
        </div>
      )
    })

    return (
      <div>
        <div className={styles.groupTitle} onClick={onTitleClick}>
          <ArrowRightIcon
            className={classNames({
              [styles.groupTitleIcon]: true,
              [styles.groupTitleIconOpen]: isOpen,
            })}
          />
          {name}
          <div
            className={styles.addTrigger}
            ref={addTriggerRef}
            onClick={onAddClick}
          >
            <PlusIcon />
          </div>
        </div>
        {isAddActive && (
          <div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className={styles.newName}
              placeholder={"Имя"}
              ref={addInputRef}
            />
          </div>
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={"projectsList"} type={"PROJECT"}>
            {provided => <Content provided={provided} />}
          </Droppable>
        </DragDropContext>
      </div>
    )
  },
)

Group.propTypes = {
  name: propTypes.string,
  elements: propTypes.any,
  isActive: propTypes.func,
  onElementClick: propTypes.func,
  onAdd: propTypes.func,
}

const Sidebar = observer(() => {
  const {
    tasks: { all, deleteTask },
    screen,
    setScreen,
    selectDate,
    projects,
    tags,
    selectedProject,
    selectProject,
    createProject,
    deleteProject,
    deleteTag,
    selectTag,
    createTag,
  } = useMst()

  const addProject = name => {
    selectProject(createProject(name))
    setScreen("PROJECT")
  }

  const addTag = name => {
    selectTag(createTag(name))
    setScreen("TAG")
  }

  const rmProject = project => {
    console.log("DELETE PROJECT", project.toJSON())
    all.forEach(task => {
      if (task.project !== project) return
      deleteTask(task)
    })
    tags.forEach(tag => {
      if (tag.project !== project) return
      deleteTag(tag)
    })
    deleteProject(project)
  }

  const rmTag = tag => {
    console.log("DELETE TAGT", tag.toJSON())
    all.forEach(task => {
      task.removeTag(tag)
    })
    deleteTag(tag)
  }

  const sortedProjects = [...projects]
  sortedProjects.sort((a, b) => a.index - b.index)

  const sortedTags = [...tags]
  sortedTags.sort((a, b) => a.index - b.index)

  return (
    <div>
      <div className={styles.logoWrapper}>
        <Logo className={styles.logo} />
        <span className={styles.logoTitle}>Task</span>
      </div>
      <div
        className={classNames({
          [styles.groupElement]: true,
          [styles.active]: screen === "INBOX",
        })}
        onClick={() => setScreen("INBOX")}
      >
        <EnvelopeIcon className={styles.groupElementAwesomeIcon} />
        Входящие
      </div>
      <div
        className={classNames({
          [styles.groupElement]: true,
          [styles.active]: screen === "TODAY",
        })}
        onClick={() => {
          setScreen("TODAY")
          selectDate(moment().format("YYYY-MM-DD"))
        }}
      >
        <PlaneIcon className={styles.groupElementAwesomeIcon} />
        Сегодня
      </div>
      <div
        className={classNames({
          [styles.groupElement]: true,
          [styles.active]: screen === "LOG",
        })}
        onClick={() => setScreen("LOG")}
      >
        <HistoryIcon className={styles.groupElementAwesomeIcon} />
        Журнал
      </div>
      <Group
        name={"Проекты"}
        elements={sortedProjects}
        isActive={project =>
          project === selectedProject && screen === "PROJECT"
        }
        onElementClick={project => {
          return () => {
            setScreen("PROJECT")
            selectProject(project)
          }
        }}
        onAdd={addProject}
        onDelete={rmProject}
      />
      <Group
        name={"Тэги"}
        elements={sortedTags}
        isActive={() => false}
        onElementClick={() => {}}
        onAdd={addTag}
        onDelete={rmTag}
        initiallyFolded={true}
        type={"TAG"}
      />
    </div>
  )
})

export default Sidebar
