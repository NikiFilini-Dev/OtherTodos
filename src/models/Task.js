import { types } from "mobx-state-tree"
import Project from "./Project"

const Task = types
  .model("Task", {
    id: types.identifier,
    text: types.string,
    note: types.string,
    status: types.enumeration("TYPE_STATUS", ["active", "done"]),
    project: types.reference(Project),
  })
  .views((self) => ({
    get done() {
      return self.status === "done"
    },
  }))
  .actions((self) => ({
    changeStatus(value) {
      self.status = value ? "done" : "active"
    },
    setNote(value) {
      self.note = value
    },
  }))

export default Task
