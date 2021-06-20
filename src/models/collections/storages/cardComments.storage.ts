import { createStorage, createStorageReference } from "../../utils"
import { types } from "mobx-state-tree"
import CardComment from "../CardComment"

console.log("CardComment", CardComment)

const storage = createStorage("cardComments", CardComment)

console.log("storage", storage)

export const commentsStorage = types.optional(storage, { id: "cardComments", elements: [] })

console.log("commentsStorage", commentsStorage)

export const commentReference = createStorageReference("cardComments", storage, CardComment, {
  "id": "",
  card: "",
  collectionId: "",
  text: "",
  user: "",
  createdAt: "",
  _temp: true,
})

console.log("commentReference", commentReference)