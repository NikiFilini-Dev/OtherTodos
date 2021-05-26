import {
  types,
  detach,
  Instance,
  destroy,
  getSnapshot,
  applySnapshot,
} from "mobx-state-tree"
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
import jsonStorage from "../tools/jsonStorage"
import Habit, { IHabit } from "./Habit"
import HabitRecord, { IHabitRecord } from "./HabitRecord"
import { toJS } from "mobx"

const RootStore = types
  .model("Store", {
    user: types.maybeNull(User),
    tempTask: types.maybeNull(Task),
    events: types.array(TimelineEvent),
    tasks: TaskList,
    projects: types.array(Project),
    categories: types.array(ProjectCategory),
    selectedDate: DateTime.now().toFormat("M/d/yyyy"),
    timelineDate: DateTime.now().toFormat("M/d/yyyy"),
    screen: types.optional(
      types.enumeration(["INBOX", "TODAY", "PROJECT", "LOG", "TAGS", "AUTH"]),
      "TODAY",
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
    habits: types.array(Habit),
    habitRecords: types.array(HabitRecord),
    tempHabit: types.maybeNull(Habit)
  })
  .actions(self => ({
    setTempHabit(initialData?: Partial<IHabit>) {
      const id = uuidv4()

      self.tempHabit = {
        name: "",
        type: "daily",
        recordsPerDay: 1,
        color: "blue",
        icon: "win",
        // @ts-ignore
        weeklyDays: [],
        // @ts-ignore
        monthlyDays: [],
        ...JSON.parse(JSON.stringify(initialData)),
        id
      }

    },
    rejectTempHabit() {
      self.tempHabit = null
    },
    insertTempHabit() {
      if (!self.tempHabit) return
      const id = uuidv4()
      const habit = {...JSON.parse(JSON.stringify(self.tempHabit)), id}
      self.habits.push(habit)
      this.rejectTempHabit()
    },
    saveTempHabit(id: string) {
      const habit = self.habits.find(habit => habit.id === id)
      if (!habit || !self.tempHabit) return

      if (habit.name !== self.tempHabit.name) habit.setName(self.tempHabit.name)
      if (habit.recordsPerDay !== self.tempHabit.recordsPerDay) habit.setRecordsPerDay(self.tempHabit.recordsPerDay)
      if (habit.color !== self.tempHabit.color) habit.setColor(self.tempHabit.color)
      if (habit.icon !== self.tempHabit.icon) habit.setIcon(self.tempHabit.icon)
      if (habit.type !== self.tempHabit.type) habit.setType(self.tempHabit.type)
      if (habit.monthlyDays !== self.tempHabit.monthlyDays) habit.setMonthlyDays([...self.tempHabit.monthlyDays])
      if (habit.weeklyDays !== self.tempHabit.weeklyDays) habit.setWeeklyDays([...self.tempHabit.weeklyDays])

      this.rejectTempHabit()
    },
    setUser(user) {
      if (window.IS_WEB) {
        localStorage.setItem("user", JSON.stringify(user))
      }
      setTimeout(() => window.syncMachine.resetTimer(), 10)
      if (user?.id && self.screen === "AUTH") {
        self.screen = "TODAY"
      }
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
      task = taskFactory(uuidv4(), task)
      if (self.tempTask !== null) {
        if (self.tempTask.toJSON().event) this.deleteEvent(self.tempTask.event)
      }
      self.tempTask = task
    },
    setTimelineDate(val) {
      if (val instanceof Date) {
        val = DateTime.fromJSDate(val).toFormat("M/d/yyyy")
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
      self.tags.forEach(tag => {
        if (tag.type !== type) return
        tag.index = tag.index + 1
      })
      const tag = Tag.create({
        id: newId,
        name,
        index: -1,
        color: randomTagColor(),
        type: type || "TASK",
      })
      self.tags.push(tag)
      return tag
    },
    createHabitRecord(habitRecord) {
      const newId = uuidv4()
      self.habitRecords.push({ ...habitRecord, id: newId })
      return newId
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
      if (date instanceof Date)
        date = DateTime.fromJSDate(date).toFormat("M/d/yyyy")
      console.log("SELECTING DATE", date)
      self.selectedDate = date
    },
    setScreen(screen) {
      self.screen = screen
      self.tasks.selected = null
      self.tempTask = null
      self.selectedDate = DateTime.now().toFormat("M/d/yyyy")
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
      self.tasks.all.forEach(task => {
        if (task.tags.includes(tag)) task.removeTag(tag)
      })
      self.events.forEach(event => {
        if (event.tag === tag) event.setTag(null)
      })
      window.syncMachine.registerDelete(tag.id, tag.syncName)
      destroy(tag)
    },

    deleteProject(project) {
      if (self.selectedProject === project) {
        self.selectedProject = null
        if (self.screen === "PROJECT") self.screen = "INBOX"
      }
      window.syncMachine.registerDelete(project.id, project.syncName)
      destroy(project)
    },

    deleteEvent(event, force = false) {
      if (event.task && !force) {
        return event.task.unconnectEvent()
      }
      window.syncMachine.registerDelete(event.id, event.syncName)
      destroy(event)
    },

    deleteCategory(category) {
      self.projects.forEach(project => {
        if (project.categories.includes(category))
          project.removeCategory(category)
      })
      window.syncMachine.registerDelete(category.id, category.syncName)
      destroy(category)
    },

    removeAllEvents() {
      while (self.events.length) self.events.pop()
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

    clear() {
      const snapshot = getSnapshot<IRootStore>(self)
      const store = JSON.parse(JSON.stringify(snapshot))
      store.tasks.all = []
      store.projects = []
      store.categories = []
      store.events = []
      store.tags = []
      applySnapshot(self, store)
    },

    backup() {
      return new Promise<void>(resolve => {
        jsonStorage.getItem("root_store").then(store => {
          jsonStorage
            .setItem(
              `_root_store_[${DateTime.now().toFormat("D HH:mm")}]`,
              store,
            )
            .then(() => resolve())
        })
      })
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

export type IRootStore = Instance<typeof RootStore>
