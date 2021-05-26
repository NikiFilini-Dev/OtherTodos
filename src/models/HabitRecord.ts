import { Instance, types } from "mobx-state-tree"
import Habit, { IHabit } from "./Habit"

const HabitRecord = types
  .model("HabitRecord", {
    id: types.identifier,
    date: types.string,
    habit: types.reference(Habit)
  })
  .views(self => ({
    get syncable() {
      return true
    },
    get syncName() {
      return "HabitRecord"
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setDate = (val: string) => {
      self.date = val
    }

    actions.setHabit = (val: IHabit) => {
      self.habit = val
    }
    actionsMap.setName = ["name"]

    actions.getActionsMap = () => actionsMap
    return actions
  })


export function factory(data) {
  return data
}

export default HabitRecord
export type IHabitRecord = Instance<typeof HabitRecord>
