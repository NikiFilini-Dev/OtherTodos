import { types, destroy, getParent, getRoot } from "mobx-state-tree"
import Task, { factory } from "./Task"
import { DateTime } from "luxon"

const TaskList = types
  .model("TaskList", {
    all: types.array(Task),
    selected: types.maybeNull(types.string), //types.maybeNull(types.reference(Task)),
  })
  .views(self => ({
    get today() {
      return self.all.filter(task => {
        return (
          task.date &&
          DateTime.fromFormat(task.date, "M/d/yyyy") ===
            DateTime.now().startOf("day")
        )
      })
    },
    expired() {
      return self.all.filter(
        task =>
          task.date &&
          DateTime.fromFormat(task.date, "M/d/yyyy").startOf("day") <
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
      self.selected = task?.id
    },
    add(task) {
      if (getParent(self).tempTask === task) getParent(self).detachTempTask()
      self.all.push(task)
    },
    deleteTask(task) {
      if (self.selected === task) self.selected = null
      if (task.event) task.unconnectEvent()
      window.syncMachine.registerDelete(task.id, task.syncName)
      const root = getRoot(self)
      task.subtasks.forEach(st => {
        root.deleteSubtask(st.id)
      })
      self.all.splice(self.all.indexOf(task), 1)
      destroy(task)
    },
    loadTasksFromData(tasksData) {
      self.all = tasksData.map(data => factory(data.id, data))
    },
  }))

export default TaskList
