import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import Logo from "assets/logo.svg"
import classNames from "classnames"
import ArrowRightIcon from "assets/arrow_right.svg"
import FolderIcon from "assets/folder.svg"
import PlusIcon from "assets/plus.svg"
import HistoryIcon from "assets/line_awesome/history-solid.svg"
import TagsIcon from "assets/line_awesome/tags-solid.svg"
import PlaneIcon from "assets/line_awesome/telegram-plane.svg"
import EnvelopeIcon from "assets/line_awesome/envelope.svg"
import UserCircleIcon from "assets/line_awesome/user-circle.svg"
import SignOutAltIcon from "assets/line_awesome/sign-out-alt-solid.svg"
import propTypes from "prop-types"
import { useContextMenu, useInput } from "tools/hooks"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { DateTime } from "luxon"

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
    colored,
    color,
    setColor,
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
        {colored ? (
          <input
            type={"color"}
            defaultValue={color ? color : "var(--brand)"}
            className={styles.colorInput}
            onChange={e => setColor(e.target.value)}
          />
        ) : (
          <Icon className={styles.groupElementIcon} />
        )}

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
    colored,
  }) => {
    const [isOpen, setIsOpen] = React.useState(!initiallyFolded)
    const [isAddActive, setIsAddActive] = React.useState(false)
    const [newName, setNewName] = React.useState("")
    if (!isActive) isActive = () => {}
    const addTriggerRef = React.useRef(null)
    const addInputRef = React.useRef(null)

    React.useEffect(() => {
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

      const id = draggableId.match(/.+?_(.+)/)[1]

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
                    colored={colored}
                    color={element.color}
                    setColor={color => element.setColor(color)}
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
    selectTagType,
    selectedTagType,
    user,
    setUser,
  } = useMst()

  const addProject = name => {
    selectProject(createProject(name))
    setScreen("PROJECT")
  }

  const rmProject = project => {
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

  const sortedProjects = [...projects]
  sortedProjects.sort((a, b) => a.index - b.index)

  const sortedTags = [...tags]
  sortedTags.sort((a, b) => a.index - b.index)

  const onSignOutClick = () => {
    setUser(null)
    location.reload()
  }

  return (
    <div className={styles.sidebar}>
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
          selectDate(DateTime.now().toFormat("D"))
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
      <div
        className={classNames({
          [styles.groupElement]: true,
          [styles.active]: screen === "TAGS" && selectedTagType === "TASK",
        })}
        onClick={() => {
          setScreen("TAGS")
          selectTagType("TASK")
        }}
      >
        <TagsIcon className={styles.groupElementAwesomeIcon} />
        Метки задач
      </div>
      <div
        className={classNames({
          [styles.groupElement]: true,
          [styles.active]: screen === "TAGS" && selectedTagType === "EVENT",
        })}
        onClick={() => {
          setScreen("TAGS")
          selectTagType("EVENT")
        }}
      >
        <TagsIcon className={styles.groupElementAwesomeIcon} />
        Метки событий
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
      {user && (
        <div className={styles.userInfo}>
          <UserCircleIcon />
          {user.name}
          <div className={styles.signOut} onClick={() => onSignOutClick()}>
            <SignOutAltIcon />
          </div>
        </div>
      )}
    </div>
  )
})

export default Sidebar
