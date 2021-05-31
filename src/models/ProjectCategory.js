import { getRoot, getParent, types, getType } from "mobx-state-tree"
import { IconNames } from "../palette/icons"

const Category = types
  .model("ProjectCategory", {
    id: types.identifier,
    name: types.string,
    index: types.number,
    folded: types.boolean,
    icon: types.optional(types.enumeration("Icons", IconNames), "check_list")
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
    get syncable() {
      console.log("PARENT:", getType(getParent(getParent(self))))
      return getParent(getParent(self)) === getRoot(self)
    },
    get syncName() {
      return "ProjectCategory"
    },
    isReference(path) {
      const re = /^\/categories\/\d+$/
      return !re.test(path)
    },
  }))
  .actions(self => {
    const actions = {}
    const actionsMap = {}

    actions.setName = name => self.name = name
    actionsMap.setName = ["name"]

    actions.setIndex = val => self.index = val
    actionsMap.setIndex = ["index"]

    actions.setFolded = val => self.folded = val
    actionsMap.setFolded = ["folded"]

    actions.setIcon = val => self.icon = val
    actionsMap.setIcon = ["icon"]

    actions.getActionsMap = () => actionsMap

    return actions
  })

export default Category
