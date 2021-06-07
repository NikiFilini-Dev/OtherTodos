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
import CollectionsStore from "./models/collections/CollectionsStore"

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
  collectionsStore: CollectionsStore.create({
    collections: [{
      id: "05e4b4c4-6de2-4aea-88bc-16c9d354ab7e",
      name: "First collection"
    }, {
      id: "05e4b4c5-6de2-4aea-88bc-16c9d354ab7e",
      name: "Second collection"
    }],

    columns: [{
      id: "534a3193-adf0-411d-b551-e89404064ed5",
      name: "First column",
      color: "blue",
      index: 0,
      collection: "05e4b4c4-6de2-4aea-88bc-16c9d354ab7e"
    }, {
      id: "8586aefc-4748-462a-9537-f76320907daa",
      name: "Second column",
      color: "green",
      index: 1,
      collection: "05e4b4c4-6de2-4aea-88bc-16c9d354ab7e"
    }, {
      id: "8bb799ae-c12e-49c4-a7af-bcc5ad2dacb6",
      name: "Third column",
      color: "yellow",
      index: 2,
      collection: "05e4b4c4-6de2-4aea-88bc-16c9d354ab7e"
    }],

    cards: [{
      id: "e6cc3092-0754-48ab-bce9-45b29131067e",
      name: "First card",
      text: null,
      column: "534a3193-adf0-411d-b551-e89404064ed5",
      collection: "05e4b4c4-6de2-4aea-88bc-16c9d354ab7e",
      index: 0,
      date: "6/8/2021"
    }, {
      id: "efd281b1-3b0e-4444-9c1c-8fee25025358",
      name: "Second card",
      text: "Detailed description",
      column: "534a3193-adf0-411d-b551-e89404064ed5",
      collection: "05e4b4c4-6de2-4aea-88bc-16c9d354ab7e",
      index: 1,
      date: "6/7/2021",
    }, {
      id: "9245ac8b-f138-4838-96b1-3c35bb8da074",
      name: "Third card",
      text: null,
      column: "8586aefc-4748-462a-9537-f76320907daa",
      collection: "05e4b4c4-6de2-4aea-88bc-16c9d354ab7e",
      index: 0,
      status: "DONE",
      date: "6/6/2021"
    }],

    subtasks: [],

    selectedCollection: "05e4b4c4-6de2-4aea-88bc-16c9d354ab7e"
  })
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
