import { types } from "mobx-state-tree"
import Project from "./Project"
import Tag from "./Tag"
import moment from "moment"
import ProjectCategory from "./ProjectCategory"

const Task = types
  .model("Task", {
    id: types.identifierNumber,
    text: types.string,
    note: types.string,
    status: types.enumeration("TYPE_STATUS", ["active", "done"]),
    project: types.maybeNull(types.reference(Project)),
    priority: types.optional(types.integer, 3),
    date: types.maybeNull(types.string),
    tags: types.array(types.reference(Tag)),
    closeDate: types.maybeNull(types.string),
    creationDate: types.maybeNull(types.string),
    repeatEvery: types.maybeNull(types.optional(types.integer, 0)),
    repeating: types.optional(types.boolean, false),
    category: types.maybeNull(types.reference(ProjectCategory)),
  })
  .views(self => ({
    get done() {
      return self.status === "done"
    },
  }))
  .actions(self => ({
    setCloseDate(val) {
      self.closeDate = val
    },
    setRepeatEvery(n) {
      if (!n) n = 0
      self.repeatEvery = parseInt(n)
    },
    changeStatus(value) {
      self.status = value ? "done" : "active"
      if (value) {
        self.closeDate = moment().format("YYYY-MM-DD")
        if (self.repeatEvery) {
          // if (!self.date)
          self.date = moment(self.date || self.closeDate, "YYYY-MM-DD")
            .add(self.repeatEvery, "days")
            .format("YYYY-MM-DD")
          self.status = "active"
        }
      } else self.closeDate = null
    },
    setNote(value) {
      self.note = value
    },
    setPriority(value) {
      self.priority = value
    },
    setDate(value) {
      if (moment.isDate(value)) value = moment(value).format("YYYY-MM-DD")
      self.date = value
    },
    setProject(project) {
      self.project = project
    },
    addTag(tag) {
      console.log(tag)
      if (self.tags.includes(tag)) return
      self.tags.push(tag)
    },
    removeTag(tag) {
      if (self.tags.indexOf(tag) === -1) return
      self.tags.splice(self.tags.indexOf(tag), 1)
    },
    setText(text) {
      self.text = text
    },
    setCategory(c) {
      self.category = c
    },
  }))

export const factory = (id, data = {}) => ({
  id,
  project: null,
  date: null,
  text: "",
  note: "",
  tags: [],
  status: "active",
  ...data,
})

export default Task
