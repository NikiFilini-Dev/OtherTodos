import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App/index.jsx"
import RootStore, { Provider } from "./models/RootStore"
import jsonStorage from "tools/jsonStorage"
import migrations from "models/migrations"
import "./index.css"
import { persist } from "mst-persist"
import SyncMachine from "./syncMachine"
import { DateTime } from "luxon"
import BakaEditor from "./editor"
import { noop } from "lodash-es"

noop("EDITOR", BakaEditor)

if (!IS_WEB) {
  const Sentry = require("@sentry/electron")
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}

const DEBUG = process.env.P_ENV === "debug"
const rawUser = localStorage.getItem("user")
const data = {
  user: rawUser ? JSON.parse(rawUser) : null,
  screen: rawUser ? "TODAY" : "AUTH",
  selectedProject: null,
  selectedTag: null,
  selectedDate: DateTime.now().toFormat("M/d/yyyy"),
  tags: [],
  projects: [],
  tasks: { all: [] },
  events: [],
  habits: [],
  habitRecords: [],
}
const Store = RootStore.create(data)

window.getToken = (): string => {
  return Store.user?.token || ""
}

window.syncMachine = new SyncMachine(Store, !window.IS_WEB)

function hydrate() {
  if (!DEBUG) {
    console.log("HYDRATING")
    persist("root_store", Store, {
      storage: jsonStorage,
      blacklist: ["selectedProject", "screen"],
    })
      .then(() => {
        render()
        window.syncMachine.finishHydration()
      })
      .catch(err => console.error(err))
  } else {
    render()
  }
}

const getFields = obj => {
  const fields = {}
  Object.keys(obj).forEach(fieldName => {
    fields[fieldName] = {
      value: obj[fieldName],
      date: new Date(),
    }
  })
  return fields
}
const registerInitialData = store => {
  const taskType = window.syncMachine.getTypeByName("Task")
  if (!taskType) return
  store.tasks.all.forEach(task => {
    taskType.registerChange(getFields(task), task.id, false)
  })
  taskType.dumpUpdates()

  const projectType = window.syncMachine.getTypeByName("Project")
  if (!projectType) return
  store.projects.forEach(project => {
    projectType.registerChange(getFields(project), project.id, false)
  })
  projectType.dumpUpdates()

  const projectCategoryType = window.syncMachine.getTypeByName(
    "ProjectCategory",
  )
  if (!projectCategoryType) return
  store.categories?.forEach(category => {
    projectCategoryType.registerChange(getFields(category), category.id, false)
  })
  projectCategoryType.dumpUpdates()

  const tagType = window.syncMachine.getTypeByName("Tag")
  if (!tagType) return
  store.tags.forEach(tag => {
    tagType.registerChange(getFields(tag), tag.id, false)
  })
  tagType.dumpUpdates()

  const timelineEventType = window.syncMachine.getTypeByName("TimelineEvent")
  if (!timelineEventType) return
  store.events.forEach(event => {
    timelineEventType.registerChange(getFields(event), event.id, false)
  })
  timelineEventType.dumpUpdates()
}

const initStorage = async () => {
  let v = await jsonStorage.getItem("root_store")
  if (typeof v === "string") v = JSON.parse(v)

  if (!v || !Object.keys(v).length) {
    await jsonStorage.setItem("root_store", JSON.stringify(data))
    hydrate()
    return
  } else {
    if (v._storeVersion === 0) {
      v.tempTask = null
      v.events = []
    }

    v.events = v.events || []
    v.categories = v.categories || []
    migrations.forEach(migration => {
      if (migration.id <= v._storeVersion) return
      v = migration.up(v)
      console.log(migration)
      v._storeVersion = migration.id
    })

    const synced = await jsonStorage.getItem("synced")
    if (!synced.date) {
      await jsonStorage.setItem(
        `_root_store_[${DateTime.now().toFormat("D HH:mm")}]`,
        v,
      )
      registerInitialData(v)
    }

    v = window.syncMachine.healthCheck(v)
    await jsonStorage.setItem("root_store", JSON.stringify(v))
    hydrate()

    return true
  }
}

if (!IS_WEB) {
  initStorage()
} else {
  render()
}

function render() {
  window.syncMachine.loadAll(null)
  ReactDOM.render(
    <Provider value={Store}> {App} </Provider>,
    document.querySelector("#app"),
  )
}

window.Store = Store
