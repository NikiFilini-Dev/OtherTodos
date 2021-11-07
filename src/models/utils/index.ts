import { toJS } from "mobx"
import {
  applySnapshot,
  getRoot,
  IAnyModelType,
  Instance,
  ISimpleType,
  resolveIdentifier,
  resolvePath,
  SnapshotIn,
  types,
} from "mobx-state-tree"

export const createStorage = <
  T extends IAnyModelType & { id: ISimpleType<string> }
>(
  name: string,
  type: T,
) => {
  return types
    .model({
      id: types.identifier,
      elements: types.array(type),
    })
    .actions(self => ({
      add(newElement: T) {
        if (self.elements.find(e => e.id === newElement.id)) return
        self.elements.push(newElement)
      },

      addList(elements: T[]) {
        elements.forEach(newElement => {
          if (self.elements.find(e => e.id === newElement.id)) return
          self.elements.push(newElement)
        })
      },

      remove<T extends { beforeDelete?: () => void }>(element: T) {
        if (!self.elements.includes(element)) return
        if ("beforeDelete" in element && element.beforeDelete)
          element.beforeDelete()
        self.elements.slice(self.elements.indexOf(element), 1)
      },
    }))
}

const loadData = <T>(syncName, id, initialData, storage, tempEl) => {
  return window.syncMachine
    .getOne<T>(syncName, id)
    .then((data: SnapshotIn<T> | false) => {
      if (!data) return
      const tempElement = {
        ...initialData,
        id,
        ...data,
      }
      applySnapshot(tempEl, tempElement)
      return [storage, tempElement]
    })
}

let plans: Record<string, [string, string, any, any, IAnyModelType]> = {}
const tempElements: Record<string, IAnyModelType> = {}
let timer

const loadAll = () => {
  const storages: Record<any, any[]> = {}
  const keys = Object.keys(plans)
  const _s = {}

  const func = () =>
    Promise.all(keys.splice(0, 100).map(id => loadData(...plans[id]))).then(
      results => {
        results.forEach(props => {
          // @ts-ignore
          const [storage, tempElement] = props
          _s[storage.id] = storage
          if (storage.id in storages) storages[storage.id].push(tempElement)
          else storages[storage.id] = [tempElement]
        })
        if (keys.length) func()
        else {
          // @ts-ignore
          Object.keys(storages).forEach(storage => {
            _s[storage].addList(storages[storage])
          })
          plans = {}
          timer = undefined
        }
      },
    )
  func()
}

// setInterval(() => loadAll(), 1000)

export const createStorageReference = <T extends IAnyModelType>(
  storageName: string,
  storageType: IAnyModelType,
  type: T,
  initialData: SnapshotIn<T>,
) => {
  return types.reference(type, {
    get(identifier, parent) {
      const root = getRoot(parent)
      const storage = resolveIdentifier(storageType, root, storageName)
      const real = storage?.elements.find(
        (t: Instance<T>) => t.id === identifier,
      )
      if (real) {
        return real
      }
      if (identifier in tempElements) return tempElements[identifier]

      const tempElement = type.create({
        ...initialData,
        id: identifier as string,
      })
      tempElements[identifier] = tempElement
      if (plans[identifier]) return tempElement
      if (!parent) {
        return null
      }
      plans[identifier] = [
        tempElement.syncName,
        identifier as string,
        initialData,
        storage,
        tempElement,
      ]
      if (timer) clearTimeout(timer)
      timer = setTimeout(loadAll, 500)

      return tempElement
    },

    set(value) {
      return value.id
    },
  })
}

export const safeRef = <T extends IAnyModelType>(
  type: T,
  path,
  action,
  initialData: SnapshotIn<T>,
) => {
  return types.reference(type, {
    get(identifier, parent) {
      const item = type.create({ ...initialData, id: identifier as string })

      if (parent) {
        const root = getRoot(parent)
        const initial = resolveIdentifier(type, root, identifier)
        if (initial) return initial

        const list = resolvePath(getRoot(parent), path)
        list[action](item)
      }

      return item
    },

    set(value) {
      return value.id
    },
  })
}
