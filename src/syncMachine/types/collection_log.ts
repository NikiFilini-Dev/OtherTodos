import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  GET_COLLECTION_LOGS,
  GET_NEW_COLLECTION_LOGS,
} from "../../graphql/collection_logs"

export default class CollectionLog extends SyncType {
  name = "CollectionSubtask"

  GET_UPDATED = GET_NEW_COLLECTION_LOGS

  PATH = "collectionsStore.logs"
  DATA_NAME = "newCollectionLogs"

  preprocess(item) {
    item = { ...item }

    // item.card = item.cardId
    // item.column = item.columnId
    // item.collection = item.collectionId
    item.user = item.userId
    item.deletedAt = "0001-01-01T00:00:00.000Z"

    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_COLLECTION_LOGS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.collectionsStore.logs = result.data.collectionLogs.map(
        this.preprocess,
      )
      return snapshot
    }
  }
}
