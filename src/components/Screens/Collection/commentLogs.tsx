import { observer } from "mobx-react"
import { ICollectionLog } from "../../../models/collections/CollectionLog"
import React from "react"
import { Card, Column, getCard, getColumn } from "./index"
import { IRootStore, useMst } from "../../../models/RootStore"
import styles from "./styles.styl"

export const CommentCreated = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)

  const {
    collectionsStore: { selectCard },
  }: IRootStore = useMst()

  const onCardClick = () => {
    selectCard(log.cardId)
  }

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
  }, [log.cardId])

  return (
    <div>
      <b>{log.user.firstName}</b> прокомментировал карточку{" "}
      <b className={styles.clickable} onClick={onCardClick}>
        {card?.name}
      </b>
    </div>
  )
})

export const CommentMentioned = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)

  const {
    collectionsStore: { selectCard },
  }: IRootStore = useMst()

  const onCardClick = () => {
    selectCard(log.cardId)
  }

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
  }, [log.cardId])

  return (
    <div>
      <b>{log.user.firstName}</b> упомянул вас в комментарии к карточке{" "}
      <b className={styles.clickable} onClick={onCardClick}>
        {card?.name}
      </b>
    </div>
  )
})

export const CommentChanged = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)

  const {
    collectionsStore: { selectCard },
  }: IRootStore = useMst()

  const onCardClick = () => {
    selectCard(log.cardId)
  }

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
  }, [log.cardId])

  return (
    <div>
      <b>{log.user.firstName}</b> изменил комментарий к карточке{" "}
      <b className={styles.clickable} onClick={onCardClick}>
        {card?.name}
      </b>
    </div>
  )
})

export const CommentDeleted = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)

  const {
    collectionsStore: { selectCard },
  }: IRootStore = useMst()

  const onCardClick = () => {
    selectCard(log.cardId)
  }

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
  }, [log.cardId])

  return (
    <div>
      <b>{log.user.firstName}</b> удалил комментарий к карточке{" "}
      <b className={styles.clickable} onClick={onCardClick}>
        {card?.name}
      </b>
    </div>
  )
})
