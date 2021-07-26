import { observer } from "mobx-react"
import { ICollectionLog } from "../../../models/collections/CollectionLog"
import React from "react"
import { Column, getColumn } from "./index"

export const ColumnCreated = observer(({ log }: { log: ICollectionLog }) => {
  const [column, setColumn] = React.useState<Column | null>(null)

  React.useEffect(() => {
    getColumn(log.columnId).then(result => {
      setColumn(result.data.collectionColumn)
    })
  }, [log.columnId])

  return (
    <div>
      <b>{log.user.firstName}</b> создал колонку <b>{column?.name}</b>
    </div>
  )
})

export const ColumnChanged = observer(({ log }: { log: ICollectionLog }) => {
  const [column, setColumn] = React.useState<Column | null>(null)

  React.useEffect(() => {
    getColumn(log.columnId).then(result => {
      setColumn(result.data.collectionColumn)
    })
  }, [log.columnId])

  return (
    <div>
      <b>{log.user.firstName}</b> изменил колонку <b>{column?.name}</b>
    </div>
  )
})

export const ColumnDeleted = observer(({ log }: { log: ICollectionLog }) => {
  const [column, setColumn] = React.useState<Column | null>(null)

  React.useEffect(() => {
    getColumn(log.columnId).then(result => {
      setColumn(result.data.collectionColumn)
    })
  }, [log.columnId])

  return (
    <div>
      <b>{log.user.firstName}</b> удалил колонку <b>{column?.name}</b>
    </div>
  )
})
