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
    if (item.date === "") item.date = null
    if (item.text === "") item.text = null
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
