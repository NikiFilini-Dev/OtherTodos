import React from "react"
import { observer } from "mobx-react"
import { IRootStore, useMst } from "models/RootStore"
import styles from "./styles.styl"
import Column from "./components/Column"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import CardForm from "../../CardForm"
import Select from "../../Select"
import Button from "../../Button"
import PlusIcon from "../../../assets/line_awesome/plus-solid.svg"
import CollectionForm from "../../CollectionForm"
import Icon from "../../Icon"
import UploadView from "./components/UploadView"
import gqlClient from "graphql/client"
import ResizeIcon from "assets/customIcons/resize.svg"
import FloatMenu from "../../FloatMenu"
import CheckIcon from "assets/line_awesome/check-solid.svg"
import classNames from "classnames"
import { useClickOutsideRefs } from "../../../tools/hooks"
import UsersModal from "./components/UsersModal"
import Avatar from "../../Avatar"

type Size = "small" | "medium" | "big"

const Collection = observer(() => {
  const {
    user: currentUser,
    collectionsStore: {
      collections,
      selectCollection,
      selectedCollection,
      moveColumn,
      moveCard,
      editingCard,
      createColumn,
      selectEditingCollection,
      editingCollection,
      userFilter,
      userFilterEnabled,
      setUserFilter,
      enableUserFilter,
    },
  }: IRootStore = useMst()

  if (!selectedCollection) {
    selectCollection([...collections][0].id)
    return <div />
  }


  const columns = [...selectedCollection.columns]
  columns.sort((a, b) => a.index - b.index)

  const onPlusClick = () => {
    createColumn({ name: "Новая колонка", collection: selectedCollection.id })
  }

  const onAddUserClick = () => {
    setInviteModalOpen(true)
  }

  const sizeKey = "collectionCardSize#"+selectedCollection.id
  const getSize = (): Size => {
    let size: Size = "medium"
    const saved = localStorage.getItem(sizeKey)
    if (saved && ["small", "medium", "big"].includes(saved)) size = saved as Size
    return size
  }
  const [size, _setSize] = React.useState<Size>(getSize())
  const setSize = s => {
    _setSize(s)
    localStorage.setItem(sizeKey, s)
  }

  const sizeTriggerRef = React.useRef(null)
  const sizeMenuRef = React.useRef(null)
  const [sizeMenuOpen, setSizeMenuOpen] = React.useState(false)
  useClickOutsideRefs([sizeMenuRef, sizeTriggerRef], () => {
    if (sizeMenuOpen) setSizeMenuOpen(false)
  })

  const [inviteModalOpen, setInviteModalOpen] = React.useState(false)

  const variants = collections.map(c => ({ code: c.id, name: c.name, icon: c.icon }))
  variants.sort((a,b) => {
    const collA = collections.find(c => c.id === a.code)
    const collB = collections.find(c => c.id === b.code)
    return collA.index - collB.index
  })

  const onUserClick = (user) => {
    if (userFilterEnabled && userFilter === user) {
      setUserFilter(null)
      enableUserFilter(false)
      return
    }
    enableUserFilter(true)
    setUserFilter(user)
  }

  const User = observer(({user}) => {
    return <div className={styles.user} onClick={() => onUserClick(user)}>
      {userFilterEnabled && userFilter === user && <div className={styles.filterActiveMark} />}
      <Avatar user={user} size={"32px"} />
      <span className={styles.name}>{user ? user.firstName : "Неназначено"}</span>
      <span className={styles.count}>{selectedCollection.cards.filter(c => c.assigned === user).length}</span>
    </div>
  })

  return (
    <div className={styles.screenWrapper}>
      <div className={styles.screen}>
        <div className={styles.head}>
          <div className={styles.info}>
            <Select variants={variants}
                    selected={selectedCollection.id} select={id => selectCollection(id)} />
            <div className={styles.puller} />
            <div className={styles.actionTrigger} onClick={() => selectEditingCollection(selectedCollection)}>
              <Icon name={"settings"} />
            </div>
            <div className={styles.actionTrigger}
                 onClick={() => setSizeMenuOpen(true)}
                 ref={sizeTriggerRef}>
              <ResizeIcon />
            </div>
            <Button icon={PlusIcon} square onClick={onPlusClick} size={"44px"} />
          </div>
        </div>
        {sizeMenuOpen && (
          <FloatMenu target={sizeTriggerRef} menuRef={sizeMenuRef} position={"horizontal_auto"}>
            <div className={styles.menu}>
              <div className={styles.menuName}>Ширина колонок:</div>
              <div className={classNames({
                [styles.size]: true,
                [styles.active]: size === "small"
              })} onClick={() => setSize("small")}>
                Маленькая
                <CheckIcon />
              </div>
              <div className={classNames({
                [styles.size]: true,
                [styles.active]: size === "medium"
              })} onClick={() => setSize("medium")}>
                Средняя
                <CheckIcon />
              </div>
              <div className={classNames({
                [styles.size]: true,
                [styles.active]: size === "big"
              })} onClick={() => setSize("big")}>
                Большая
                <CheckIcon />
              </div>
            </div>
          </FloatMenu>
        )}
        {editingCollection !== null && <CollectionForm />}
        <DragDropContext onDragEnd={({ draggableId, destination, type }) => {
          if (!destination) return
          if (type === "COLUMN") {
            moveColumn(draggableId, destination.index)
          } else {
            moveCard(draggableId, destination.droppableId, destination.index)
          }
        }}>
          <Droppable droppableId={selectedCollection.id} direction={"horizontal"} type={"COLUMN"}>
            {(provided) => (
              <div
                className={styles.columns}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns.map(col => (
                  <Draggable draggableId={col.id} index={col.index} key={col.id}>
                    {(provided) =>
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Column column={col} handleProps={provided.dragHandleProps} size={size} />
                      </div>
                    }
                  </Draggable>
                ))}
                {provided.placeholder}
                <div className={styles.addColumn} onClick={onPlusClick}>+</div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <UploadView />
        {inviteModalOpen && <UsersModal collection={selectedCollection} onClose={() => setInviteModalOpen(false)} />}
      </div>
      <div className={styles.usersList}>
        <User user={null} />
        <User user={selectedCollection.userId} />
        {selectedCollection.users.map(u => <User key={u.id} user={u} />)}

        {selectedCollection.userId.id === currentUser.id && <div className={styles.add} onClick={onAddUserClick}>
          <PlusIcon />
        </div>}
      </div>
    </div>
  )
})

export default Collection
