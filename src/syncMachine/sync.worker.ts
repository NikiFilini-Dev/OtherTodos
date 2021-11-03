import Task from "./types/task"
import SyncType from "./syncType"
import Project from "./types/project"
import ProjectCategory from "./types/project_category"
import TimelineEvent from "./types/timeline_event"
import Tag from "./types/tag"
import Habit from "./types/habit"
import HabitRecord from "./types/habit_record"
import Subtask from "./types/subtask"
import TimerSession from "./types/timer_session"
import Collection from "./types/collection"
import CollectionCard from "./types/collection_card"
import CollectionColumn from "./types/collection_column"
import CollectionTag from "./types/collection_tag"
import CollectionSubtask from "./types/collection_subtask"
import Upload from "./types/upload"
import User from "./types/user"
import CardComment from "./types/card_comment"
import CollectionLog from "./types/collection_log"
import AssignedColumn from "./types/assigned_column"
import { flatten } from "lodash"

const ctx: Worker = self as any

const syncLogger = createLogger("SYNC_WORKER")

let token = ""
// @ts-ignore
ctx.getToken = () => token
// @ts-ignore
ctx.setToken = val => (token = val)
// @ts-ignore
ctx.window = self

class SyncMachine {
  types: SyncType[] = [
    new User(),
    new Tag(),
    new TimelineEvent(),
    new ProjectCategory(),
    new Project(),
    new Task(),
    new Habit(),
    new HabitRecord(),
    new Subtask(),
    new TimerSession(),
    new Upload(),
    new CardComment(),
    new Collection(),
    new CollectionColumn(),
    new CollectionTag(),
    new CollectionCard(),
    new CollectionSubtask(),
    new CollectionLog(),
    new AssignedColumn(),
  ]

  state = "initial"

  loadBase(snapshot: any) {
    syncLogger.info("Loading...")
    const promises = this.types.map(type => type.load())
    this.state = "loading"
    Promise.all(promises)
      .then(
        results => {
          results.forEach(func => (snapshot = func(snapshot)))
        },
        reason => console.error(reason),
      )
      .then(() => {
        postMessage({ snapshot })
      })
  }

  loadNew(oldSnapshot) {
    syncLogger.info("Updating...")
    this.state = "updating"
    Promise.all(this.types.map(type => type.loadNew(oldSnapshot))).then(
      newResults => {
        const snapshot = JSON.parse(JSON.stringify(oldSnapshot))
        const patches: any[] = []
        newResults.forEach(f => {
          if (!f) return
          f(snapshot).forEach(p => patches.push(p))
        })
        this.state = "waiting"
        console.log("Patches:", patches)
        if (patches.length) {
          postMessage({ event: "loadedNew", patches })
        } else {
          postMessage({ event: "loadedNew" })
        }
      },
      () => {
        this.state = "waiting"
        postMessage({ event: "loadedNew[error]" })
      },
    )
  }

  updateAll() {
    this.state = "sending updates"
    syncLogger.info("Sending updates...")
    const promises = this.types.map(type => type.sendUpdates())
    Promise.all(promises).then(() => {
      this.state = "updates send"
      syncLogger.info("Updates sent.")
    })
  }

  registerDelete(id: string, typeName: string) {
    const type = this.types.find(
      type => type.name.toLowerCase() === typeName.toLowerCase(),
    )

    type?.registerDelete(id)
  }

  registerChange(id: string, typeName: string, fields: any) {
    const type = this.types.find(
      type => type.name.toLowerCase() === typeName.toLowerCase(),
    )

    type?.registerChange(fields, id)
  }

  setLastLoadAt(newDate: Date) {
    this.types.forEach(t => (t.lastLoadAt = newDate))
  }
}

const sm = new SyncMachine()
onmessage = ({ data: { event, data } }) => {
  if (event === "loadNew") sm.loadNew(data)
  if (event === "loadBase") sm.loadBase(data)
  if (event === "updateAll") sm.updateAll()
  if (event === "registerDelete") sm.registerDelete(data.id, data.type)
  if (event === "registerChange")
    sm.registerChange(data.id, data.type, data.fields)
  if (event === "registerCreate")
    sm.registerChange(data.id, data.type, data.fields)
  // @ts-ignore
  if (event === "token") ctx.setToken(data)
  if (event === "setLastLoadAt") {
    console.log("Last load at got:", data)
    sm.setLastLoadAt(new Date(JSON.parse(data.lastLoadAt)))
  }
}
