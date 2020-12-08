import { types } from "mobx-state-tree"
import { createContext, useContext } from "react"
import Task from "./Task"
import Project from "./Project"

const RootStore = types
  .model("Store", {
    tasks: types.array(Task),
    projects: types.array(Project),
  })
  .views((self) => ({
    get lastTaskId() {
      return (
        self.tasks.reduce(
          (maxId, task) =>
            parseInt(task.id) > maxId ? parseInt(task.id) : maxId,
          0,
        ) || 0
      )
    },
  }))
  .actions((self) => ({
    addTask(text, project) {
      console.log(self.lastTaskId)
      self.tasks.push({
        id: self.lastTaskId + 1 + "",
        text,
        project,
        status: "active",
      })
    },
  }))

export default RootStore

const RootStoreContext = createContext(null)
export const Provider = RootStoreContext.Provider

export function useMst() {
  const store = useContext(RootStoreContext)
  if (store === null) {
    throw new Error("Store cannot be null, please add a context provider")
  }
  return store
}
