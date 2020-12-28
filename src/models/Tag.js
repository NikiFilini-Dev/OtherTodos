import { getRoot, types } from "mobx-state-tree"

const Tag = types
  .model("Tag", {
    id: types.identifierNumber,
    name: types.string,
  })
  .views(self => ({
    get tasks() {
      return getRoot(self).tasks.filter(task => task.tags.indexOf(self >= 0))
    },
  }))

export default Tag
