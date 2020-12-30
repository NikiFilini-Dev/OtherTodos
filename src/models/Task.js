import { types, getRoot, getParent } from "mobx-state-tree"
import Project from "./Project"
import Tag from "./Tag"
import moment from "moment"

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
  })
  .views(self => ({
    get done() {
      return self.status === "done"
    },
  }))
  .actions(self => ({
    changeStatus(value) {
      console.log("CHANGE STATUS", value)
      self.status = value ? "done" : "active"
      if (value) self.closeDate = moment().format("YYYY-MM-DD")
      else self.closeDate = null
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
