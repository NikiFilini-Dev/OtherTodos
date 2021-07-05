import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_COLLECTION_COLUMN,
  GET_COLLECTION_COLUMNS,
  UPDATE_COLLECTION_COLUMN,
} from "../../graphql/collection_columns"

export default class CollectionColumn extends SyncType {
  name = "CollectionColumn"

  UPDATE_MUTATION = UPDATE_COLLECTION_COLUMN
  DELETE_MUTATION = DELETE_COLLECTION_COLUMN

  preprocess(item) {
    item = {...item}
    if (item.icon === "") delete item.icon
    item.collection = item.collectionId
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_COLLECTION_COLUMNS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.collectionsStore.columns = result.data.collectionColumns.map(this.preprocess)
      return snapshot
    }
  }
}
