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
import UserIcon from "assets/line_awesome/user-circle.svg"
import TimesIcon from "assets/line_awesome/times-solid.svg"
import gqlClient from "graphql/client"
import { INVITE_USER, REMOVE_USER_FROM_COLLECTION } from "graphql/collection"

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
    const email = prompt("User email")
    gqlClient.mutation(INVITE_USER, { collectionId: selectedCollection.id, email }).toPromise().then(() => {
      window.syncMachine.loadAll(null)
    })
  }

  const onRemoveUserClick = (id: string) => {
    gqlClient.mutation(REMOVE_USER_FROM_COLLECTION, {
      collectionId: selectedCollection.id,
      userId: id,
    }).toPromise().then(() => {
      window.syncMachine.loadAll(null)
    })
  }

  console.log(selectedCollection.userId, currentUser.id)


  return (
    <div className={styles.screenWrapper}>
      <div className={styles.screen}>
        <div className={styles.head}>
          <div className={styles.info}>
            <Select variants={collections.map(c => ({ code: c.id, name: c.name, icon: c.icon }))}
                    selected={selectedCollection.id} select={id => selectCollection(id)} />
            <div className={styles.settingsTrigger} onClick={() => selectEditingCollection(selectedCollection)}><Icon
              name={"settings"} /></div>
            <Button icon={PlusIcon} square onClick={onPlusClick} />
          </div>
        </div>
        {editingCollection !== null && <CollectionForm />}
        {editingCard !== null && <CardForm cardId={editingCard.id} />}
        <DragDropContext onDragEnd={({ draggableId, destination, type }) => {
          if (!destination) return
          if (type === "COLUMN") {
            console.log(`moveColumn("${draggableId}", ${destination.index})`)
            moveColumn(draggableId, destination.index)
          } else {
            console.log(`moveCard("${draggableId}", "${destination.droppableId}", ${destination.index})`)
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
                        <Column column={col} handleProps={provided.dragHandleProps} />
                      </div>
                    }
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <UploadView />
      </div>
      <div className={styles.usersList}>
        <div className={styles.user}>
          <div className={styles.avatar}>
            <UserIcon />
          </div>
          {selectedCollection.userId.firstName}
        </div>

        {selectedCollection.users.map(u => <div key={u.id} className={styles.user}>
          {selectedCollection.userId.id === currentUser.id &&
          <div className={styles.remove} onClick={() => onRemoveUserClick(u.id)}><TimesIcon /></div>}
          <div className={styles.avatar}>
            <UserIcon />
          </div>
          {u.firstName}
        </div>)}

        {selectedCollection.userId.id === currentUser.id && <div className={styles.add} onClick={onAddUserClick}>
          <PlusIcon />
        </div>}
      </div>
    </div>
  )
})

export default Collection
