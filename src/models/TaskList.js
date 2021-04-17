import { types, destroy, getParent } from "mobx-state-tree"
import Task, { factory } from "./Task"
import { DateTime } from "luxon"

const TaskList = types
  .model("TaskList", {
    all: types.array(Task),
    selected: types.maybeNull(types.reference(Task)),
  })
  .views(self => ({
    get today() {
      return self.all.filter(task => {
        return (
          task.date &&
          DateTime.fromFormat(task.date, "D") === DateTime.now().startOf("day")
        )
      })
    },
    expired() {
      return self.all.filter(
        task =>
          task.date &&
          DateTime.fromFormat(task.date, "D").startOf("day") <
            DateTime.now().startOf("day"),
      )
    },
    get inbox() {
      return self.all.filter(task => task.date === null)
    },
  }))
  .actions(self => ({
    select(task) {
      if (task === getParent(self).tempTask && task !== null) return
      self.selected = task
    },
    add(task) {
      if (getParent(self).tempTask === task) getParent(self).detachTempTask()
      self.all.push(task)
    },
    deleteTask(task) {
      if (self.selected === task) self.selected = null
      if (task.event) task.unconnectEvent()
      self.all.splice(self.all.indexOf(task), 1)
      window.syncMachine.registerDelete(task.id, "task")
      destroy(task)
    },
    loadTasksFromData(tasksData) {
      self.all = tasksData.map(data => factory(data.id, data))
    },
  }))

export default TaskList
