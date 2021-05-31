import {
  getParent,
  getRoot,
  IMSTArray,
  Instance,
  ISimpleType,
  types,
} from "mobx-state-tree"
import { CustomRange } from "../global"
import { DateTime } from "luxon"
import { IRootStore } from "./RootStore"
import { IHabitRecord } from "./HabitRecord"
import { ColorName, ColorNames } from "../palette/colors"
import { IconName, IconNames } from "../palette/icons"

export const HabitTypes: HabitType[] = ["daily", "weekly", "monthly", "custom"]
export type HabitType = "daily" | "weekly" | "monthly" | "custom"

const Habit = types
  .model("Habit", {
    id: types.identifier,
    name: types.string,
    recordsPerDay: types.number,
    color: types.enumeration("ColorNames", ColorNames),
    icon: types.enumeration("IconNames", IconNames),
    type: types.enumeration("HabitType", HabitTypes),
    weeklyDays: types.array(types.number),
    monthlyDays: types.array(types.number),
  })
  .views(self => ({
    get syncable() {
      return !("tempHabit" in getParent(self))
    },
    get syncName() {
      return "Habit"
    },
    hasDate(dateString: string): boolean {
      const date = DateTime.fromFormat(dateString, "M/d/yyyy")

      if (self.type === "daily") return true
      if (self.type === "weekly") return self.weeklyDays.includes(date.weekday)
      if (self.type === "monthly") return self.monthlyDays.includes(date.day)

      return false
    },
    get records() {
      return getRoot<IRootStore>(self).habitRecords.filter(
        (hr: IHabitRecord) => hr.habit === self,
      )
    },
    isDone(date: string) {
      return this.records.filter(r => r.date === date).length === self.recordsPerDay
    }
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, (keyof IHabit)[]> = {}

    actions.setName = (val: string) => {
      self.name = val
    }
    actionsMap.setName = ["name"]

    actions.setRecordsPerDay = (val: number) => {
      self.recordsPerDay = val
    }
    actionsMap.setRecordsPerDay = ["recordsPerDay"]

    actions.setColor = (val: ColorName) => {
      self.color = val
    }
    actionsMap.setColor = ["color"]

    actions.setIcon = (val: IconName) => {
      self.icon = val
    }
    actionsMap.setIcon = ["icon"]

    actions.setType = (val: HabitType) => {
      self.type = val
    }
    actionsMap.setType = ["type"]

    actions.toggleWeeklyDay = (val: CustomRange<1, 8>) => {
      if (self.weeklyDays.includes(val))
        self.weeklyDays.splice(self.weeklyDays.indexOf(val), 1)
      else self.weeklyDays.push(val)
    }
    actionsMap.toggleWeeklyDay = ["weeklyDays"]

    actions.setWeeklyDays = (val: CustomRange<1, 8>[]) => {
      self.weeklyDays = val as IMSTArray<ISimpleType<number>>
    }
    actionsMap.setWeeklyDays = ["weeklyDays"]

    actions.toggleMonthlyDay = (val: CustomRange<1, 32>) => {
      if (self.monthlyDays.includes(val))
        self.monthlyDays.splice(self.monthlyDays.indexOf(val), 1)
      else self.monthlyDays.push(val)
    }
    actionsMap.toggleMonthlyDay = ["monthlyDays"]

    actions.setMonthlyDays = (val: CustomRange<1, 32>[]) => {
      self.monthlyDays = val as IMSTArray<ISimpleType<number>>
    }
    actionsMap.setMonthlyDays = ["monthlyDays"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default Habit
export type IHabit = Instance<typeof Habit>
