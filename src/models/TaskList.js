import { types, destroy, getParent, detach } from "mobx-state-tree"
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
      if (task === getParent(self).tempTask) return
      self.selected = task
    },
    add(task) {
      if (getParent(self).tempTask === task) getParent(self).detachTempTask()
      self.all.push(task)
    },
    deleteTask(task) {
      if (self.selected === task) self.selected = null
      self.all.splice(self.all.indexOf(task), 1)
      destroy(task)
    },
  }))

export default TaskList
