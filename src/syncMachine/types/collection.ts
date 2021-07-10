import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_COLLECTION,
  GET_COLLECTIONS,
  GET_UPDATED_COLLECTIONS,
  UPDATE_COLLECTION,
} from "../../graphql/collection"

export default class Collection extends SyncType {
  name = "Collection"

  UPDATE_MUTATION = UPDATE_COLLECTION
  DELETE_MUTATION = DELETE_COLLECTION
  GET_UPDATED = GET_UPDATED_COLLECTIONS

  PATH = "collectionsStore.collections"
  DATA_NAME = "updatedCollections"

  preprocess(item) {
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_COLLECTIONS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.collectionsStore.collections = result.data.collections.map(
        this.preprocess,
      )
      return snapshot
    }
  }
}
