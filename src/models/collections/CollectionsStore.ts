import { destroy, Instance, types } from "mobx-state-tree"
import Collection, { ICollectionSnapshot } from "./Collection"
import CollectionColumn, { ICollectionColumn, ICollectionColumnSnapshot } from "./CollectionColumn"
import CollectionCard, { ICollectionCard, ICollectionCardSnapshot } from "./CollectionCard"
import CollectionTag, { ICollectionTagSnapshot } from "./CollectionTag"
import CollectionLog from "./CollectionLog"
import { v4 as uuidv4 } from "uuid"
import CollectionSubtask, { ICollectionSubtask, ICollectionSubtaskSnapshot } from "./CollectionSubtask"

const CollectionsStore = types
  .model("CollectionsStore", {
    collections: types.array(Collection),
    columns: types.array(CollectionColumn),
    cards: types.array(CollectionCard),
    tags: types.array(CollectionTag),
    logs: types.array(CollectionLog),
    subtasks: types.array(CollectionSubtask),
    selectedCollection: types.maybeNull(types.reference(Collection)),
    editingCard: types.maybeNull(types.reference(CollectionCard))
  })
  .views(() => ({}))
  .actions(self => ({
    selectCard(id: string | null) {
      self.editingCard = id
    },
    addSubtask(initialData: Partial<ICollectionSubtaskSnapshot>) {
      if (!initialData.card) return

      const id = initialData.id ? initialData.id : uuidv4()
      if ("index" in initialData && typeof(initialData.card) !== "string") {
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
      if (newIndex > cardSubtasks.length - 1) newIndex = cardSubtasks.length - 1

      cardSubtasks.forEach(st => {
        if (st.id === subtask.id) return
        if (st.index < subtask.index && st.index >= newIndex) {
          st.setIndex(st.index+1)
        }
        if (st.index > subtask.index && st.index <= newIndex) {
          st.setIndex(st.index-1)
        }
      })

      subtask.setIndex(newIndex)

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
    },

    createCollection(initialData: Partial<ICollectionSnapshot>) {
      const id = uuidv4()
      self.collections.push({
        name: "Новая коллекция",
        ...initialData,
        id
      })
    },
    deleteCollection(id: string) {
      const collection = self.collections.find(c => c.id === id)
      if (!collection) throw new Error("collection not found")

      collection.columns.forEach(c => this.deleteColumn(c.id))
      collection.tags.forEach(c => this.deleteTag(c.id))

      destroy(collection)
    },

    createColumn(initialData: Partial<ICollectionColumnSnapshot>) {
      if (!initialData.collection) throw new Error("collection not specified")
      const id = uuidv4()

      const collection = self.collections.find(c => c.id === initialData.collection)
      if (!collection) throw new Error("collection not found")

      const index = collection.columns.reduce((acc, c) => acc > c.index ? acc : c.index, 0)

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
        if (c.index > column.id) c.setIndex(c.index - 1)
      })

      destroy(column)
    },
    moveColumn(id: string, newIndex: number) {
      const column = self.columns.find(c => c.id === id)
      if (!column) return false

      const collectionColumns: ICollectionColumn[] = column.collection.columns
      if (newIndex > collectionColumns.length - 1) newIndex = collectionColumns.length - 1

      collectionColumns.forEach(st => {
        if (st.id === column.id) return
        if (st.index < column.index && st.index >= newIndex) {
          st.setIndex(st.index+1)
        }
        if (st.index > column.index && st.index <= newIndex) {
          st.setIndex(st.index-1)
        }
      })

      column.setIndex(newIndex)

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
        ...initialData,
        id
      })
    },
    deleteTag(id: string) {
      const tag = self.tags.find(c => c.id === id)
      if (!tag) throw new Error("tag not found")

      self.cards.forEach(card => card.removeTag(id))

      destroy(tag)
    },

    createCard(initialData: Partial<ICollectionCardSnapshot>) {
      if (!initialData.collection) throw new Error("collection not specified")
      if (!initialData.column) throw new Error("column not specified")
      const id = uuidv4()

      const collection = self.collections.find(c => c.id === initialData.collection)
      if (!collection) throw new Error("collection not found")
      const column = self.columns.find(c => c.id === initialData.column)
      if (!column) throw new Error("column not found")

      let index = initialData.index
      if (!index) index = column.cards.reduce((acc, c) => c.index > acc ? c.index : acc, 0)

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
        index: 0
      })

      if (index !== column.cards.length-1) this.moveCard(id, column.id, index as number)
      return id
    },
    deleteCard(id: string) {
      const card = self.cards.find(c => c.id === id)
      if (!card) throw new Error("card not found")

      if (self.editingCard?.id === id) self.editingCard = null

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
