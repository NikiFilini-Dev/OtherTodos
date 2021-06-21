import { Instance, SnapshotIn, types } from "mobx-state-tree"

const User = types
  .model("User", {
    id: types.identifier,
    firstName: types.string,
    lastName: types.string,
    email: types.string,
  })
  .views(self => ({
    get syncable() {
      return false
    },
    get syncName() {
      return "User"
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

export default User
export type IUser = Instance<typeof User>
export type IUserSnapshot = SnapshotIn<typeof User>