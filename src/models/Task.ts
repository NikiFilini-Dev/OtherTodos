import { getParent, getRoot, types } from "mobx-state-tree"
import Project from "./Project"
import Tag from "./Tag"
import ProjectCategory from "./ProjectCategory"
import { v4 as uuidv4 } from "uuid"
import { LateTimelineEvent } from "./TimelineEvent"
import { DateTime } from "luxon"
import { IRootStore } from "./RootStore"
import { ISubtask } from "./Subtask"

const Task = types
  .model("Task", {
    id: types.identifier,
    text: types.string,
    note: types.string,
    status: types.enumeration("TYPE_STATUS", ["active", "done"]),
    project: types.maybeNull(types.reference(Project)),
    priority: types.optional(types.integer, 3),
    date: types.maybeNull(types.string),
    tags: types.array(types.reference(Tag)),
    closeDate: types.maybeNull(types.string),
    creationDate: types.optional(types.string, () =>
      DateTime.now().toFormat("M/d/yyyy"),
    ),
    repeatEvery: types.maybeNull(types.optional(types.integer, 0)),
    repeating: types.optional(types.boolean, false),
    category: types.maybeNull(types.reference(ProjectCategory)),
    event: types.maybeNull(types.reference(types.late(LateTimelineEvent))),
    colorTag: types.maybeNull(types.reference(Tag)),
  })
  .views(self => ({
    get done() {
      return self.status === "done"
    },
    get syncName() {
      return "Task"
    },
    get syncable() {
      return !("tempTask" in getParent(self))
    },
    get isNote() {
      return self.text.startsWith(":")
    },
    get noteText() {
      if (!this.isNote) return self.text
      if (self.text.startsWith(": ")) return self.text.slice(2)
      if (self.text.startsWith(":")) return self.text.slice(1)
      return self.text
    },
    get subtasks() {
      const subtasks = getRoot<IRootStore>(self).subtasks.filter(
        (subtask: ISubtask) => subtask.task === self,
      )
      subtasks.sort((a, b) => a.index - b.index)
      return subtasks
    },
    get doneSubtasks() {
      return getRoot<IRootStore>(self).subtasks.filter(
        (subtask: ISubtask) =>
          subtask.task === self && subtask.status === "DONE",
      )
    },
    get progress() {
      return (
        this.subtasks.filter(st => st.status === "DONE").length *
        (100 / this.subtasks.length)
      )
    },
    get totalTimeSpent(): number {
      const root = getRoot<IRootStore>(self)
      return root.timerSessions.filter(ts => ts.task === self).reduce((acc, ts) => acc + ts.duration, 0)
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, any[]> = {}

    actions.setTags = val => {
      self.tags = val
    }
    actionsMap.setTags = ["tags"]

    actions.setEvent = val => {
      self.event = val
    }
    actionsMap.setEvent = ["event"]

    actions.unconnectEvent = () => {
      if (!self.event) return
      const id = self.event.id
      self.event = null
      const root = getRoot<IRootStore>(self)
      root.deleteEvent(
        root.events.find(e => e.id === id),
        true,
      )
    }
    actionsMap.unconnectEvent = ["event"]

    actions.createAndConnectEvent = () => {
      if (self.event) return
      if (!self.date) self.date = DateTime.now().toFormat("M/d/yyyy")
      const root = getRoot<IRootStore>(self)
      self.event = root.createEvent({
        task: self.id,
        date: self.date,
        allDay: true,
        start: "00:00",
        duration: 60,
        name: self.text,
      })
    }
    actionsMap.createAndConnectEvent = ["event"]

    actions.setCloseDate = val => self.closeDate = val
    actionsMap.setCloseDate = ["closeDate"]

    actions.setRepeating = val => self.repeating = val
    actionsMap.setRepeating = ["repeating"]

    actions.setRepeatEvery = n => {
      if (!n) n = 0
      self.repeatEvery = parseInt(n)
    }
    actionsMap.setRepeatEvery = ["repeatEvery"]

    actions.changeStatus = value => {
      self.status = value ? "done" : "active"
      if (value) {
        self.closeDate = DateTime.now().toFormat("M/d/yyyy")
        if (self.repeatEvery) {
          const newDate = DateTime.fromFormat(
            self.date || self.closeDate,
            "M/d/yyyy",
          )
            .plus({ days: self.repeatEvery })
            .toFormat("M/d/yyyy")

          const root = getRoot<IRootStore>(self)

          const newTask = {
            ...JSON.parse(JSON.stringify(self)),
            date: newDate,
            status: "active",
            creationDate: DateTime.now().toFormat("M/d/yyyy"),
            closeDate: null,
            id: uuidv4(),
          }

          console.log(newTask)
          root.tasks.add(root.createTask(newTask))

          self.subtasks.forEach(st => {
            root.addSubtask({
              ...st,
              status: "ACTIVE",
              task: newTask.id
            })
          })

          if (self.event) {
            const newEventId = root.createEvent({...self.event, task: newTask.id, date: newTask.date})
            root.tasks.all.find(t => t.id === newTask.id).setEvent(newEventId)
          }
        }
      } else self.closeDate = null
    }
    actionsMap.changeStatus = ["status", "closeDate"]

    actions.setNote = value => self.note = value
    actionsMap.setNote = ["note"]

    actions.setPriority = value => self.priority = value
    actionsMap.setPriority = ["priority"]

    actions.setDate = value => {
      if (value instanceof Date)
        value = DateTime.fromJSDate(value).toFormat("M/d/yyyy")
      self.date = value
      if (self.event) {
        if (value) self.event.setDate(self.date)
        else actions.unconnectEvent()
      }
    }
    actionsMap.setDate = ["date", "event"]

    actions.setProject = project => {
      if (self.category && self.category.project !== project) self.category = null
      self.project = project
    }
    actionsMap.setProject = ["project", "category"]

    actions.addTag = tag => {
      console.log(tag)
      if (self.tags.includes(tag)) return
      self.tags.push(tag)
    }
    actionsMap.addTag = ["tags"]

    actions.removeTag = tag => {
      if (self.tags.indexOf(tag) === -1) return
      self.tags.splice(self.tags.indexOf(tag), 1)
      if (self.colorTag === tag) self.colorTag = null
    }
    actionsMap.removeTag = ["tags", "colorTag"]

    actions.setText = text => {
      text = text.replaceAll("\n", "")
      self.text = text
    }
    actionsMap.setText = ["text"]

    actions.setCategory = c => {
      self.category = c
    }
    actionsMap.setCategory = ["category"]

    actions.setColorTag = t => {
      self.colorTag = t
    }
    actionsMap.setColorTag = ["colorTag"]

    actions.getActionsMap = () => actionsMap

    return actions
  })

export const factory = (id, data: Record<string, any> = {}) => {
  if (data.project === "") data.project = null
  if (data.event === "") data.event = null
  if (data.category === "") data.category = null
  if (data.colorTag === "") data.colorTag = null
  return {
    id,
    project: null,
    date: null,
    colorTag: null,
    text: "",
    note: "",
    tags: [],
    status: "active",
    ...data,
  }
}

export default Task

export function LateTask() {
  return Task
}
