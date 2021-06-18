import { applySnapshot, getRoot, IAnyModelType, Instance, resolveIdentifier, SnapshotIn, types } from "mobx-state-tree"

export const createStorage = <T extends IAnyModelType>(name: string, type: T) => {
  return types.model({
    id: types.identifier,
    elements: types.array(type),
  })
    .actions(self => ({
      add(newElement: T) {
        if (self.elements.includes(newElement)) return
        self.elements.push(newElement)
      },

      remove<T extends { beforeDelete?: () => void }>(element: T) {
        if (!self.elements.includes(element)) return
        if ("beforeDelete" in element && element.beforeDelete) element.beforeDelete()
        self.elements.slice(self.elements.indexOf(element), 1)
      },
    }))
}

export const createStorageReference =
  <T extends IAnyModelType>(storageName: string, storageType: IAnyModelType, type: T, initialData: SnapshotIn<T>) => {
  return types.reference(type, {
    get(identifier, parent) {
      if (!parent) {
        console.log("NO PARENT")
        return null
      }
      const root = getRoot(parent)
      const storage = resolveIdentifier(storageType, root, storageName)

      const real = storage.elements.find((t: Instance<T>) => t.id === identifier)
      if (real) return real

      const tempElement = type.create({ ...initialData, id: identifier as string })
      storage.add(tempElement)

      window.syncMachine.getOne<T>(tempElement.syncName, identifier as string).then((data: SnapshotIn<T> | false) => {
        if (!data) return
        applySnapshot(tempElement, data)
      })
      return tempElement
    },

    set(value) {
      return value.id
    },
  })
}