import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { ICollectionCard } from "../../../../../models/collections/CollectionCard"
import styles from "./styles.styl"
import { IRootStore, useMst } from "../../../../../models/RootStore"
import classNames from "classnames"
import CheckboxIcon from "../../../../../assets/customIcons/checkmark.svg"
import { DateTime } from "luxon"
import Icon from "../../../../Icon"
import { ColorsMap } from "../../../../../palette/colors"

const Card = observer(({ card }: {card: ICollectionCard}) => {
  const { collectionsStore: { selectCard } }: IRootStore = useMst()
  const tags = [...card.tags]
  tags.sort((a,b) => a.index - b.index)
  return <div className={classNames({
    [styles.done]: card.status === "DONE",
    [styles.card]: true
  })} onClick={() => selectCard(card.id)}>
    {card.status === "DONE" && <div className={styles.done}><CheckboxIcon /> Завершена</div>}
    <div className={styles.title}>{card.name}</div>
    {card.text !== null && <div className={styles.description}>{card.text}</div>}
    {card.subtasks.length > 0 && <div className={styles.progressWrapper}>
      {card.doneSubtasks.length}/{card.subtasks.length}
      <div className={styles.progress} style={{"--donePercent": `${card.donePercent}%`} as CSSProperties} />
    </div>}
    {!!(card.date !== null || tags.length) && <div className={styles.separator} /> }
    {tags.length > 0 && <div className={styles.tags}>
      {tags.map(tag => (
        <div className={styles.tag} style={{"--color": ColorsMap[tag.color]} as CSSProperties}
             key={"card_tag_"+tag.id}>{tag.name}</div>
      ))}
    </div>}
    {card.date !== null && <div className={styles.bottom}>
      {card.date === DateTime.now().toFormat("M/d/yyyy") && (
        <div className={classNames({[styles.date]: true, [styles.today]: true})}><Icon name={"time"} /> Сегодня</div>
      )}
      {card.date !== DateTime.now().toFormat("M/d/yyyy") && (
        <div className={classNames({
          [styles.date]: true,
          [styles.expired]: DateTime.fromFormat(card.date, "M/d/yyyy") < DateTime.now()
        })}><Icon name={"time"} />{DateTime.fromFormat(card.date, "M/d/yyyy").toFormat("dd LLL, yyyy")}</div>
      )}
    </div> }
  </div>
})

export default Card