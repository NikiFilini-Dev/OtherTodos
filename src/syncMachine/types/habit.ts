import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import { DELETE_HABIT, GET_HABITS, UPDATE_HABIT } from "../../graphql/habits"

export default class Habit extends SyncType {
  name = "Habit"

  UPDATE_MUTATION = UPDATE_HABIT
  DELETE_MUTATION = DELETE_HABIT

  preprocess(item) {
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_HABITS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.habits = result.data.habits.map(this.preprocess)
      return snapshot
    }
  }
}
