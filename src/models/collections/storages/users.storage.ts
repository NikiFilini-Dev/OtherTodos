import { createStorage, createStorageReference } from "../../utils"
import { types } from "mobx-state-tree"
import User from "../OtherUser"

const storage = createStorage("users", User)
export const usersStorage = types.optional(storage, { id: "users", elements: [] })
export const userReference = createStorageReference("users", storage, User, {
  "id": "",
  "firstName": "LOADING",
  "lastName": "LOADING",
  email: "LOADING"
})