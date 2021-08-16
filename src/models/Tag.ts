import { getRoot, Instance, types } from "mobx-state-tree"
import { IRootStore } from "./RootStore"
import { ColorNames } from "../palette/colors"

export function randomTagColor() {
  const colors = ColorNames
  return colors[Math.floor(Math.random() * colors.length)]
}

const Tag = types
  .model("Tag", {
    id: types.identifier,
    name: types.string,
    index: types.number,
    color: types.optional(types.maybeNull(types.string), randomTagColor()),
    type: types.optional(
      types.enumeration("TAG_TYPES", ["TASK", "EVENT"]),
      "TASK",
    ),
  })
  .views(self => ({
    get tasks() {
      return getRoot<IRootStore>(self).tasks.filter(task =>
        task.tags.includes(self),
      )
    },
    get syncable() {
      return true
    },
    get syncName() {
      return "Tag"
    },
    isReference(path) {
      const re = /^\/tags\/\d+$/
      return !re.test(path)
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setColor = val => {
      self.color = val
    }
    actionsMap.setColor = ["color"]

    actions.setIndex = i => {
      self.index = i
    }
    actionsMap.setIndex = ["index"]

    actions.setName = val => {
      self.name = val
    }
    actionsMap.setName = ["name"]

    actions.getActionsMap = () => actionsMap

    return actions
  })

export function factory(data) {
  if (data.project === "") data.project = null
  return data
}

export default Tag
export type ITag = Instance<typeof Tag>
