import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_SUBTASK,
  GET_SUBTASKS,
  GET_UPDATED_SUBTASKS,
  UPDATE_SUBTASK,
} from "../../graphql/subtasks"

export default class Subtask extends SyncType {
  name = "Subtask"

  UPDATE_MUTATION = UPDATE_SUBTASK
  DELETE_MUTATION = DELETE_SUBTASK
  GET_UPDATED = GET_UPDATED_SUBTASKS

  PATH = "subtasks"
  DATA_NAME = "updatedSubtasks"

  preprocess(item) {
    if (item.closedAt === "") item.closedAt = null
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_SUBTASKS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.subtasks = result.data.subtasks.map(this.preprocess)
      return snapshot
    }
  }
}
