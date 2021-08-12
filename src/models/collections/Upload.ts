import { getRoot, Instance, SnapshotIn, types } from "mobx-state-tree"
import { ColorName, ColorNames } from "../../palette/colors"
import Collection from "./Collection"
import { IRootStore } from "../RootStore"

const Upload = types
  .model("Upload", {
    id: types.identifier,
    size: types.number,
    name: types.string,
    extension: types.string,
    userId: types.string,
    preview: types.maybeNull(types.string),
  })
  .views(self => ({
    get syncable() {
      return false
    },
    get syncName() {
      return "Upload"
    },
    get url() {
      const base_url = "/s3"
      return `${base_url}/${self.userId}/${self.id}.${self.extension}`
    },
    get previewUrl() {
      const base_url = "/s3"
      return `${base_url}/${self.userId}/${self.preview}.${self.extension}`
    },
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
