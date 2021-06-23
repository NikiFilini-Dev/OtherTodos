import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import Logo from "assets/logo.svg"
import classNames from "classnames"
import ArrowRightIcon from "assets/arrow_right.svg"
import PlusIcon from "assets/plus.svg"
import UserCircleIcon from "assets/line_awesome/user-circle.svg"
import SignOutAltIcon from "assets/line_awesome/sign-out-alt-solid.svg"
import propTypes from "prop-types"
import { useContextMenu, useInput } from "tools/hooks"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { DateTime } from "luxon"
import noop from "lodash-es/noop"
import { IconsMap } from "../../palette/icons"
import Icon from "../Icon"
import Avatar from "../Avatar"

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
    namePrompt=true,
  }) => {
    const [isOpen, setIsOpen] = React.useState(!initiallyFolded)
    const [isAddActive, setIsAddActive] = React.useState(false)
    const [newName, setNewName] = React.useState("")
    if (!isActive) isActive = noop
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
      if (!namePrompt) return onAdd()
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
                    icon={IconsMap[element.icon]}
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

const Foldable = observer(({name, children}) => {
  const [isOpen, setIsOpen] = React.useState(true)
  const onTitleClick = e => {
    setIsOpen(!isOpen)
  }

  return <div>
    <div className={styles.groupTitle} onClick={onTitleClick}>
      <ArrowRightIcon
        className={classNames({
          [styles.groupTitleIcon]: true,
          [styles.groupTitleIconOpen]: isOpen,
        })}
      />
      {name}
    </div>
    {isOpen && children}
  </div>
})

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
    clear,
    backup,
    collectionsStore: {
      collections,
      selectedCollection,
      selectCollection,
      createCollection,
      deleteCollection
    }
  } = useMst()

  const addProject = name => {
    selectProject(createProject(name))
    setScreen("PROJECT")
  }

  const addCollection = () => {
    const collectionId = createCollection({name: "Новая коллекция"})
    selectCollection(collectionId)
    setScreen("COLLECTION")
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

  const sortedCollections = [...collections]
  sortedCollections.sort((a, b) => a.index - b.index)

  const onSignOutClick = async () => {
    setUser(null)
    await backup()
    clear()
    // location.reload()
  }

  return (
    <React.Fragment>
      <div className={styles.logoWrapper}>
        <Logo className={styles.logo} />
        {!process.env.IS_DEV && <span className={styles.logoTitle}>Task</span>}
        {Boolean(process.env.IS_DEV) && <span className={styles.logoTitle+" "+styles.beta}>Beta</span>}
      </div>
      <div className={styles.sidebar}>
        <div
          className={classNames({
            [styles.groupElement]: true,
            [styles.active]: screen === "INBOX",
          })}
          onClick={() => setScreen("INBOX")}
        >
          <Icon name={"msg_bubble"} className={styles.groupElementIcon} />
          Входящие
        </div>
        <div
          className={classNames({
            [styles.groupElement]: true,
            [styles.active]: screen === "TODAY",
          })}
          onClick={() => {
            setScreen("TODAY")
            selectDate(DateTime.now().toFormat("M/d/yyyy"))
          }}
        >
          <Icon name={"smile"} className={styles.groupElementIcon} />
          Сегодня
        </div>
        <div
          className={classNames({
            [styles.groupElement]: true,
            [styles.active]: screen === "LOG",
          })}
          onClick={() => setScreen("LOG")}
        >
          <Icon name={"calendar_checkmark"} className={styles.groupElementIcon} />
          Журнал
        </div>

        <Group
          name={"Коллекции"}
          elements={sortedCollections}
          isActive={collection =>
            collection === selectedCollection && screen === "COLLECTION"
          }
          onElementClick={collection => {
            return () => {
              setScreen("COLLECTION")
              selectCollection(collection.id)
            }
          }}
          namePrompt={false}
          onAdd={addCollection}
          onDelete={rmProject}
        />
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
          onDelete={c => deleteCollection(c.id)}
        />
        <Foldable name={"Метки"}>
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
            <Icon name={"label"} className={styles.groupElementIcon} />
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
            <Icon name={"label"} className={styles.groupElementIcon} />
            Метки событий
          </div>
        </Foldable>
      </div>
      {user && (
        <div className={styles.userInfo}>
          <Avatar user={user} size={"24px"} />
          <span className={styles.username}>{user.firstName}</span>
          <div className={styles.signOut} onClick={() => onSignOutClick()}>
            <SignOutAltIcon />
          </div>
        </div>
      )}
    </React.Fragment>
  )
})

export default Sidebar
