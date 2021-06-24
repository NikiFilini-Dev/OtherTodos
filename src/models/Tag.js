import { getRoot, types } from "mobx-state-tree"

export function randomTagColor() {
  const colors = [
    "#e53935",
    "#D81B60",
    "#8E24AA",
    "#5E35B1",
    "#3949AB",
    "#1E88E5",
    "#00ACC1",
    "#00897B",
    "#43A047",
    "#FFB300",
    "#FB8C00",
    "#F4511E",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const Tag = types
  .model("Tag", {
    id: types.identifier,
    name: types.string,
    index: types.number,
    color: types.maybeNull(types.string, randomTagColor()),
    type: types.optional(
      types.enumeration("TAG_TYPES", ["TASK", "EVENT"]),
      "TASK",
    ),
  })
  .views(self => ({
    get tasks() {
      return getRoot(self).tasks.filter(task => task.tags.indexOf(self >= 0))
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
    const actions = {}
    const actionsMap = {}

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
