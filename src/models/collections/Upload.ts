import { getRoot, Instance, SnapshotIn, types } from "mobx-state-tree"
import { ColorName, ColorNames } from "../../palette/colors"
import Collection from "./Collection"
import { IRootStore } from "../RootStore"

const Upload = types
  .model("Upload", {
    id: types.identifier,
    size: types.number,
    name: types.string,
    extension: types.string
  })
  .views(self => ({
    get syncable() {
      return false
    },
    get syncName() {
      return "Upload"
    },
    get url() {
      const base_url = "http://d8m2rzrk8wge.cloudfront.net"
      const {user} = getRoot<IRootStore>(self)
      return `${base_url}/${user.id}/${self.id}.${self.extension}`
    }
  }))
  .actions(() => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default Upload
export type IUpload = Instance<typeof Upload>
export type IUploadSnapshot = SnapshotIn<typeof Upload>