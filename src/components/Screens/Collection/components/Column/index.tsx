import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { ICollectionColumn } from "../../../../../models/collections/CollectionColumn"
import Card from "../Card"
import styles from "./styles.styl"
import { ColorsMap } from "../../../../../palette/colors"
import SmileysIcon from "../../../../../assets/customIcons/smileys.svg"
import AngleIcon from "../../../../../assets/line_awesome/angle-down-solid.svg"
import TrashIcon from "../../../../../assets/customIcons/trash.svg"
import { Draggable, DraggableProvidedDragHandleProps, Droppable } from "react-beautiful-dnd"
import { IRootStore, useMst } from "../../../../../models/RootStore"
import AutosizeInput from "react-input-autosize"
import ListColorMenu from "../../../../ListColorMenu"
import { useClickOutsideRefs } from "../../../../../tools/hooks"

const Column = observer(({
                           column,
                           handleProps,
                         }: { column: ICollectionColumn, handleProps?: DraggableProvidedDragHandleProps }) => {
  const {collectionsStore: {createCard, selectCard, deleteColumn}}: IRootStore = useMst()
  const cards = [...column.cards]
  cards.sort((a,b) => a.index - b.index)

  const onCreateClick = () => {
    const id = createCard({collection: column.collection.id, column: column.id, name: "Без названия"})
    selectCard(id)
  }

  const triggerRef = React.useRef(document.createElement("div"))
  const menuRef = React.useRef(null)
  const [menuShown, setMenuShown] = React.useState(false)

  useClickOutsideRefs([triggerRef, menuRef], () => setMenuShown(false))

  return <div className={styles.column}>
    <div className={styles.title}
         style={{ "--columnColor": ColorsMap[column.color] } as CSSProperties} {...handleProps}>
      <AutosizeInput value={column.name} onChange={e => column.setName(e.target.value)} inputClassName={styles.name} />
      <div className={styles.deleteTrigger} onClick={() => deleteColumn(column.id)}>
        <TrashIcon  />
      </div>
      <div className={styles.count}>{column.cards.length}</div>
      <div className={styles.colorTrigger} ref={triggerRef} onClick={() => setMenuShown(true)}>
        <AngleIcon />
      </div>
      {menuShown && <ListColorMenu setColor={column.setColor}
                                   currentColorName={column.color} triggerRef={triggerRef} menuRef={menuRef} />}
    </div>
    <Droppable droppableId={column.id} type={"CARD"}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={styles.cards}
        >
          {cards.map(card => (
            <Draggable draggableId={card.id} index={card.index} key={card.id}>
              {(provided) =>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <Card card={card} />
                </div>
              }
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
    {column.cards.length > 0 && <div className={styles.add} onClick={onCreateClick}>+ Добавить карточку</div>}
    {column.cards.length === 0 && <div className={styles.add} onClick={onCreateClick}>
      <span>+ Добавить карточку</span>
      <SmileysIcon />
      <span className={styles.big}>Карточки отсутствуют</span>
      <span>Перетащите сюда,<br /> чтобы добавить</span>
    </div>}
  </div>
})

export default Column