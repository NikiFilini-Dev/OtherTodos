import { types, detach, Instance, destroy } from "mobx-state-tree"
import { createContext, useContext } from "react"
import TaskList from "./TaskList"
import Task, { factory as taskFactory } from "./Task"
import Project from "./Project"
import Tag, { randomTagColor, factory as tagFactory } from "./Tag"
import TimelineEvent, { factory as timelineEventFactory } from "./TimelineEvent"
import { DateTime } from "luxon"
import { v4 as uuidv4 } from "uuid"
import User from "./User"
import ProjectCategory from "./ProjectCategory"

const RootStore = types
  .model("Store", {
    user: types.maybeNull(User),
    tempTask: types.maybeNull(Task),
    events: types.array(TimelineEvent),
    tasks: TaskList,
    projects: types.array(Project),
    categories: types.array(ProjectCategory),
    selectedDate: DateTime.now().toFormat("D"),
    timelineDate: DateTime.now().toFormat("D"),
    screen: types.optional(
      types.enumeration(["INBOX", "TODAY", "PROJECT", "LOG", "TAGS", "AUTH"]),
      "AUTH",
    ),
    selectedProject: types.maybeNull(types.reference(Project)),
    tags: types.array(Tag),
    selectedTag: types.maybeNull(types.reference(Tag)),
    selectedTagType: types.optional(
      types.enumeration(["TASK", "EVENT"]),
      "TASK",
    ),
    _storeVersion: types.optional(types.number, 0),
    sidebarWidth: types.optional(types.number, 250),
    timelineWidth: types.optional(types.number, 350),
  })
  .actions(self => ({
    setUser(user) {
      if (window.IS_WEB) {
        localStorage.setItem("user", JSON.stringify(user))
      }
      setTimeout(() => window.syncMachine.loadAll(null), 10)
      self.user = user
    },
    selectTagType(type) {
      self.selectedTagType = type
    },
    setSidebarWidth(val) {
      self.sidebarWidth = val
    },
    setTimelineWidth(val) {
      self.timelineWidth = val
    },
    insertTempTask() {
      const task = JSON.parse(JSON.stringify(self.tempTask.toJSON()))
      task.id = uuidv4()
      self.tasks.add(task)
      if (self.tempTask.event) {
        self.tempTask.event.task = task.id
      }
      detach(self.tempTask)
    },
    setTempTask(task) {
      if (self.tempTask !== null) {
        if (self.tempTask.toJSON().event) this.deleteEvent(self.tempTask.event)
      }
      self.tempTask = task
    },
    setTimelineDate(val) {
      if (val instanceof Date) {
        val = DateTime.fromJSDate(val).toFormat("D")
      }
      self.timelineDate = val
    },
    createTask(data = {}) {
      const newId = uuidv4()
      return Task.create(taskFactory(newId, data))
    },
    createProject(name) {
      const newId = uuidv4()
      const maxIndex = self.projects.reduce(
        (max, project) => (project.index > max ? project.index : max),
        0,
      )
      const project = Project.create({ id: newId, name, index: maxIndex + 1 })
      self.projects.push(project)
      return project
    },
    createTag(name, type) {
      const newId = uuidv4()
      let lastIndex = -1
      self.tags.forEach(tag => {
        if (tag.type !== type) return
        if (tag.index > lastIndex) lastIndex = tag.index
      })
      const tag = Tag.create({
        id: newId,
        name,
        index: lastIndex + 1,
        color: randomTagColor(),
        type: type || "TASK",
      })
      self.tags.push(tag)
      return tag
    },
    createEvent(data) {
      const newId = uuidv4()
      self.events.push({
        ...data,
        id: newId,
      })
      return newId
    },
    selectDate(date) {
      if (date instanceof Date) date = DateTime.fromJSDate(date).toFormat("D")
      console.log("SELECTING DATE", date)
      self.selectedDate = date
    },
    setScreen(screen) {
      self.screen = screen
      self.tasks.selected = null
      self.tempTask = null
      self.selectedDate = DateTime.now().toFormat("D")
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
    deleteEvent(event, force = false) {
      if (event.task && !force) {
        return event.task.unconnectEvent()
      }
      window.syncMachine.registerDelete(event.id, event.syncName)
      destroy(event)
    },
    applyMigration() {},
    removeAllEvents() {
      // @ts-ignore
      self.events = []
    },
    loadTimelineEventsFromData(tasksData) {
      self.events = tasksData.map(data => timelineEventFactory(data.id, data))
    },
    loadCategoriesFromData(data) {
      self.categories = data
    },
    loadProjectsFromData(data) {
      self.projects = data
    },
    loadTagsFromData(data) {
      self.tags = data.map(tag => tagFactory(tag))
    },
    addCategory(category) {
      self.categories.push(category)
    },
  }))

export default RootStore

const RootStoreContext = createContext(null)
export const Provider = RootStoreContext.Provider

export function useMst(): IRootStore {
  const store = useContext(RootStoreContext)
  if (store === null) {
    throw new Error("Store cannot be null, please add a context provider")
  }
  return store
}

export interface IRootStore extends Instance<typeof RootStore> {}
