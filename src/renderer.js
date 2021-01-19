import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App/index.jsx"
import RootStore, { Provider } from "./models/RootStore"
import moment from "moment"
import jsonStorage from "tools/jsonStorage"
import migrations from "models/migrations"

import "./index.css"
import { persist } from "mst-persist"
const DEBUG = process.env.P_ENV === "debug"
const data = {
  screen: "TODAY",
  selectedProject: null,
  selectedTag: null,
  tags: [],
  projects: [],
  tasks: { all: [] },
}

if (DEBUG) {
  data.tags = [
    {
      id: 1,
      name: "Testing",
      project: 2,
      index: 0,
    },
    {
      id: 2,
      name: "Nanodesu",
      project: 2,
      index: 1,
    },
  ]
  data.projects = [
    {
      id: 1,
      name: "Test project",
    },
    {
      id: 2,
      name: "Project 2",
    },
  ]
  data.tasks.all = [
    {
      id: 1,
      text: "Test task 1",
      status: "active",
      project: 1,
      note: "",
      priority: 1,
      date: moment().subtract(1, "days").format("YYYY-MM-DD"),
      tags: [1],
    },
    {
      id: 2,
      text: "Test task 2",
      status: "active",
      project: 2,
      note: "",
      priority: 2,
      date: moment().format("YYYY-MM-DD"),
      tags: [1],
    },
    {
      id: 3,
      text: "Test task 3",
      status: "done",
      closeDate: moment().format("YYYY-MM-DD"),
      note: "",
      project: 1,
      priority: 3,
      date: moment().format("YYYY-MM-DD"),
    },
    {
      id: 4,
      text: "Test task 4",
      status: "done",
      closeDate: moment().subtract(1, "days").format("YYYY-MM-DD"),
      note: "",
      project: 1,
      priority: 4,
    },
  ]
}
const Store = RootStore.create(data)

function hydrate() {
  if (!DEBUG) {
    console.log("HYDRATING")
    persist("root_store", Store, {
      storage: jsonStorage,
    })
      .then(() => render())
      .catch(err => console.error(err))
  } else {
    render()
  }
  window.onerror = err => alert(JSON.stringify(err))
}

jsonStorage
  .getItem("root_store")
  .then(v => {
    console.log(v)
    if (typeof v === "string") v = JSON.parse(v)
    console.log(migrations)

    if (!v || !Object.keys(v).length) {
      console.log(data)
      jsonStorage
        .setItem("root_store", JSON.stringify(data))
        .then(hydrate)
        .catch(alert)
    } else {
      migrations.forEach(migration => {
        if (migration.id <= v._storeVersion) return
        migration.up(v)
        console.log(migration)
        v._storeVersion = migration.id
      })
      jsonStorage.setItem("root_store", JSON.stringify(v)).then(() => hydrate())

      return true
    }
    return true
  })
  .catch(alert)

function render() {
  ReactDOM.render(
    <Provider value={Store}> {App} </Provider>,
    document.querySelector("#app"),
  )
}
window.moment = moment
