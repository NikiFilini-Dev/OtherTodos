import { getRoot, types } from "mobx-state-tree"
import Project from "./Project"

const Tag = types
  .model("Tag", {
    id: types.identifierNumber,
    name: types.string,
    project: types.maybeNull(types.reference(Project)),
  })
  .views(self => ({
    get tasks() {
      getRoot(self).tasks.filter(task => task.tags.indexOf(self >= 0))
    },
  }))

export default Tag
