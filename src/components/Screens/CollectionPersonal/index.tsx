import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { useMst } from "../../../models/RootStore"
import Card from "../Collection/components/Card"
import Icon from "../../Icon"
import { ColorsMap } from "../../../palette/colors"
import styles from "./styles.styl"
import ResizeIcon from "../../../assets/customIcons/resize.svg"
import SizeMenu from "../Collection/components/SizeMenu"
import classNames from "classnames"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd"
import EllipsisIcon from "../../../assets/line_awesome/ellipsis-v-solid.svg"
import ColumnOptions from "../Collection/components/ColumnOptions"
import AutosizeInput from "react-input-autosize"
import { useClickOutsideRefs } from "tools/hooks"

type Size = "small" | "medium" | "big"

const Column = observer(({ size, column: c, provided }) => {
  const cards = c.cards
  const column = c

  const triggerRef = React.useRef(null)
  const menuRef = React.useRef(null)

  const [menuShown, setMenuShown] = React.useState(false)
  useClickOutsideRefs([menuRef, triggerRef], () => setMenuShown(false))

  return (
    <div
      className={classNames({
        [styles.column]: true,
        [styles[size]]: true,
      })}
    >
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={styles.title}
        style={
          {
            "--columnColor": ColorsMap[c.color],
          } as CSSProperties
        }
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
          onClick={() => setMenuShown(!menuShown)}
        >
          <EllipsisIcon />
        </div>
        {menuShown && (
          <ColumnOptions
            column={column}
            triggerRef={triggerRef}
            menuRef={menuRef}
            assignedColumn
          />
        )}
      </div>
      <Droppable droppableId={c.id} type={"CARD"}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.scrollable}
          >
            <div className={styles.cards}>
              {cards.map((card, i) => (
                <Draggable draggableId={card.id} index={i} key={card.id}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card card={card} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  )
})

const AssignedColumn = observer(({ size }) => {
  const {
    user,
    collectionsStore: { cards: allCards, assignedColumns },
  } = useMst()

  let cardsInColumns: any[] = []
  assignedColumns.forEach(
    c => (cardsInColumns = [...cardsInColumns, ...c.cards]),
  )

  const cards = allCards.filter(card => {
    return (
      card.assigned?.id === user.id &&
      card.status !== "DONE" &&
      !cardsInColumns.includes(card)
    )
  })

  return (
    <div
      className={classNames({
        [styles.column]: true,
        [styles[size]]: true,
      })}
    >
      <div
        className={styles.title}
        style={
          {
            "--columnColor": ColorsMap["green"],
          } as CSSProperties
        }
      >
        <div className={styles.icon}>
          <Icon name={"bookmark"} />
        </div>
        <div className={styles.name}>Назначенные</div>
        <div className={styles.count}>{cards.length}</div>
      </div>
      <Droppable droppableId={"assigned"} type={"CARD"}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.scrollable}
          >
            <div className={styles.cards}>
              {cards.map((card, i) => (
                <Draggable draggableId={card.id} index={i} key={card.id}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card card={card} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  )
})

const CollectionPersonal = observer(() => {
  const {
    user,
    collectionsStore: {
      cards,
      assignedColumns,
      createAssignedColumn,
      moveAssignedColumn,
    },
  } = useMst()

  const sizeKey = "collectionCardSize#personal"
  const getSize = (): Size => {
    let size: Size = "medium"
    const saved = localStorage.getItem(sizeKey)
    if (saved && ["small", "medium", "big"].includes(saved))
      size = saved as Size
    return size
  }
  const [size, _setSize] = React.useState<Size>(getSize())
  const setSize = s => {
    _setSize(s)
    localStorage.setItem(sizeKey, s)
  }

  const [sizeMenuOpen, setSizeMenuOpen] = React.useState(false)
  const sizeTriggerRef = React.useRef(null)
  const sizeMenuRef = React.useRef(null)
  useClickOutsideRefs([sizeTriggerRef, sizeMenuRef], () => setSizeMenuOpen(false))

  const onDragEnd = ({
    draggableId,
    destination,
    type,
    source: { droppableId: sourceId },
  }: DropResult) => {
    console.log(draggableId, destination, type)
    if (!destination) return

    const { droppableId, index } = destination
    if (type === "COLUMN") {
      moveAssignedColumn(draggableId, index)
    }
    if (type === "CARD") {
      if (sourceId !== "assigned") {
        const source = assignedColumns.find(c => c.id === sourceId)
        source.removeCard(draggableId)
      }
      const column = assignedColumns.find(c => c.id === droppableId)
      column.insertCard(draggableId, index)
    }
  }

  const columns = [...assignedColumns]
  columns.sort((a, b) => a.index - b.index)

  return (
    <div className={styles.screenWrapper}>
      <div className={styles.screen}>
        <div className={styles.head}>
          <span>Назначенные мне задачи</span>
          <div className={styles.actions}>
            <div
              className={styles.actionTrigger}
              onClick={() => setSizeMenuOpen(!sizeMenuOpen)}
              ref={sizeTriggerRef}
            >
              <ResizeIcon />
            </div>
          </div>
        </div>
        {sizeMenuOpen && (
          <SizeMenu
            triggerRef={sizeTriggerRef}
            menuRef={sizeMenuRef}
            currentSize={size}
            setSize={setSize}
          />
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId={"assignedColumns"}
            direction={"horizontal"}
            type={"COLUMN"}
          >
            {provided => (
              <div
                className={styles.columns}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <AssignedColumn size={size} />
                {columns.map(c => (
                  <Draggable draggableId={c.id} index={c.index} key={c.id}>
                    {provided => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <Column column={c} size={size} provided={provided} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <div
                  onClick={() => createAssignedColumn({})}
                  className={styles.add}
                >
                  +
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
})
export default CollectionPersonal
