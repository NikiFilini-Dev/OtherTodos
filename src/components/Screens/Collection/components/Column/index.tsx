import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { ICollectionColumn } from "../../../../../models/collections/CollectionColumn"
import Card from "../Card"
import styles from "./styles.styl"
import { ColorsMap } from "../../../../../palette/colors"
import SmileysIcon from "../../../../../assets/customIcons/smileys.svg"
import EllipsisIcon from "../../../../../assets/line_awesome/ellipsis-v-solid.svg"
import {
  Draggable,
  DraggableProvidedDragHandleProps,
  Droppable,
} from "react-beautiful-dnd"
import { IRootStore, useMst } from "../../../../../models/RootStore"
import AutosizeInput from "react-input-autosize"
import {
  useClickOutsideRef,
  useClickOutsideRefs,
} from "../../../../../tools/hooks"
import ColumnOptions from "../ColumnOptions"
import Icon from "../../../../Icon"
import FloatPlus from "../FloatPlus"
import classNames from "classnames"
import TextareaAutosize from "react-textarea-autosize"

type Props = {
  column: ICollectionColumn
  handleProps?: DraggableProvidedDragHandleProps
  size: "small" | "big" | "medium"
}

const NewCard = observer(({ newCardIndex, onSubmit }) => {
  const [name, setName] = React.useState("")

  const onNewCardKeyDown = e => {
    if (e.key !== "Enter") return
    e.preventDefault()
    onSubmit(name)
  }

  const newCardRef = React.useRef(null)
  useClickOutsideRef(newCardRef, () => {
    if (newCardIndex < 0) return
    onSubmit(name)
  })

  return (
    <div className={styles.newCard} ref={newCardRef}>
      <TextareaAutosize
        placeholder={"Название карточки"}
        value={name}
        autoFocus
        onKeyDown={onNewCardKeyDown}
        onChange={e => setName((e.target as HTMLTextAreaElement).value)}
      />
    </div>
  )
})

const Column = observer(({ column, handleProps, size }: Props) => {
  const {
    collectionsStore: {
      createCard,
      userFilter,
      userFilterEnabled,
      createColumn,
      moveColumn,
      filter,
    },
  }: IRootStore = useMst()
  let cards = [...column.cards]
  if (userFilterEnabled) cards = cards.filter(c => c.assigned === userFilter)
  if (filter.onlyOnDate) cards = cards.filter(c => c.date === filter.onlyOnDate)
  if (filter.onlyInStatus === "DONE")
    cards = cards.filter(c => c.status === "DONE")
  if (filter.onlyInStatus === "NOT_DONE")
    cards = cards.filter(c => c.status !== "DONE")
  if (filter.onlyWithTags.length)
    cards = cards.filter(c => {
      return !filter.onlyWithTags.filter(t => !c.tags.includes(t)).length
    })
  if (filter.onlyWithWatcher)
    cards = cards.filter(c => c.watchers.includes(filter.onlyWithWatcher))

  cards.sort((a, b) => a.index - b.index)

  const triggerRef = React.useRef(document.createElement("div"))
  const menuRef = React.useRef(null)
  const [menuShown, setMenuShown] = React.useState(false)

  useClickOutsideRefs([triggerRef, menuRef], () => setMenuShown(false))

  const [newCardIndex, setNewCardIndex] = React.useState(-1)

  const showNewCard = (index: number) => {
    setNewCardIndex(index)
  }

  const submitNewCard = name => {
    if (name) {
      createCard({
        index: newCardIndex,
        name: name,
        nameOriginal: name,
        collection: column.collection.id,
        column: column.id,
        assigned: userFilter?.id,
      })
    }
    setNewCardIndex(-1)
  }

  const onAddColumnClick = (index: number) => {
    const id = createColumn({ collection: column.collection.id })
    moveColumn(id, index)
  }

  return (
    <div className={classNames(styles.column, styles[size])}>
      <div
        className={styles.title}
        title={`${column.name} #${column.index} - ${column.id}`}
        style={{ "--columnColor": ColorsMap[column.color] } as CSSProperties}
        {...handleProps}
      >
        <div className={styles.icon}>
          <Icon name={column.icon} />
        </div>
        <AutosizeInput
          value={column.name}
          onChange={e => column.setName(e.target.value)}
          inputClassName={styles.name}
        />
        <div className={styles.count}>{column.cards.length}</div>
        <div
          className={styles.colorTrigger}
          ref={triggerRef}
          onClick={() => setMenuShown(true)}
        >
          <EllipsisIcon />
        </div>
        <FloatPlus onClick={() => showNewCard(0)} className={styles.floater} />
        <FloatPlus
          onClick={() => onAddColumnClick(column.index + 1)}
          className={styles.floaterVertical}
        />
        {menuShown && (
          <ColumnOptions
            column={column}
            triggerRef={triggerRef}
            menuRef={menuRef}
          />
        )}
      </div>

      <Droppable droppableId={column.id} type={"CARD"}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.scrollable}
          >
            <div className={styles.cards}>
              {cards.map(card => (
                <React.Fragment key={card.id}>
                  {card.index === newCardIndex && (
                    <NewCard
                      newCardIndex={newCardIndex}
                      onSubmit={name => submitNewCard(name)}
                    />
                  )}
                  <Draggable draggableId={card.id} index={card.index}>
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card
                          card={card}
                          onPlusClick={() => showNewCard(card.index + 1)}
                        />
                      </div>
                    )}
                  </Draggable>
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
            {(column.cards[column.cards.length - 1]?.index + 1 || 0) ===
              newCardIndex && (
              <NewCard newCardIndex={newCardIndex} onSubmit={submitNewCard} />
            )}
            {cards.length > 0 && (
              <div
                className={styles.add}
                onClick={() =>
                  showNewCard(column.cards[column.cards.length - 1]?.index + 1)
                }
              >
                + Добавить карточку
              </div>
            )}
            {cards.length === 0 && (
              <div className={styles.add} onClick={() => showNewCard(0)}>
                <span>+ Добавить карточку</span>
                <SmileysIcon />
                <span className={styles.big}>Карточки отсутствуют</span>
                <span>
                  Перетащите сюда,
                  <br /> чтобы добавить
                </span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
})

export default Column
