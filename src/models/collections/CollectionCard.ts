import { getRoot, Instance, SnapshotIn, types } from "mobx-state-tree"
import CollectionTag from "./CollectionTag"
import Collection from "./Collection"
import CollectionColumn from "./CollectionColumn"
import { IRootStore } from "../RootStore"
import { uploadReference } from "./storages/uploads.storage"
import { commentReference } from "./storages/cardComments.storage"
import Task from "../Task"
import { userReference } from "./storages/users.storage"

console.log(commentReference)

const CollectionCard = types
  .model("CollectionCard", {
    id: types.identifier,
    name: types.string,
    text: types.maybeNull(types.string),
    date: types.maybeNull(types.string),
    tags: types.array(types.reference(CollectionTag)),
    collection: types.reference(Collection),
    column: types.reference(CollectionColumn),
    index: types.number,
    status: types.optional(types.enumeration("CardStatus", ["ACTIVE", "DONE"]), "ACTIVE"),
    files: types.array(uploadReference),
    preview: types.maybeNull(uploadReference),
    comments: types.array(types.maybeNull(commentReference)),
    task: types.maybeNull(types.reference(Task)),
    assigned: types.maybeNull(userReference),
    _temp: types.optional(types.boolean, false),
  })
  .views(self => ({
    get syncable() {
      return !self._temp
    },
    get syncName() {
      return "CollectionCard"
    },
    get syncRename() {
      return {collection: "collectionId", column: "columnId"}
    },
    get syncIgnore() {
      return ["_temp", "comments"]
    },
    get subtasks() {
      const root = getRoot<IRootStore>(self)
      return root.collectionsStore.subtasks.filter(st => st.card === self)
    },

    get doneSubtasks() {
      return this.subtasks.filter(st => st.status === "DONE")
    },

    get donePercent() {
      return this.doneSubtasks.length * (100 / this.subtasks.length)
    }
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.pushNewComment = val => self.comments.push(val)
    actionsMap.pushNewComment = []

    actions.deleteComment = (id: string) => {
      window.syncMachine.registerDelete(id, "CardComment")
      // @ts-ignore
      self.comments.splice(self.comments.indexOf(id), 1)
    }
    actionsMap.deleteComment = ["comments"]

    actions.setPreview = val => self.preview = val
    actionsMap.setPreview = ["preview"]

    actions.addFile = (val) => {
      if (self.files.includes(val)) return
      self.files.push(val)
    }
    actionsMap.addFile = ["files"]

    actions.removeFile = (val) => {
      if (!self.files.includes(val)) return
      if (self.preview !== null && val?.id === self.preview.id) self.preview = null
      self.files.splice(self.files.indexOf(val),1)
    }
    actionsMap.removeFile = ["files", "preview"]

    actions.setName = (val: string) => self.name = val
    actionsMap.setName = ["name"]

    actions.setIndex = (val: number) => self.index = val
    actionsMap.setIndex = ["index"]

    actions.setText = (val: string) => self.text = val.length ? val : null
    actionsMap.setText = ["text"]

    actions.setDate = (val: string) => self.date = val
    actionsMap.setDate = ["date"]

    actions.setTags = (val) => self.tags = val
    actionsMap.setTags = ["tags"]

    actions.addTag = (val) => {
      if (self.tags.includes(val)) return
      self.tags.push(val)
    }
    actionsMap.addTag = ["tags"]

    actions.removeTag = (val) => {
      if (!self.tags.includes(val)) return
      self.tags.splice(self.tags.indexOf(val),1)
    }
    actionsMap.removeTag = ["tags"]

    actions.setCollection = (val) => {
      self.collection = val
      if (self.column.collection !== self.collection && self.collection.columns.length > 0)
        self.column = self.collection.columns[0]
    }
    actionsMap.setCollection = ["collection"]

    actions.setColumn = (val) => self.column = val
    actionsMap.setColumn = ["column"]

    actions.setStatus = (val: "DONE" | "ACTIVE") => self.status = val
    actionsMap.setStatus = ["status"]

    actions.addTask = () => {
      const root = getRoot<IRootStore>(self)
      const task = root.createTask({
        text: self.name,
        note: self.text,
        date: self.date
      })
      root.tasks.add(task)
      self.task = task
    }
    actionsMap.addTask = ["task"]

    actions.removeTask = () => self.task = null
    actionsMap.removeTask = ["task"]

    actions.assignUser = val => self.assigned = val
    actionsMap.assignUser = ["assigned"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default CollectionCard
export type ICollectionCard = Instance<typeof CollectionCard>
export type ICollectionCardSnapshot = SnapshotIn<typeof CollectionCard>
