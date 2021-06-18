import { createStorage, createStorageReference } from "../../utils"
import Upload from "../Upload"
import { types } from "mobx-state-tree"

const storage = createStorage("uploads", Upload)
export const uploadsStorage = types.optional(storage, { id: "uploads", elements: [] })
export const uploadReference = createStorageReference("uploads", storage, Upload, {
  "id": "f1abc80b-b573-4334-a8c9-f78af960b459",
  "size": 468211,
  "name": "DEFAULT",
  "extension": "png",
  "userId": "",
})