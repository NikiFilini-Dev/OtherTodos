import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_TIMELINE_EVENT,
  GET_TIMELINE_EVENTS,
  GET_UPDATED_TIMELINE_EVENTS,
  UPDATE_TIMELINE_EVENT,
} from "../../graphql/timeline"
import { DateTime } from "luxon"

export default class TimelineEvent extends SyncType {
  name = "TimelineEvent"

  UPDATE_MUTATION = UPDATE_TIMELINE_EVENT
  DELETE_MUTATION = DELETE_TIMELINE_EVENT
  GET_UPDATED = GET_UPDATED_TIMELINE_EVENTS

  PATH = "events"
  DATA_NAME = "updatedTimelineEvents"

  preprocess(item) {
    if (item.task === "") item.task = null
    if (item.tag === "") item.tag = null
    if (item.date.length > 15)
      item.date = DateTime.fromISO(item.date).toFormat("M/d/yyyy")
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_TIMELINE_EVENTS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.events = result.data.timelineEvents.map(this.preprocess)
      return snapshot
    }
  }
}
