import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_TIMER_SESSION,
  GET_TIMER_SESSIONS,
  GET_UPDATED_TIMER_SESSIONS,
  UPDATE_TIMER_SESSION,
} from "../../graphql/timer_sessions"

export default class TimerSession extends SyncType {
  name = "TimerSession"

  UPDATE_MUTATION = UPDATE_TIMER_SESSION
  DELETE_MUTATION = DELETE_TIMER_SESSION
  GET_UPDATED = GET_UPDATED_TIMER_SESSIONS

  PATH = "timerSessions"
  DATA_NAME = "updatedTimerSessions"

  preprocess(item) {
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_TIMER_SESSIONS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.timerSessions = result.data.timerSessions.map(this.preprocess)
      return snapshot
    }
  }
}
