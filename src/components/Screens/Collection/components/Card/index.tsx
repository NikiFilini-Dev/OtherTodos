import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { ICollectionCard } from "models/collections/CollectionCard"
import styles from "./styles.styl"
import { IRootStore, useMst } from "models/RootStore"
import classNames from "classnames"
import CheckboxIcon from "assets/customIcons/checkmark.svg"
import ChatIcon from "assets/customIcons/chat.svg"
import AttachmentIcon from "assets/customIcons/attachment.svg"
import { DateTime } from "luxon"
import Icon from "../../../../Icon"
import { ColorsMap } from "palette/colors"
import FloatPlus from "../FloatPlus"
import Avatar from "../../../../Avatar"

const Card = observer(({ card, onPlusClick }: {card: ICollectionCard, onPlusClick: () => void}) => {
  const { collectionsStore: { selectCard } }: IRootStore = useMst()
  const tags = [...card.tags]
  tags.sort((a,b) => a.index - b.index)

  const bottomVisible = card.date !== null || card.comments.length > 0 || card.files.length > 0

  return <div className={classNames({
    [styles.done]: card.status === "DONE",
    [styles.card]: true
  })} onClick={() => selectCard(card.id)}>
    {card.status === "DONE" && <div className={styles.done}><CheckboxIcon /> Завершено</div>}
    {card.preview !== null && <img src={card.preview.url} className={styles.preview} />}
    <div className={styles.title}>
      {/*<span className={styles.text} dangerouslySetInnerHTML={{__html: `${card.index}. ${card.name}`}} />*/}
      <span className={styles.text} dangerouslySetInnerHTML={{__html: card.name}} />
      {!!card.assigned && <div className={styles.avatar}>
        <Avatar size={"24px"} user={card.assigned} />
      </div>}
    </div>
    {card.text !== null && <div className={styles.description} dangerouslySetInnerHTML={{__html: card.text}} />}
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
    {bottomVisible && <div className={styles.bottom}>
      {card.files.length > 0 && (
        <div className={styles.count}><AttachmentIcon /> {card.files.length}</div>
      )}
      {card.comments.length > 0 && (
        <div className={styles.count}><ChatIcon /> {card.comments.length}</div>
      )}
      {card.date === DateTime.now().toFormat("M/d/yyyy") && (
        <div className={classNames({[styles.date]: true, [styles.today]: true})}><Icon name={"time"} /> Сегодня</div>
      )}
      {card.date && card.date !== DateTime.now().toFormat("M/d/yyyy") && (
        <div className={classNames({
          [styles.date]: true,
          [styles.expired]: DateTime.fromFormat(card.date, "M/d/yyyy") < DateTime.now()
        })}><Icon name={"time"} />{DateTime.fromFormat(card.date, "M/d/yyyy").toFormat("dd LLL, yyyy")}</div>
      )}
    </div> }
    <FloatPlus onClick={onPlusClick} className={styles.floater} />
  </div>
})

export default Card