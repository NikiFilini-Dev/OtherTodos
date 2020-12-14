import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App/index.jsx"
import RootStore, { Provider } from "./models/RootStore"

import "./index.css"
import { persist } from "mst-persist"

const Store = RootStore.create({
  projects: [
    {
      id: "1",
      name: "Test project",
    },
    {
      id: "2",
      name: "Test project 2",
    },
  ],
  tasks: [
    {
      id: "1",
      text: "Test task 1",
      status: "active",
      project: 1,
      note: "",
    },
    {
      id: "2",
      text: "Test task 2",
      status: "active",
      project: 2,
      note: "",
    },
    {
      id: "3",
      text: "Test task 3",
      status: "done",
      note: "",
      project: 1,
    },
  ],
})

persist("root_store", Store, {
  storage: localStorage,
  whitelist: ["tasks", "projects"],
})
  .then(() => console.log("Hydrated!"))
  .catch((err) => console.error(err))

ReactDOM.render(<Provider value={Store}> {App} </Provider>, document.body)

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack',
)
