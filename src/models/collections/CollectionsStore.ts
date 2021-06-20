import { destroy, getRoot, Instance, types } from "mobx-state-tree"
import Collection, { ICollectionSnapshot } from "./Collection"
import CollectionColumn, { ICollectionColumn, ICollectionColumnSnapshot } from "./CollectionColumn"
import CollectionCard, { ICollectionCard, ICollectionCardSnapshot } from "./CollectionCard"
import CollectionTag, { ICollectionTag, ICollectionTagSnapshot } from "./CollectionTag"
import CollectionLog from "./CollectionLog"
import { v4 as uuidv4 } from "uuid"
import CollectionSubtask, { ICollectionSubtask, ICollectionSubtaskSnapshot } from "./CollectionSubtask"
import { move } from "../../tools/movement"
import { IRootStore } from "../RootStore"
import Upload from "./Upload"
import { uploadsStorage } from "./storages/uploads.storage"
import { usersStorage } from "./storages/users.storage"
import { safeRef } from "../utils"



const CollectionsStore = types
  .model("CollectionsStore", {
    collections: types.array(Collection),
    columns: types.array(CollectionColumn),
    cards: types.array(CollectionCard),
    tags: types.array(CollectionTag),
    logs: types.array(CollectionLog),
    subtasks: types.array(CollectionSubtask),
    uploads: uploadsStorage,
    users: usersStorage,

    selectedCollection: types.maybeNull(
      safeRef(Collection, "/collectionsStore", "pushCollection", {
        id: "",
        name: "LOADING",
        index: 0,
        users: [],
        userId: "",
        icon: "bookmark",
        _temp: true
      })
    ),
    editingCard: types.maybeNull(
      safeRef(CollectionCard, "/collectionsStore", "pushCard", {
        id: "",
        name: "LOADING",
        index: 0,
        _temp: true,
        collection: "",
        column: ""
      })
    ),
    editingCollection: types.maybeNull(types.reference(Collection)),
    uploadView: types.maybeNull(types.reference(Upload)),
  })
  .views(() => ({}))
  .actions(self => ({
    pushCollection(val) {
      self.collections.push(val)
    },
    pushColumn(val) {
      self.columns.push(val)
    },
    pushCard(val) {
      self.cards.push(val)
    },

    setUploadView(data) {
      self.uploadView = data
    },

    selectCard(val) {
      self.editingCard = val
      let cardId
      let collectionId
      if (typeof val === "string") {
        cardId = val
        collectionId = self.cards.find(c => c.id === cardId)?.collection.id
        if (collectionId) history.pushState({}, document.title, "/app/collections/"+collectionId+"/"+cardId)
      } else {
        cardId = val.id
        collectionId = typeof val.collection === "string" ? val.collection : val.collection.id
        history.pushState({}, document.title, "/app/collections/"+collectionId+"/"+cardId)
      }

    },
    selectEditingCollection(val) {
      self.editingCollection = val
    },
    addSubtask(initialData: Partial<ICollectionSubtaskSnapshot>) {
      if (!initialData.card) return

      const id = initialData.id ? initialData.id : uuidv4()
      if ("index" in initialData && typeof(initialData.card) !== "string") {
        // @ts-ignore
        initialData.card.subtasks.forEach(st => {
          if (st.index >= (initialData.index as number))
            st.setIndex(st.index + 1)
        })
      }
      self.subtasks.push({
        status: "ACTIVE",
        text: "",
        card: initialData.card,
        index:
          self.subtasks.reduce(
            (acc: number, subtask: ICollectionSubtask) =>
              subtask.index > acc ? subtask.index : acc,
            -1,
          ) + 1,
        ...initialData,
        id,
      })
      this.healthCheckSubtasks()
      return id
    },
    healthCheckSubtasks() {
      const groups: {[key: string]: ICollectionSubtask[]} = {}
      self.subtasks.forEach(st => {
        if (st.card.id in groups) groups[st.card.id].push(st)
        else groups[st.card.id] = [st]
      })

      Object.values(groups).forEach(group => {
        group.sort((a,b) => a.index - b.index)
        group.forEach((st, i) => {
          if (st.index !== i) st.setIndex(i)
        })
      })
    },
    moveSubtask(id: string, newIndex: number): boolean {
      this.healthCheckSubtasks()
      const subtask = self.subtasks.find(st => st.id === id)
      if (!subtask) return false
      const cardSubtasks: ICollectionSubtask[] = subtask.card.subtasks

      move(cardSubtasks, id, newIndex)

      return true
    },
    deleteSubtask(id: string): boolean {
      this.healthCheckSubtasks()
      const subtask = self.subtasks.find(st => st.id === id)
      if (!subtask) return false

      subtask.card.subtasks.forEach(st => {
        if (st.index > subtask.index) st.setIndex(st.index - 1)
      })

      if (subtask.syncable)
        window.syncMachine.registerDelete(subtask.id, subtask.syncName)

      destroy(subtask)
      return true
    },

    selectCollection(id: string | null) {
      if (!id) {
        self.selectedCollection = null
        return
      }
      const collection = self.collections.find(c => c.id === id)
      if (!collection) throw new Error("collection not found")

      self.selectedCollection = collection

      history.pushState({}, document.title, "/app/collections/"+id)
    },

    createCollection(initialData: Partial<ICollectionSnapshot>) {
      const id = uuidv4()
      self.collections.push({
        index: self.collections.reduce((acc, c) => c.index > acc ? c.index : acc, -1) + 1,
        name: "Новая коллекция",
        ...initialData,
        id,
        users: [],
        userId: ""
      })
      return id
    },
    deleteCollection(id: string) {
      const collection = self.collections.find(c => c.id === id)
      if (!collection) throw new Error("collection not found")

      collection.columns.forEach(c => this.deleteColumn(c.id))
      collection.tags.forEach(c => this.deleteTag(c.id))

      self.collections.forEach(c => {
        if (c.index > collection.index) c.setIndex(c.index - 1)
      })

      if (self.selectedCollection === collection) {
        self.selectedCollection = null
        if (!self.collections.filter(c => c.id !== id).length) {
          const root = getRoot<IRootStore>(self)
          root.setScreen("TODAY")
        }
      }
      if (self.editingCollection === collection) self.editingCollection = null




      if (collection.syncable)
        window.syncMachine.registerDelete(collection.id, collection.syncName)

      destroy(collection)
    },

    createColumn(initialData: Partial<ICollectionColumnSnapshot>) {
      if (!initialData.collection) throw new Error("collection not specified")
      const id = uuidv4()

      const collection = self.collections.find(c => c.id === initialData.collection)
      if (!collection) throw new Error("collection not found")

      const index = collection.columns.reduce((acc, c) => acc > c.index ? acc : c.index, -1)

      self.columns.push({
        collection: initialData.collection,
        index: index+1,
        name: "Новая коллекция",
        ...initialData,
        id
      })
    },
    deleteColumn(id: string) {
      const column = self.columns.find(c => c.id === id)
      if (!column) throw new Error("column not found")

      column.collection.columns.forEach(c => {
        if (c.id === id) return
        if (c.index > column.index) c.setIndex(c.index - 1)
      })

      column.cards.forEach(c => this.deleteCard(c.id))

      if (column.syncable)
        window.syncMachine.registerDelete(column.id, column.syncName)

      destroy(column)
    },
    moveColumn(id: string, newIndex: number) {
      const column = self.columns.find(c => c.id === id)
      if (!column) return false
      const collectionColumns: ICollectionColumn[] = column.collection.columns
      move(collectionColumns, id, newIndex)
      return true
    },

    createTag(initialData: Partial<ICollectionTagSnapshot>) {
      if (!initialData.collection) throw new Error("collection not specified")
      const id = uuidv4()

      const collection = self.collections.find(c => c.id === initialData.collection)
      if (!collection) throw new Error("collection not found")

      self.tags.push({
        collection: initialData.collection,
        color: "blue",
        name: "Новый тэг",
        index: self.tags
          .filter(t => t.collection === collection)
          .reduce((acc, c) => c.index > acc ? c.index : acc, -1)+1,
        ...initialData,
        id
      })
    },
    deleteTag(id: string) {
      const tag = self.tags.find(c => c.id === id)
      if (!tag) throw new Error("tag not found")

      self.cards.forEach(card => card.removeTag(id))

      if (tag.syncable)
        window.syncMachine.registerDelete(tag.id, tag.syncName)

      destroy(tag)
    },
    moveTag(id: string, newIndex: number) {
      const tag = self.tags.find(c => c.id === id)
      if (!tag) throw new Error("tag not found")
      const collectionTags: ICollectionTag[] = tag.collection.tags
      move(collectionTags, id, newIndex)
      return true
    },

    createCard(initialData: Partial<ICollectionCardSnapshot>) {
      if (!initialData.collection) throw new Error("collection not specified")
      if (!initialData.column) throw new Error("column not specified")
      const id = uuidv4()

      const collection = self.collections.find(c => c.id === initialData.collection)
      if (!collection) throw new Error("collection not found")
      const column = self.columns.find(c => c.id === initialData.column)
      if (!column) throw new Error("column not found")

      console.log(initialData)
      let index = initialData.index
      if (index === undefined) index = column.cards.reduce((acc, c) => c.index > acc ? c.index : acc, -1)+1
      index = index!

      // @ts-ignore
      self.cards.push({
        collection,
        column,
        name: "Новая карточка",
        text: null,
        date: null,
        tags: [],
        ...initialData,
        id,
        index
      })

      column.cards.forEach(c => {
        if (c.id === id) return
        if (c.index >= index!) c.setIndex(c.index + 1)
      })
      return id
    },
    deleteCard(id: string) {
      const card = self.cards.find(c => c.id === id)
      if (!card) throw new Error("card not found")

      if (self.editingCard?.id === id) self.editingCard = null

      card.subtasks.forEach(st => this.deleteSubtask(st.id))

      if (card.syncable)
        window.syncMachine.registerDelete(card.id, card.syncName)

      destroy(card)
    },
    moveCard(id: string, newColumnId: string, newIndex: number) {
      const card = self.cards.find(c => c.id === id)
      if (!card) throw new Error("card not found")

      if (newColumnId === card.column.id) {
        const columnCards: ICollectionCard[] = card.column.cards
        if (newIndex > columnCards.length - 1) newIndex = columnCards.length - 1

        columnCards.forEach(st => {
          if (st.id === card.id) return
          if (st.index < card.index && st.index >= newIndex) {
            st.setIndex(st.index + 1)
          }
          if (st.index > card.index && st.index <= newIndex) {
            st.setIndex(st.index - 1)
          }
        })

        card.setIndex(newIndex)
      } else {
        const newColumn = self.columns.find(c => c.id === newColumnId)
        if (!newColumn) throw new Error("new column not found: "+newColumnId)

        const currentColumnCards: ICollectionCard[] = card.column.cards
        const newColumnCards: ICollectionCard[] = newColumn.cards

        if (newIndex > newColumnCards.length) newIndex = newColumnCards.length
        console.log("New index:", newIndex)
        currentColumnCards.forEach(crd => {
          if (crd.index > card.index) crd.setIndex(crd.index - 1)
        })
        newColumnCards.forEach(crd => {
          if (crd.index >= newIndex) crd.setIndex(crd.index + 1)
        })

        card.setIndex(newIndex)
        card.setColumn(newColumn)
      }

      return true
    },
  }))

export default CollectionsStore
export type ICollectionsStore = Instance<typeof CollectionsStore>
