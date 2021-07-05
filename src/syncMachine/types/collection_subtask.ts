import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_COLLECTION_SUBTASK,
  GET_COLLECTION_SUBTASKS,
  UPDATE_COLLECTION_SUBTASK,
} from "../../graphql/collection_subtasks"

export default class CollectionSubtask extends SyncType {
  name = "CollectionSubtask"

  UPDATE_MUTATION = UPDATE_COLLECTION_SUBTASK
  DELETE_MUTATION = DELETE_COLLECTION_SUBTASK

  preprocess(item) {
    item = {...item}
    item.card = item.cardId
    // delete item.collectionId
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_COLLECTION_SUBTASKS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.collectionsStore.subtasks = result.data.collectionSubtasks.map(this.preprocess)
      return snapshot
    }
  }
}
