import { getRoot, types } from "mobx-state-tree"

const Category = types
  .model("ProjectCategory", {
    id: types.identifierNumber,
    name: types.string,
    index: types.number,
    folded: types.boolean,
  })
  .views(self => ({
    get tasks() {
      return getRoot(self).tasks.all.filter(
        task => task.category && task.category.id === self.id,
      )
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
    setFolded(val) {
      self.folded = val
    },
  }))

function genId() {
  return () => {
    Category
  }
}

export default Category
