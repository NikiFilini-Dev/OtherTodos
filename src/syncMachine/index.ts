import type { IRootStore } from "../models/RootStore"
import {
  addMiddleware,
  applySnapshot,
  getSnapshot,
  onPatch,
} from "mobx-state-tree"
import pointer from "json-pointer"
import jsonStorage from "../tools/jsonStorage"

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

const syncLogger = createLogger("SYNC")

export default class SyncMachine {
  types: SyncType[] = [
    new Tag(),
    new TimelineEvent(),
    new ProjectCategory(),
    new Project(),
    new Task(),
    new Habit(),
    new HabitRecord(),
    new Subtask(),
    new TimerSession(),
    new Collection(),
    new CollectionColumn(),
    new CollectionTag(),
    new CollectionCard(),
    new CollectionSubtask(),
  ]

  state = "initial"
  applying = false
  hydrated = true

  timer: NodeJS.Timeout | null = null
  timeout = 1000

  interval: NodeJS.Timeout
  intervalTimeout = 1000 * 60 * 10

  store: IRootStore

  constructor(Store: IRootStore, waitForHydration = false) {
    this.store = Store
    this.hydrated = !waitForHydration

    this.loadAll(null)

    this.hookCreate()
    this.hookUpdate()

    this.initInterval()
    this.initWindowHooks()
  }

  getTypeByName(name: string) {
    return this.types.find(type => type.name === name)
  }

  finishHydration() {
    Promise.all(this.types.map(type => type.loadUpdates())).then(() => {
      this.hydrated = true
      syncLogger.debug("Hydration finished")
      this.resetTimer()
    })
  }

  initWindowHooks() {
    window.addEventListener("blur", () => this.loadAll(null))
    window.addEventListener("focus", () => this.loadAll(null))
  }

  initInterval() {
    if (this.interval) clearInterval(this.interval)
    this.interval = setInterval(() => {
      this.loadAll(null)
    }, this.intervalTimeout)
  }

  applyData(s: string) {
    applySnapshot(this.store, JSON.parse(s))
  }

  healthCheck(snapshot) {
    snapshot.tasks.all.forEach(task => {
      if (task.event && !snapshot.events.find(e => e.id === task.event)) {
        syncLogger.warn("Task %s has invalid event ref %s", task.id, task.event)
        task.event = null
      }
    })
    snapshot.events.forEach(event => {
      if (event.task && !snapshot.tasks.all.find(t => t.id === event.task)) {
        syncLogger.warn(
          "Event %s has invalid task ref %s",
          event.id,
          event.task,
        )
        event.task = null
      }
    })
    let trash: string[] = []
    snapshot.subtasks.forEach((subtask) => {
      if (!snapshot.tasks.all.find(t => t.id === subtask.task)) {
        syncLogger.warn(
          "Subtask %s has invalid task ref %s",
          subtask.id,
          subtask.task,
        )
        trash.push(subtask.id)
      }
    })
    trash.forEach(id => {
      snapshot.subtasks.splice(snapshot.subtasks.findIndex(st => st.id === id), 1)
    })

    trash = []
    snapshot.habitRecords.forEach((record) => {
      if (!snapshot.habits.find(h => h.id === record.habit)) {
        syncLogger.warn(
          "HabitRecord %s has invalid habit ref %s",
          record.id,
          record.habit,
        )
        trash.push(record.id)
      }
    })
    trash.forEach(id => {
      snapshot.habitRecords.splice(snapshot.habitRecords.findIndex(st => st.id === id), 1)
    })

    trash = []
    snapshot.timerSessions.forEach((session) => {
      if (!snapshot.tasks.all.find(h => h.id === session.task)) {
        syncLogger.warn(
          "TimerSession %s has invalid task ref %s",
          session.id,
          session.task,
        )
        trash.push(session.id)
      }
    })
    trash.forEach(id => {
      snapshot.timerSessions.splice(snapshot.timerSessions.findIndex(st => st.id === id), 1)
    })

    trash = []
    snapshot.collectionsStore.subtasks.forEach((subtask) => {
      if (!snapshot.collectionsStore.cards.find(t => t.id === subtask.card)) {
        syncLogger.warn(
          "CollectionSubtask %s has invalid card ref %s",
          subtask.id,
          subtask.card,
        )
        trash.push(subtask.id)
      }
    })
    trash.forEach(id => {
      snapshot.collectionsStore.subtasks.splice(snapshot.collectionsStore.subtasks.findIndex(st => st.id === id), 1)
    })

    return snapshot
  }

