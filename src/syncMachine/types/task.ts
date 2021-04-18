import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import { DELETE_TASK, GET_TASKS, UPDATE_TASK } from "../../graphql/tasks"

export default class Task extends SyncType {
  name = "Task"

  UPDATE_MUTATION = UPDATE_TASK
  DELETE_MUTATION = DELETE_TASK

  preprocess(item) {
    if (item.project === "") item.project = null
    if (item.event === "") item.event = null
    if (item.category === "") item.category = null
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_TASKS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.tasks.all = result.data.tasks.map(this.preprocess)
      return snapshot
    }
  }
}
