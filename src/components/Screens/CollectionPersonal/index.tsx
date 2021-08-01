import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { useMst } from "../../../models/RootStore"
import Card from "../Collection/components/Card"
import { ICollectionCard } from "../../../models/collections/CollectionCard"
import Icon from "../../Icon"
import { ColorsMap } from "../../../palette/colors"
import styles from "./styles.styl"
import ResizeIcon from "../../../assets/customIcons/resize.svg"
import SizeMenu from "../Collection/components/SizeMenu"
import classNames from "classnames"

type Size = "small" | "medium" | "big"

const CollectionPersonal = observer(() => {
  const {
    user,
    collectionsStore: { cards },
  } = useMst()

  const assignedCardsMap: Record<string, ICollectionCard[]> = {}
  cards.forEach(card => {
    if (card.assigned?.id !== user.id || card.status === "DONE") return
    const key = card.collection.id
    if (key in assignedCardsMap) assignedCardsMap[key].push(card)
    else assignedCardsMap[key] = [card]
  })

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
        <div className={styles.columns}>
          {Object.keys(assignedCardsMap).map(columnId => {
            const cards = assignedCardsMap[columnId]
            const column = cards[0].collection
            return (
              <div
                key={columnId}
                className={classNames({
                  [styles.column]: true,
                  [styles[size]]: true,
                })}
              >
                <div
                  className={styles.columnHead}
                  style={
                    {
                      "--columnColor": ColorsMap["green"],
                    } as CSSProperties
                  }
                >
                  <Icon name={column.icon} /> {column.name}
                </div>
                {cards.map(card => (
                  <Card card={card} key={card.id} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
export default CollectionPersonal
