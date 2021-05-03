import { destroy, getRoot, Instance, types } from "mobx-state-tree"
import ProjectCategory from "./ProjectCategory"
import { v4 as uuidv4 } from "uuid"
import RootStore, { IRootStore } from "./RootStore"

const Project = types
  .model("Project", {
    id: types.identifier,
    name: types.string,
    index: types.number,
    categories: types.array(types.reference(ProjectCategory)),
  })
  .views(self => ({
    get tasks() {
      return getRoot<typeof RootStore>(self).tasks.filter(
        task => task.project.id === self.id,
      )
    },
    get sortedTasks() {
      const tasks = this.tasks
      tasks.sort((a, b) => parseInt(b.id) - parseInt(a.id))
      tasks.sort((a, b) => a.done - b.done)
      return tasks
    },
    get syncable() {
      return true
    },
    get syncName() {
      return "Project"
    },
  }))
  .actions(self => {
    const actions: { [key: string]: any } = {}
    const actionsMap: { [key: string]: string[] } = {}

    actions.setName = name => {
      self.name = name
    }
    actionsMap.setName = ["name"]

    actions.setIndex = val => {
      self.index = val
    }
    actionsMap.setIndex = ["index"]

    actions.addCategory = data => {
      const lastIndex = self.categories.reduce(
        (acc, category) => (category.index > acc ? category.index : acc),
        -1,
      )
      data = {
        id: uuidv4(),
        name: "Новая категория",
        index: lastIndex + 1,
        folded: false,
        ...data,
      }
      getRoot<IRootStore>(self).addCategory(data)
      self.categories.push(data.id)
    }
    actionsMap.addCategory = ["categories"]

    actions.removeCategory = category => {
      self.categories.splice(self.categories.indexOf(category), 1)
    }
    actionsMap.removeCategory = ["categories"]

    actions.getActionsMap = () => actionsMap

    return actions
  })

export default Project
export type IProject = Instance<typeof Project>
