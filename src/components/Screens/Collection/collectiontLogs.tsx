import { observer } from "mobx-react"
import { ICollectionLog } from "../../../models/collections/CollectionLog"
import React from "react"
import { Collection, getCollection } from "./index"

export const CollectionCreated = observer(
  ({ log }: { log: ICollectionLog }) => {
    const [collection, setCollection] = React.useState<Collection | null>(null)

    React.useEffect(() => {
      getCollection(log.collectionId).then(result => {
        setCollection(result.data.collection)
      })
    }, [log.collectionId])

    return (
      <div>
        <b>{log.user.firstName}</b> создал коллекцию
        <b>{collection?.name}</b>
      </div>
    )
  },
)

export const CollectionChanged = observer(
  ({ log }: { log: ICollectionLog }) => {
    const [collection, setCollection] = React.useState<Collection | null>(null)

    React.useEffect(() => {
      getCollection(log.collectionId).then(result => {
        setCollection(result.data.collection)
      })
    }, [log.collectionId])

    return (
      <div>
        <b>{log.user.firstName}</b> изменил коллекцию
        <b>{collection?.name}</b>
      </div>
    )
  },
)
