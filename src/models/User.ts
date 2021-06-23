import { types } from "mobx-state-tree"

const User = types
  .model("User", {
    token: types.string,
    id: types.identifier,
    firstName: types.string,
    lastName: types.string,
    email: types.string,
  })
  .views(self => ({
    get fullName() {
      return self.firstName + self.lastName
    },
  }))
  .actions(self => ({
    setName(name) {
      self.firstName = name
    },
    setLastName(val) {
      self.lastName = val
    },
    setToken(val) {
      self.token = val
    },
  }))

export default User
