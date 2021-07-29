import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { useMst } from "../../../models/RootStore"
import Card from "../Collection/components/Card"
import { ICollectionCard } from "../../../models/collections/CollectionCard"
import Icon from "../../Icon"
import { ColorsMap } from "../../../palette/colors"
import styles from "./styles.styl"

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

  return (
    <div className={styles.screenWrapper}>
      <div className={styles.screen}>
        <div className={styles.head}>Назначенные мне задачи</div>
        <div className={styles.columns}>
          {Object.keys(assignedCardsMap).map(columnId => {
            const cards = assignedCardsMap[columnId]
            const column = cards[0].collection
            return (
              <div key={columnId} className={styles.column}>
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