  loadAll(timer: NodeJS.Timeout | null) {
    if (!window.getToken()) return
    if (this.timer !== timer) return
    syncLogger.info("Loading...")

    const promises = this.types.map(type => type.load())
    if (this.timer !== timer) return
    this.timer = null

    Promise.all(promises).then(
      results => {
        let snapshot = JSON.parse(JSON.stringify(getSnapshot(this.store)))
        results.forEach(func => {
          snapshot = func(snapshot)
        })
        snapshot = this.healthCheck(snapshot)
        this.applying = true
        applySnapshot(this.store, snapshot)
        this.store.healthCheckSubtasks()
        this.applying = false
        this.state = "waiting"
        syncLogger.info("Loaded.")
      },
      reason => console.error(reason),
    )
  }

  updateAll() {
    if (!window.getToken()) return this.resetTimer()
    const timer = this.timer
    this.state = "sending updates"
    syncLogger.info("Sending updates...")
    const promises = this.types.map(type => type.sendUpdates())
    Promise.all(promises).then(() => {
      if (!IS_WEB) jsonStorage.setItem("synced", { date: new Date() })
      this.state = "updates send"
      syncLogger.info("Updates sent.")
      setTimeout(() => this.loadAll(timer), 1000)
    })
  }

  resetTimer() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => this.updateAll(), this.timeout)
  }

  registerDelete(id: string, typeName: string) {
    const type = this.types.find(
      type => type.name.toLowerCase() === typeName.toLowerCase(),
    )
    if (!type) {
      syncLogger.warn("TYPE %s NOT REGISTERED", typeName)
      return
    }

    type.registerDelete(id)
    this.resetTimer()
  }

  registerCreate(node) {
    if (!node.syncable) return

    const type = this.types.find(
      type => type.name.toLowerCase() === node.syncName.toLowerCase(),
    )
    if (!type) {
      syncLogger.warn("TYPE %s NOT REGISTERED", node.syncName)
      return
    }

    const data = node.toJSON()
    const fields = {}
    Object.keys(data).forEach(fieldName => {
      fields[fieldName] = {
        value: data[fieldName],
        date: new Date(),
      }
    })
    syncLogger.info("Created fields: %s", JSON.stringify(fields))
    type.registerChange(fields, data.id)
    this.resetTimer()
  }

  hookCreate() {
    onPatch(this.store, patch => {
      if (!this.hydrated || this.applying) return
      if (patch.op === "add") {
        const node = pointer.get(this.store, patch.path)
        if (!node.syncable) return
        if (
          typeof node.isReference == "function" &&
          node.isReference(patch.path)
        )
          return
        this.registerCreate(node)
      }
    })
  }

  hookUpdate() {
    const handler = call => {
      if (call.name === "getActionsMap" || call.name === "@APPLY_SNAPSHOT")
        return

      logger.info("Actions %s invoked", call.name)
      const node = call.context
      if (!this.hydrated || !node.syncName || !node.syncable) {
        return
      }

      const type = this.types.find(type => type.name === node.syncName)
      if (!type) {
        syncLogger.warn("TYPE %s NOT REGISTERED", type)
        return
      }
      const fields = {}

      node.getActionsMap()[call.name].forEach(fieldName => {
        fields[fieldName] = {
          date: new Date(),
          value: call.context[fieldName],
        }
      })

      logger.debug("Actions %s invoked", call.name)
      syncLogger.info("Changed fields: %s", JSON.stringify(fields))

      type.registerChange(fields, call.context.id)
      this.resetTimer()
    }

    addMiddleware(this.store, (call, next) => {
      if (!this.applying) setTimeout(() => handler(call), 0)
      return next(call)
    })
  }
}
