import {
  applySnapshot,
  destroy,
  detach,
  getSnapshot,
  Instance,
  types,
} from "mobx-state-tree"
import { createContext, useContext } from "react"
import TaskList from "./TaskList"
import Task, { factory as taskFactory } from "./Task"
import Project from "./Project"
import Tag, { factory as tagFactory, randomTagColor } from "./Tag"
import TimelineEvent, { factory as timelineEventFactory } from "./TimelineEvent"
import { DateTime } from "luxon"
import { v4 as uuidv4 } from "uuid"
import User from "./User"
import ProjectCategory from "./ProjectCategory"
import jsonStorage from "../tools/jsonStorage"
import Habit, { IHabit } from "./Habit"
import HabitRecord from "./HabitRecord"
import Subtask, { ISubtask } from "./Subtask"
import TimerSession, { ITimerSession } from "./TimerSession"
import CollectionsStore from "./collections/CollectionsStore"
import { createStorage, createStorageReference, safeRef } from "./utils"
import Collection from "./collections/Collection"

const RootStore = types
  .model("Store", {
    user: types.maybeNull(User),
    tempTask: types.maybeNull(Task),
    editingTask: types.maybeNull(Task),
    events: types.array(TimelineEvent),
    tasks: TaskList,
    projects: types.array(Project),
    categories: types.array(ProjectCategory),
    selectedDate: DateTime.now().toFormat("M/d/yyyy"),
    timelineDate: DateTime.now().toFormat("M/d/yyyy"),
    screen: types.optional(
      types.enumeration([
        "INBOX",
        "TODAY",
        "PROJECT",
        "LOG",
        "TAGS",
        "AUTH",
        "COLLECTION",
        "COLLECTION_PERSONAL",
      ]),
      "TODAY",
    ),
    selectedProject: types.maybeNull(
      safeRef(Project, "", "pushProject", {
        id: "",
        name: "LOADING",
        index: 0,
        _temp: true,
      }),
    ),
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
    tempHabit: types.maybeNull(Habit),
    subtasks: types.array(Subtask),
    timerSessions: types.array(TimerSession),
    runningTimerSession: types.maybeNull(types.reference(TimerSession)),
    timerStatus: types.optional(
      types.enumeration("TimerStatuses", ["RUNNING", "PAUSE", "NONE"]),
      "NONE",
    ),
    collectionsStore: CollectionsStore,
  })
  .actions(self => ({
    healthCheck() {
      self.collectionsStore.healthCheckColumns()
      self.collectionsStore.healthCheckCards()
      this.healthCheckSubtasks()
    },
    pushProject(val) {
      self.projects.push(val)
    },
    resumeTimer() {
      if (!self.runningTimerSession) return
      self.timerStatus = "RUNNING"
    },
    completeTimer(seconds?: number) {
      if (!self.runningTimerSession) return
      if (seconds) self.runningTimerSession.addDuration(seconds)
      self.timerStatus = "NONE"
      self.runningTimerSession.task.changeStatus(true)
      self.runningTimerSession = null
    },
    stopTimer(seconds?: number) {
      console.log("STOP TIMER", seconds)
      if (!self.runningTimerSession) return
      if (seconds) self.runningTimerSession.addDuration(seconds)
      self.timerStatus = "NONE"
      self.runningTimerSession = null
    },
    pauseTimer(seconds: number) {
      if (!self.runningTimerSession) return
      if (seconds) self.runningTimerSession.addDuration(seconds)
      self.timerStatus = "PAUSE"
    },
    syncTimer(seconds: number) {
      self.runningTimerSession!.addDuration(seconds)
    },
    startTimer(task) {
      if (task === self.tempTask) return
      const newId = uuidv4()
      self.timerSessions.push({
        task,
        date: DateTime.now().toFormat("M/d/yyyy"),
        start: DateTime.now().toFormat("H:m"),
        duration: 0,
        id: newId,
      } as ITimerSession)
      // @ts-ignore
      self.runningTimerSession = newId
      self.timerStatus = "RUNNING"
    },
    addSubtask(initialData: Partial<ISubtask>) {
      if (!initialData.task) return
      const id = initialData.id ? initialData.id : uuidv4()
      if ("index" in initialData && typeof initialData.task !== "string") {
        initialData.task.subtasks.forEach(st => {
          if (st.index >= (initialData.index as number))
            st.setIndex(st.index + 1)
        })
      }
      self.subtasks.push({
        status: "ACTIVE",
        text: "",
        closedAt: null,
        task: initialData.task,
        index:
          self.subtasks.reduce(
            (acc: number, subtask: ISubtask) =>
              subtask.index > acc ? subtask.index : acc,
            -1,
          ) + 1,
        ...initialData,
        id,
      })
      this.healthCheckSubtasks()
      return id
    },
    healthCheckSubtasks() {
      const groups: { [key: string]: ISubtask[] } = {}
      self.subtasks.forEach(st => {
        if (st.task.id in groups) groups[st.task.id].push(st)
        else groups[st.task.id] = [st]
      })

      Object.values(groups).forEach(group => {
        group.sort((a, b) => a.index - b.index)
        group.forEach((st, i) => {
          if (st.index !== i) st.setIndex(i)
        })
      })
    },
    moveSubtask(id: string, newIndex: number): boolean {
      this.healthCheckSubtasks()
      const subtask = self.subtasks.find(st => st.id === id)
      if (!subtask) return false
      const taskSubtasks: ISubtask[] = subtask.task.subtasks
      if (newIndex > taskSubtasks.length - 1) newIndex = taskSubtasks.length - 1

      taskSubtasks.forEach(st => {
        if (st.id === subtask.id) return
        if (st.index < subtask.index && st.index >= newIndex) {
          st.setIndex(st.index + 1)
        }
        if (st.index > subtask.index && st.index <= newIndex) {
          st.setIndex(st.index - 1)
        }
      })

      subtask.setIndex(newIndex)

      return true
    },
    deleteSubtask(id: string): boolean {
      this.healthCheckSubtasks()
      const subtask = self.subtasks.find(st => st.id === id)
      if (!subtask) return false

      subtask.task.subtasks.forEach(st => {
        if (st.index > subtask.index) st.setIndex(st.index - 1)
      })

      if (subtask.syncable)
        window.syncMachine.registerDelete(subtask.id, subtask.syncName)

      destroy(subtask)
      return true
    },
    deleteTimerSession(id: string): boolean {
      const session = self.timerSessions.find(ts => ts.id === id)
      if (!session) return false

      console.log("DELETING SESSION", id)

      if (session.syncable)
        window.syncMachine.registerDelete(session.id, session.syncName)

      destroy(session)
      return true
    },
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
        id,
      }
    },
    rejectTempHabit() {
      self.tempHabit = null
    },
    insertTempHabit() {
      if (!self.tempHabit) return
      const id = uuidv4()
      const habit = { ...JSON.parse(JSON.stringify(self.tempHabit)), id }
      self.habits.push(habit)
      this.rejectTempHabit()
    },
    saveTempHabit(id: string) {
      const habit = self.habits.find(habit => habit.id === id)
      if (!habit || !self.tempHabit) return

      if (habit.name !== self.tempHabit.name) habit.setName(self.tempHabit.name)
      if (habit.recordsPerDay !== self.tempHabit.recordsPerDay)
        habit.setRecordsPerDay(self.tempHabit.recordsPerDay)
      if (habit.color !== self.tempHabit.color)
        habit.setColor(self.tempHabit.color)
      if (habit.icon !== self.tempHabit.icon) habit.setIcon(self.tempHabit.icon)
      if (habit.type !== self.tempHabit.type) habit.setType(self.tempHabit.type)
      if (habit.monthlyDays !== self.tempHabit.monthlyDays)
        habit.setMonthlyDays([...self.tempHabit.monthlyDays])
      if (habit.weeklyDays !== self.tempHabit.weeklyDays)
        habit.setWeeklyDays([...self.tempHabit.weeklyDays])

      this.rejectTempHabit()
    },
    deleteHabitRecord(id: string): boolean {
      const record = self.habitRecords.find(hr => hr.id === id)
      if (!record) return false
      window.syncMachine.registerDelete(id, record.syncName)
      destroy(record)
      return true
    },
    deleteHabit(id: string): boolean {
      const habit = self.habits.find(h => h.id === id)
      if (!habit) return false
      habit.records.forEach(r => this.deleteHabitRecord(r.id))
      window.syncMachine.registerDelete(id, habit.syncName)
      destroy(habit)
      return true
    },
    setUser(user) {
      if (window.IS_WEB) {
        localStorage.setItem("user", JSON.stringify(user))
      }
      setTimeout(() => window.syncMachine.loadAll(), 10)
      if (user?.id && self.screen === "AUTH") {
        self.screen = "TODAY"
      }
      self.user = user
    },
    selectTagType(type) {
      self.selectedTagType = type
      if (type === "TASK") history.pushState({}, document.title, "/app/tags/")
      if (type === "EVENT")
        history.pushState({}, document.title, "/app/eventTags/")
    },
    setSidebarWidth(val) {
      self.sidebarWidth = val
      localStorage.setItem("sidebarWidth", val)
    },
    setTimelineWidth(val) {
      self.timelineWidth = val
      localStorage.setItem("timelineWidth", val)
    },
    insertTempTask() {
      const task = JSON.parse(JSON.stringify(self.tempTask.toJSON()))
      task.id = uuidv4()
      self.tasks.add(task)
      if (self.tempTask.event) {
        self.tempTask.event.task = task.id
      }
      self.tempTask.subtasks.forEach(st => {
        st.task = task.id
        window.syncMachine.registerCreate(st)
      })
      detach(self.tempTask)
    },
    setTempTask(task) {
      task = taskFactory(uuidv4(), task)
      if (self.tempTask !== null) {
        if (self.tempTask.toJSON().event) this.deleteEvent(self.tempTask.event)
      }
      self.tempTask = task
      if (self.tempTask !== null)
        console.log("Temp task:", self.tempTask.toJSON())
      else console.log("Temp task:", self.tempTask)
    },
    setEditingTask(task) {
      task = taskFactory(uuidv4(), task)
      // if (self.tempTask !== null) {
      //   if (self.tempTask.toJSON().event) this.deleteEvent(self.tempTask.event)
      // }
      self.editingTask = task
      if (self.editingTask !== null)
        console.log("Editing task:", self.editingTask.toJSON())
      else console.log("Editing task:", self.editingTask)
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

      if (screen === "TODAY")
        history.pushState({}, document.title, "/app/today/")
      if (screen === "LOG") history.pushState({}, document.title, "/app/log/")
      if (screen === "INBOX")
        history.pushState({}, document.title, "/app/inbox/")
      if (screen === "PROJECT")
        history.pushState({}, document.title, "/app/projects/")
      if (screen === "COLLECTION")
        history.pushState({}, document.title, "/app/projects/")
      if (screen === "COLLECTION_PERSONAL")
        history.pushState({}, document.title, "/app/assigned/")
      if (screen === "TAG") history.pushState({}, document.title, "/app/tags/")
    },
    selectProject(project) {
      self.selectedProject = project
      const id = typeof project === "string" ? project : project.id
      history.pushState({}, document.title, "/app/projects/" + id)
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
      project.tasks.forEach(t => self.tasks.deleteTask(t))
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
