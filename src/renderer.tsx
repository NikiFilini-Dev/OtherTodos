import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App"
import RootStore, { Provider } from "./models/RootStore"
import jsonStorage from "tools/jsonStorage"
import migrations from "models/migrations"
import "./index.css"
import SyncMachine from "./syncMachine"
import { DateTime } from "luxon"
import BakaEditor from "./editor"
import { noop } from "lodash-es"
import CollectionsStore from "./models/collections/CollectionsStore"
import { applySnapshot } from "mobx-state-tree"
import { merge } from "lodash"

__webpack_public_path__ = "http://localhost:8080/static/"

noop("EDITOR", BakaEditor)

if (!IS_WEB) {
  const Sentry = require("@sentry/electron")
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}

type mapReturn = { screen: string; [key: string]: any }

const mapUrl = (): mapReturn => {
  const url = location.pathname
  const screen = url.match(/\/app\/([^\/]+)/)
  console.log(url, screen)
  if (!screen) return { screen: "TODAY" }
  switch (screen[1]) {
    case "tags":
      return { screen: "TAGS", selectedTagType: "TASK" }
    case "eventTags":
      return { screen: "TAGS", selectedTagType: "EVENT" }
    case "inbox":
      return { screen: "INBOX" }
    case "log":
      return { screen: "LOG" }
    case "assigned":
      return { screen: "COLLECTION_PERSONAL" }
    case "projects":
      // eslint-disable-next-line no-case-declarations
      const project = url.match(/\/app\/projects\/([^\/]+)/)
      if (!project) return { screen: "TODAY" }
      return { screen: "PROJECT", selectedProject: project[1] }
    case "collections":
      // eslint-disable-next-line no-case-declarations
      const collection = url.match(/\/app\/collections\/([^\/]+)/)
      if (!collection) return { screen: "TODAY" }
      return {
        screen: "COLLECTION",
        collectionsStore: { selectedCollection: collection[1] },
      }
    default:
      return { screen: "TODAY" }
  }
}

const rawUser = localStorage.getItem("user")
let user: Record<string, any> | null = null
if (rawUser) {
  user = JSON.parse(rawUser)
  if (user && user.name) {
    user.firstName = user.name
    delete user.name
    localStorage.setItem("user", JSON.stringify(user))
  }
}
let data = {
  user: user,
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
    collections: [],
    columns: [],
    cards: [],
    subtasks: [],
    selectedCollection: null,
    filter: {},
  }),

  sidebarWidth: JSON.parse(localStorage.getItem("sidebarWidth") || "250"),
  timelineWidth: JSON.parse(localStorage.getItem("timelineWidth") || "350"),
}
data = { ...data, ...mapUrl() }
console.log(mapUrl())
const Store = RootStore.create(data)

window.getToken = (): string => {
  return Store.user?.token || ""
}

window.syncMachine = new SyncMachine(Store, true)

function hydrate(fromScratch = false) {
  const snapshot = localStorage.getItem("root_store")
  if (snapshot) applySnapshot(Store, merge(JSON.parse(snapshot), mapUrl()))
  window.syncMachine.finishHydration(fromScratch)
  render()
}

const initStorage = async () => {
  let v = await jsonStorage.getItem("root_store")
  if (typeof v === "string") v = JSON.parse(v)

  if (!v || !Object.keys(v).length) {
    await jsonStorage.setItem("root_store", JSON.stringify(data))
    hydrate(true)
    return
  } else {
    let changed = false
    migrations.forEach(migration => {
      if (migration.id <= v._storeVersion) return
      v = migration.up(v)
      console.log(migration)
      v._storeVersion = migration.id
      changed = true
    })

    if (changed) {
      v = window.syncMachine.healthCheck(v)
      await jsonStorage.setItem("root_store", JSON.stringify(v))
    }
    hydrate()

    return true
  }
}

initStorage()

function render() {
  ReactDOM.render(
    <Provider value={Store}> {App} </Provider>,
    document.querySelector("#app"),
  )
}

window.Store = Store
