import { destroy, getRoot, types } from "mobx-state-tree"
import ProjectCategory from "./ProjectCategory"

const Project = types
  .model("Project", {
    id: types.identifierNumber,
    name: types.string,
    index: types.number,
    categories: types.array(ProjectCategory),
  })
  .views(self => ({
    get tasks() {
      return getRoot(self).tasks.filter(task => task.project.id === self.id)
    },
    get sortedTasks() {
      let tasks = self.tasks
      tasks.sort((a, b) => parseInt(b.id) - parseInt(a.id))
      tasks.sort((a, b) => a.done - b.done)
      return tasks
    },
  }))
  .actions(self => ({
    setName(name) {
      self.name = name
    },
    setIndex(val) {
      self.index = val
    },
    addCategory(data) {
      const lastIndex = self.categories.reduce(
        (acc, category) => (category.index > acc ? category.index : acc),
        -1,
      )
      const lastId = self.categories.reduce(
        (acc, category) => (category.id > acc ? category.id : acc),
        0,
      )
      data = {
        id: lastId + 1,
        name: "Новая категория",
        index: lastIndex + 1,
        folded: false,
        ...data,
      }
      // self.categories = []
      console.log(self.categories.toJSON())
      self.categories.push(data)
    },
    removeCategory(category) {
      destroy(category)
    },
  }))

export default Project
