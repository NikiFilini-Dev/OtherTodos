import type { IRootStore } from "../models/RootStore"
import {
  addMiddleware,
  applySnapshot,
  getSnapshot,
  onPatch,
  SnapshotIn,
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
import Upload from "./types/upload"
import User from "./types/user"
import CardComment from "./types/card_comment"
import CollectionLog from "./types/collection_log"
const jwt = require("jsonwebtoken")

const syncLogger = createLogger("SYNC")

export default class SyncMachine {
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
  ]

  state = "initial"
  applying = false
  hydrated = true

  store: IRootStore

  sendTimer: NodeJS.Timeout | null = null
  sendTimeout = 1000

  loadTimer: NodeJS.Timeout | null = null
  loadTimeout = 1000

  constructor(Store: IRootStore, waitForHydration = false) {
    this.store = Store
    this.hydrated = !waitForHydration

    this.loadBase()

    this.hookCreate()
    this.hookUpdate()

    this.initWindowHooks()
  }

  generateToken(auth_id: string, secret: string) {
    return jwt.sign({ auth_id }, secret)
  }

  resetLoadTimer() {
    if (this.loadTimer !== null) clearTimeout(this.loadTimer)
    this.loadTimer = setTimeout(() => this.loadAll(), this.loadTimeout)
  }

  resetSendTimer() {
    if (this.sendTimer !== null) clearTimeout(this.sendTimer)
    this.sendTimer = setTimeout(() => this.updateAll(), this.sendTimeout)
  }

  getTypeByName(name: string) {
    return this.types.find(type => type.name === name)
  }

  finishHydration() {
    Promise.all(this.types.map(type => type.loadUpdates())).then(() => {
      this.hydrated = true
      syncLogger.debug("Hydration finished")
      this.resetLoadTimer()
    })
  }

  initWindowHooks() {
    window.addEventListener("blur", () => this.resetLoadTimer())
    window.addEventListener("focus", () => this.resetLoadTimer())
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
    snapshot.subtasks.forEach(subtask => {
      if (!snapshot.tasks.all.find(t => t.id === subtask.task)) {
        if (snapshot.tempTask?.id === subtask.task) return
        syncLogger.warn(
          "Subtask %s has invalid task ref %s",
          subtask.id,
          subtask.task,
        )
        trash.push(subtask.id)
      }
    })
    trash.forEach(id => {
      snapshot.subtasks.splice(
        snapshot.subtasks.findIndex(st => st.id === id),
        1,
      )
    })

    trash = []
    snapshot.habitRecords.forEach(record => {
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
      snapshot.habitRecords.splice(
        snapshot.habitRecords.findIndex(st => st.id === id),
        1,
      )
    })

    trash = []
    snapshot.timerSessions.forEach(session => {
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
      snapshot.timerSessions.splice(
        snapshot.timerSessions.findIndex(st => st.id === id),
        1,
      )
    })

    trash = []
    snapshot.collectionsStore.subtasks.forEach(subtask => {
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
      snapshot.collectionsStore.subtasks.splice(
        snapshot.collectionsStore.subtasks.findIndex(st => st.id === id),
        1,
      )
    })

    return snapshot
  }

  loadBase() {
    if (!window.getToken()) return
    syncLogger.info("Loading...")

    const promises = this.types.map(type => type.load())
    this.state = "loading"

    Promise.all(promises).then(
      results => {
        let snapshot = JSON.parse(JSON.stringify(getSnapshot(this.store)))
        results.forEach(func => {
          snapshot = func(snapshot)
        })
        snapshot = this.healthCheck(snapshot)
        this.applying = true
        applySnapshot(this.store, snapshot)
        this.store.healthCheck()
        this.applying = false
        this.state = "waiting"
        syncLogger.info("Loaded.")
      },
      reason => console.error(reason),
    )
  }

  loadAll() {
    if (!window.getToken()) return
    // if (this.state) syncLogger.info("Updating...")
    if (this.state === "loading" || this.state === "updating")
      return this.resetLoadTimer()

    this.state = "updating"
    Promise.all(
      this.types.map(type =>
        type.loadNew(JSON.parse(JSON.stringify(getSnapshot(this.store)))),
      ),
    ).then(
      newResults => {
        const oldSnapshot = JSON.stringify(getSnapshot(this.store))
        let snapshot = JSON.parse(oldSnapshot)
        newResults.forEach(f => {
          if (!f) return
          snapshot = f(snapshot)
        })
        snapshot = this.healthCheck(snapshot)
        this.applying = true
        applySnapshot(this.store, snapshot)
        this.store.user.refresh()
        this.store.healthCheck()
        this.applying = false
        this.state = "waiting"
        if (oldSnapshot !== JSON.stringify(getSnapshot(this.store)))
          syncLogger.info("Updated.")
        this.resetLoadTimer()
      },
      () => (this.state = "waiting"),
    )
  }

  updateAll() {
    if (!window.getToken()) return this.resetSendTimer()
    this.state = "sending updates"
    syncLogger.info("Sending updates...")
    const promises = this.types.map(type => type.sendUpdates())
    Promise.all(promises).then(() => {
      if (!IS_WEB) jsonStorage.setItem("synced", { date: new Date() })
      this.state = "updates send"
      syncLogger.info("Updates sent.")
      this.resetLoadTimer()
    })
  }

  registerDelete(id: string, typeName: string) {
    const type = this.types.find(
      type => type.name.toLowerCase() === typeName.toLowerCase(),
    )
    console.log(id, typeName, type)
    if (!type) {
      syncLogger.warn("TYPE %s NOT REGISTERED", typeName)
      return
    }

    type.registerDelete(id)
    this.resetSendTimer()
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
    let ignoreFields: string[] = []
    let renameFields: Record<string, string> = {}
    if (node.syncIgnore !== undefined)
      ignoreFields = [...ignoreFields, ...node.syncIgnore]
    if (node.syncRename !== undefined)
      renameFields = { ...renameFields, ...node.syncRename }
    console.log("Created", data, Object.keys(data), ignoreFields, renameFields)
    Object.keys(data).forEach(fieldName => {
      const fieldValue = data[fieldName]
      if (ignoreFields.includes(fieldName)) return
      if (fieldName in renameFields) fieldName = renameFields[fieldName]
      fields[fieldName] = {
        value: fieldValue,
        date: new Date(),
      }
      console.log(fieldName, "added")
    })
    syncLogger.info("Created fields: %s", JSON.stringify(fields))
    type.registerChange(fields, data.id)
    this.resetSendTimer()
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

  async getOne<T>(name: string, id: string): Promise<SnapshotIn<T> | false> {
    const type = this.types.find(type => type.name === name)
    if (!type) throw new Error("Cant load " + name)
    return await type.getOne<T>(id)
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

      let ignoreFields: string[] = []
      let renameFields: Record<string, string> = {}
      if (node.syncIgnore !== undefined)
        ignoreFields = [...ignoreFields, ...node.syncIgnore]
      if (node.syncRename !== undefined)
        renameFields = { ...renameFields, ...node.syncRename }

      node.getActionsMap()[call.name].forEach(fieldName => {
        const fieldValue = call.context[fieldName]
        if (ignoreFields.includes(fieldName)) return
        if (fieldName in renameFields) fieldName = renameFields[fieldName]

        fields[fieldName] = {
          date: new Date(),
          value: fieldValue,
        }
      })

      logger.debug("Actions %s invoked", call.name)
      syncLogger.info("Changed fields: %s", JSON.stringify(fields))

      type.registerChange(fields, call.context.id)
      this.resetSendTimer()
    }

    addMiddleware(this.store, (call, next) => {
      if (!this.applying) setTimeout(() => handler(call), 0)
      return next(call)
    })
  }
}
