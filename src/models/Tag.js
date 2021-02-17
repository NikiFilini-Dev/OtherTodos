import { getRoot, types } from "mobx-state-tree"
import Project from "./Project"

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
    project: types.maybeNull(types.reference(Project)),
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
  }))
  .actions(self => ({
    setColor(val) {
      self.color = val
    },
    setIndex(i) {
      self.index = i
    },
    setName(val) {
      self.name = val
    },
  }))

export default Tag
