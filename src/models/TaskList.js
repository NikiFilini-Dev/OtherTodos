import { types, destroy } from "mobx-state-tree"
import Task from "./Task"
import moment from "moment"

const TaskList = types
  .model("TaskList", {
    all: types.array(Task),
    selected: types.maybeNull(types.reference(Task)),
  })
  .views(self => ({
    get today() {
      return self.all.filter(
        task =>
          task.date && moment(task.date).isSame(moment().format("YYYY-MM-DD")),
      )
    },
    expired() {
      console.log("Updating expired")
      return self.all.filter(
        task =>
          task.date &&
          moment(task.date).isBefore(moment(moment().format("YYYY-MM-DD"))),
      )
    },
    get inbox() {
      return self.all.filter(task => task.date === null)
    },
  }))
  .actions(self => ({
    select(task) {
      self.selected = task
    },
    add(task) {
      self.all.push(task)
    },
    deleteTask(task) {
      self.all.splice(self.all.indexOf(task), 1)
      destroy(task)
    },
  }))

export default TaskList
