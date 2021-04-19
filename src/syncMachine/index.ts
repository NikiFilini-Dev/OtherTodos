import type { IRootStore } from "../models/RootStore"
import {
  addMiddleware,
  applySnapshot,
  getSnapshot,
  onPatch,
} from "mobx-state-tree"
import pointer from "json-pointer"
import Task from "./types/task"
import SyncType from "./syncType"
import Project from "./types/project"
import ProjectCategory from "./types/project_category"
import TimelineEvent from "./types/timeline_event"
import Tag from "./types/tag"
import jsonStorage from "../tools/jsonStorage"

const syncLogger = createLogger("SYNC")

export default class SyncMachine {
  types: SyncType[] = [
    new Tag(),
    new TimelineEvent(),
    new ProjectCategory(),
    new Project(),
    new Task(),
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
        this.applying = true
        applySnapshot(this.store, snapshot)
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
    const type = this.types.find(type => type.name === typeName)
    if (!type) {
      syncLogger.warn("TYPE %s NOT REGISTERED", typeName)
      return
    }

    type.registerDelete(id)
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

        const type = this.types.find(type => type.name === node.syncName)
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

        type.registerChange(fields, data.id)
        this.resetTimer()
      }
    })
  }

  hookUpdate() {
    const handler = call => {
      logger.info("Actions %s invoked", call.name, call)
      const node = call.context
      if (
        !this.hydrated ||
        call.name === "getActionsMap" ||
        call.name === "@APPLY_SNAPSHOT" ||
        !node.syncName ||
        !node.syncable
      ) {
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

      type.registerChange(fields, call.context.id)
      this.resetTimer()
    }

    addMiddleware(this.store, (call, next) => {
      if (!this.applying) setTimeout(() => handler(call), 0)
      return next(call)
    })
  }
}
