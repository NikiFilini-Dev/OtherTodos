import { getRoot, types } from "mobx-state-tree"

const Project = types
  .model("Project", {
    id: types.identifier,
    name: types.string,
  })
  .views((self) => ({
    get tasks() {
      return getRoot(self).tasks.filter((task) => task.project.id === self.id)
    },
    get sortedTasks() {
      let tasks = self.tasks
      tasks.sort((a, b) => parseInt(b.id) - parseInt(a.id))
      tasks.sort((a, b) => a.done - b.done)
      return tasks
    },
  }))

export default Project
