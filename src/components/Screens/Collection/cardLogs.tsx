import { observer } from "mobx-react"
import { ICollectionLog } from "../../../models/collections/CollectionLog"
import React from "react"
import { Card, Column, getCard, getColumn } from "./index"

export const CardMoved = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)
  const [column, setColumn] = React.useState<Column | null>(null)

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
    getColumn(log.columnId).then(result => {
      setColumn(result.data.collectionColumn)
    })
  }, [log.columnId, log.cardId])

  return (
    <div>
      <b>{log.user.firstName}</b> перенес карточку <b>{card?.name}</b> в колонку{" "}
      <b>{column?.name}</b>
    </div>
  )
})

export const CardCreated = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
  }, [log.columnId])

  return (
    <div>
      <b>{log.user.firstName}</b> создал карточку <b>{card?.name}</b>
    </div>
  )
})

export const CardChanged = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
  }, [log.columnId])

  return (
    <div>
      <b>{log.user.firstName}</b> изменил карточку <b>{card?.name}</b>
    </div>
  )
})

export const CardDeleted = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
  }, [log.columnId])

  return (
    <div>
      <b>{log.user.firstName}</b> удалил карточку <b>{card?.name}</b>
    </div>
  )
})

export const CardComplete = observer(({ log }: { log: ICollectionLog }) => {
  const [card, setCard] = React.useState<Card | null>(null)

  React.useEffect(() => {
    getCard(log.cardId).then(result => {
      setCard(result.data.collectionCard)
    })
  }, [log.columnId])

  return (
    <div>
      <b>{log.user.firstName}</b> завершил карточку <b>{card?.name}</b>
    </div>
  )
})
