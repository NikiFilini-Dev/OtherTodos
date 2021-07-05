import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_COLLECTION_CARD,
  GET_COLLECTION_CARDS,
  UPDATE_COLLECTION_CARD,
} from "../../graphql/collection_cards"

export default class CollectionCard extends SyncType {
  name = "CollectionCard"

  UPDATE_MUTATION = UPDATE_COLLECTION_CARD
  DELETE_MUTATION = DELETE_COLLECTION_CARD

  preprocess(item) {
    item = {...item}
    if (item.date === "") item.date = null
    if (item.text === "") item.text = null
    if (item.preview === "") item.preview = null
    if (item.task === "") item.task = null
    if (item.assigned === "") item.assigned = null
    item.collection = item.collectionId
    item.column = item.columnId
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_COLLECTION_CARDS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.collectionsStore.cards = result.data.collectionCards.map(this.preprocess)
      return snapshot
    }
  }
}
