import { types, detach, destroy } from "mobx-state-tree"
import { createContext, useContext } from "react"
import TaskList from "./TaskList"
import Task, { factory as taskFactory } from "./Task"
import Project from "./Project"
import Tag from "./Tag"
import moment from "moment"

const RootStore = types
  .model("Store", {
    tempTask: types.maybeNull(Task),
    tasks: TaskList,
    projects: types.array(Project),
    selectedDate: moment().format("YYYY-MM-DD"),
    screen: types.enumeration(["INBOX", "TODAY", "PROJECT", "TAG", "LOG"]),
    selectedProject: types.maybeNull(types.reference(Project)),
    tags: types.array(Tag),
    selectedTag: types.maybeNull(types.reference(Tag)),
  })
  .views(self => ({
    get lastTaskId() {
      return (
        self.tasks.all.reduce(
          (maxId, task) =>
            parseInt(task.id) > maxId ? parseInt(task.id) : maxId,
          0,
        ) || 0
      )
    },
    get lastTagId() {
      return (
        self.tags.reduce(
          (maxId, tag) => (parseInt(tag.id) > maxId ? parseInt(tag.id) : maxId),
          0,
        ) || 0
      )
    },
    lastId(arr) {
      return (
        arr.reduce(
          (maxId, el) => (parseInt(el.id) > maxId ? parseInt(el.id) : maxId),
          0,
        ) || 0
      )
    },
  }))
  .actions(self => ({
    detachTempTask() {
      detach(self.tempTask)
    },
    setTempTask(task) {
      self.tempTask = task
    },
    createTask(data = {}) {
      const newId = self.lastId(self.tasks.all) + 1
      return Task.create(taskFactory(newId, data))
    },
    createProject(name) {
      const newId = self.lastId(self.projects) + 1
      const project = Project.create({ id: newId, name })
      self.projects.push(project)
      return project
    },
    createTag(name) {
      const newId = self.lastId(self.tags) + 1
      const tag = Tag.create({ id: newId, name })
      self.tags.push(tag)
      return tag
    },
    selectDate(date) {
      self.selectedDate = moment(date).format("YYYY-MM-DD")
    },
    setScreen(screen) {
      self.screen = screen
    },
    selectProject(project) {
      self.selectedProject = project
    },
    selectTag(tag) {
      self.selectedTag = tag
    },
    deleteTag(tag) {
      if (self.selectedTag === tag) {
        self.selectedTag = null
        if (self.screen === "TAG") self.screen = "INBOX"
      }
      destroy(tag)
    },
    deleteProject(project) {
      if (self.selectedProject === project) {
        self.selectedProject = null
        if (self.screen === "PROJECT") self.screen = "INBOX"
      }
      destroy(project)
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
