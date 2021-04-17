import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_PROJECT,
  GET_PROJECTS,
  UPDATE_PROJECT,
} from "../../graphql/projects"
import { DELETE_TAG, GET_TAGS, UPDATE_TAG } from "../../graphql/tags"
import {
  DELETE_TIMELINE_EVENT,
  GET_TIMELINE_EVENTS,
  UPDATE_TIMELINE_EVENT,
} from "../../graphql/timeline"

export default class TimelineEvent extends SyncType {
  name = "TimelineEvent"

  UPDATE_MUTATION = UPDATE_TIMELINE_EVENT
  DELETE_MUTATION = DELETE_TIMELINE_EVENT

  preprocess(item) {
    if (item.task === "") item.task = null
    if (item.tag === "") item.tag = null
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
