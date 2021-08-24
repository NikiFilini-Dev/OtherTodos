import { getRoot, Instance, SnapshotIn, types } from "mobx-state-tree"
import { ColorName, ColorNames } from "../../palette/colors"
import Collection, { ICollection } from "./Collection"
import { IRootStore } from "../RootStore"
import { IconName, IconNames } from "../../palette/icons"
import CollectionCard from "./CollectionCard"
import { find, findIndex } from "lodash"
import { move } from "../../tools/movement"

const AssignedColumn = types
  .model("AssignedColumn", {
    id: types.identifier,
    name: types.string,
    color: types.optional(types.enumeration("Color", ColorNames), "blue"),
    icon: types.optional(types.enumeration("Icon", IconNames), "lightning"),
    index: types.number,
    cards: types.array(types.reference(CollectionCard))
  })
  .views(self => ({
    get syncable() {
      return true
    },
    get syncName() {
      return "AssignedColumn"
    },
    // get cards() {
    //   const root = getRoot<IRootStore>(self)
    //   const cards = [...root.collectionsStore.cards.filter(card => card.column === self)]
    //   cards.sort((a,b) => a.index - b.index)
    //   return cards
    // }
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setName = (val: string) => self.name = val
    actionsMap.setName = ["name"]

    actions.setColor = (val: ColorName) => self.color = val
    actionsMap.setColor = ["color"]

    actions.setIcon = (val: IconName) => self.icon = val
    actionsMap.setIcon = ["icon"]

    actions.setIndex = (val: number) => self.index = val
    actionsMap.setIndex = ["index"]

    actions.insertCard = (cardId: string, index: number) => {
      if (index > self.cards.length) index = self.cards.length
      if (self.cards.find(c => c.id === cardId)) {
        self.cards.splice(self.cards.findIndex(c => c.id === cardId), 1)
      }

      self.cards.splice(index, 0, cardId)

      return true
    }
    actionsMap.insertCard = ["cards"]

    actions.removeCard = (cardId: string) => {
      const index = self.cards.findIndex(c => c.id === cardId)
      if (index < 0) return false

      self.cards.splice(index, 1)

      return true
    }
    actionsMap.removeCard = ["cards"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default AssignedColumn
export type IAssignedColumn = Instance<typeof AssignedColumn>
export type IAssignedColumnSnapshot = SnapshotIn<typeof AssignedColumn>
