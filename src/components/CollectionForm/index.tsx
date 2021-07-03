import React, { CSSProperties } from "react"
import styles from "./styles.styl"
import { observer } from "mobx-react"
import ReactDOM from "react-dom"
import TrashIcon from "../../assets/customIcons/trash.svg"
import TimesIcon from "../../assets/customIcons/times.svg"
import classNames from "classnames"
import { IRootStore, useMst } from "../../models/RootStore"
import { ColorsMap } from "../../palette/colors"
import { IconNames } from "../../palette/icons"
import Icon from "../Icon"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import AutosizeInput from "react-input-autosize"
import { useClickOutsideRefs } from "../../tools/hooks"
import ListColorMenu from "../ListColorMenu"

const CollectionTag = observer(({ tag }) => {
  const {collectionsStore: {deleteTag}}: IRootStore = useMst()
  const triggerRef = React.useRef(null)
  const menuRef = React.useRef(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  useClickOutsideRefs([triggerRef, menuRef], () => setMenuOpen(false))

  return <div className={styles.tag} style={{"--color": ColorsMap[tag.color]} as CSSProperties}>
    <AutosizeInput value={tag.name} onChange={e => tag.setName(e.target.value)} />
    <TrashIcon onClick={() => deleteTag(tag.id)} />
    <div className={styles.color} ref={triggerRef} onClick={() => setMenuOpen(true)} />
    {menuOpen &&
    <ListColorMenu triggerRef={triggerRef} menuRef={menuRef} currentColorName={tag.color} setColor={tag.setColor} /> }
  </div>
})

const CollectionForm = observer(
  ( ) => {
    const {
      collectionsStore: { selectEditingCollection, deleteCollection, editingCollection, createTag, moveTag },
    }: IRootStore = useMst()

    const collection = editingCollection

    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const [el] = React.useState(document.createElement("div"))
    React.useEffect(() => {
      document.querySelector("#modals")?.appendChild(el)
      return () => {
        document.querySelector("#modals")?.removeChild(el)
      }
    }, [])

    const onWrapperClick = e => {
      if (e.target !== wrapperRef.current) return
      selectEditingCollection(null)
    }

    const onDeleteClick = () => {
      deleteCollection(collection.id)
    }

    if (!collection) return <React.Fragment />

    const tags = [...collection.tags]
    tags.sort((a,b) => a.index - b.index)

    return ReactDOM.createPortal(
      <div className={styles.wrapper} ref={wrapperRef} onClick={onWrapperClick}>
        <div className={styles.modal}>
          <div
            className={classNames({
              [styles.modalPart]: true,
              [styles.head]: true,
            })}
          >
            <input value={collection.name} onChange={e => collection.setName(e.target.value)} />
            <div className={styles.actions}>
              <span className={styles.reject} onClick={() => selectEditingCollection(null)}>
                    <TimesIcon />
                  </span>
                <span className={styles.trash} onClick={onDeleteClick}>
                    <TrashIcon />
                  </span>
            </div>
          </div>
          <div className={styles.modalPart}>
            <div className={styles.group}>
              <div className={styles.name}>Иконка</div>
              <div className={styles.icons}>
                {IconNames.map(name => <div key={name} className={classNames({
                  [styles.block]: true,
                  [styles.active]: collection.icon === name
                })} onClick={() => collection.setIcon(name)}><Icon name={name} /></div>)}
              </div>
            </div>
            <div className={styles.group}>
              <div className={styles.head}>
                <div className={styles.name}>Тэги</div>
                <div className={styles.action}
                     onClick={() => createTag({collection: collection.id})}>
                  + Добавить тэг
                </div>
              </div>

              <DragDropContext onDragEnd={({ draggableId, destination }) => {
                if (!destination) return
                moveTag(draggableId, destination.index)
              }}>
                <Droppable droppableId={collection.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={styles.tags}
                    >
                      {tags.map(tag => <Draggable draggableId={tag.id} index={tag.index} key={tag.id}>
                        {(provided) =>
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <CollectionTag tag={tag} />
                          </div>
                        }
                      </Draggable>)}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>,
      el,
    )
  },
)

export default CollectionForm
