import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App/index.jsx"
import RootStore, { Provider } from "./models/RootStore"
import moment from "moment"

import "./index.css"
// import { persist } from "mst-persist"

const Store = RootStore.create({
  screen: "INBOX",
  selectedProject: 1,
  tags: [
    {
      id: 1,
      name: "Testing",
    },
    {
      id: 2,
      name: "Nanodesu",
    },
  ],
  projects: [
    {
      id: 1,
      name: "Test project",
    },
    {
      id: 2,
      name: "Project 2",
    },
  ],
  tasks: {
    all: [
      {
        id: 1,
        text: "Test task 1",
        status: "active",
        project: 1,
        note: "",
        priority: 1,
        date: moment().subtract(1, "days").format("YYYY-MM-DD"),
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
        note: "",
        project: 1,
        priority: 3,
        date: moment().format("YYYY-MM-DD"),
      },
      {
        id: 4,
        text: "Test task 4",
        status: "done",
        note: "",
        project: 1,
        priority: 4,
      },
    ],
  },
})

// persist("root_store", Store, {
//   storage: localStorage,
//   whitelist: ["tasks", "projects"],
// })
//   .then(() => console.log("Hydrated!"))
//   .catch((err) => console.error(err))

ReactDOM.render(
  <Provider value={Store}> {App} </Provider>,
  document.querySelector("#app"),
)

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack',
)
window.moment = moment
