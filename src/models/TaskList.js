import { types, isStateTreeNode, detach } from "mobx-state-tree"
import Task from "./Task"
import { isToday } from "tools/date"
import moment from "moment"

const TaskList = types
  .model("TaskList", {
    all: types.array(Task),
  })
  .views(self => ({
    get today() {
      return self.all.filter(
        task =>
          task.date && moment(task.date).isSame(moment().format("YYYY-MM-DD")),
      )
    },
    get expired() {
      return self.all.filter(
        task =>
          task.date &&
          moment(task.date).isBefore(moment().format("YYYY-MM-DD")),
      )
    },
    get inbox() {
      return self.all.filter(task => task.date === null)
    },
  }))
  .actions(self => ({
    add(task) {
      self.all.push(task)
    },
  }))

export default TaskList
