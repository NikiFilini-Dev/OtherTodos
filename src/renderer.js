import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App/index.jsx"
import RootStore, { Provider } from "./models/RootStore"
import moment from "moment"
import jsonStorage from "tools/jsonStorage"
import migrations from "models/migrations"

import "./external/editor"
import "./index.css"
import { persist } from "mst-persist"
const DEBUG = process.env.P_ENV === "debug"
const data = {
  screen: "TODAY",
  selectedProject: null,
  selectedTag: null,
  selectedDate: moment().format("YYYY-MM-DD"),
  tags: [],
  projects: [],
  tasks: { all: [] },
  events: [],
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
      if (v._storeVersion === 0) {
        v.tempTask = null
        v.events = []
      }
      const taskProjects = []
      v.tasks.all.forEach(task => {
        if (!taskProjects.includes(task.project))
          taskProjects.push(task.project)
      })
      const missingProjects = taskProjects.filter(
        id => id && !v.projects.find(p => p.id === id),
      )
      console.log("TASK PROJECTS:", taskProjects)
      console.log(
        "PROJECTS:",
        v.projects.map(p => p.id),
      )
      console.log("MISSING:", missingProjects)
      missingProjects.forEach(missingId => {
        v.projects.push({
          id: missingId,
          name: `Lost ${missingId}`,
          index: Infinity,
        })
      })
      if (missingProjects.length)
        v.projects = v.projects.map(p => ({ ...p, index: p.id - 1 }))
      migrations.forEach(migration => {
        if (migration.id <= v._storeVersion) return
        migration.up(v)
        console.log(migration)
        v._storeVersion = migration.id
      })
      // v.projects = v.projects.map(project => ({ ...project, categories: [] }))
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
window.Store = Store
