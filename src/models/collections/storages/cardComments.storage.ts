import { createStorage, createStorageReference } from "../../utils"
import { types } from "mobx-state-tree"
import CardComment from "../CardComment"

const storage = createStorage("cardComments", CardComment)
export const commentsStorage = types.optional(storage, { id: "cardComments", elements: [] })
export const commentReference = createStorageReference("cardComments", storage, CardComment, {
  "id": "",
  card: "",
  collectionId: "",
  text: "",
  original: "",
  user: "",
  createdAt: "",
  _temp: true,
})

console.log("commentReference", commentReference)