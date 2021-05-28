import {
  getParent,
  getRoot,
  IMSTArray,
  Instance,
  ISimpleType,
  types,
} from "mobx-state-tree"
import BookmarkIcon from "../assets/customIcons/bookmark.svg"
import ShipIcon from "../assets/customIcons/ship.svg"
import BallIcon from "../assets/customIcons/ball.svg"
import FireIcon from "../assets/customIcons/fire.svg"
import CameraIcon from "../assets/customIcons/camera.svg"
import WinIcon from "../assets/customIcons/win.svg"
import PresentIcon from "../assets/customIcons/present.svg"
import PoolIcon from "../assets/customIcons/pool.svg"
import BookIcon from "../assets/customIcons/book.svg"
import WalletIcon from "../assets/customIcons/wallet.svg"
import { CustomRange } from "../global"
import { DateTime } from "luxon"
import { IRootStore } from "./RootStore"
import { IHabitRecord } from "./HabitRecord"

export const HabitColors = [
  "blue",
  "yellow",
  "green",
  "red",
  "lightblue",
  "purple",
]
export type HabitColor =
  | "blue"
  | "yellow"
  | "green"
  | "red"
  | "lightblue"
  | "purple"
export const HabitColorMap: Record<HabitColor, string> = {
  blue: "#1C3BF1",
  yellow: "#FFAC0B",
  green: "#29E072",
  red: "#FB2B2B",
  lightblue: "#2F80ED",
  purple: "#9B51E0",
}

export const HabitIcons: HabitIcon[] = [
  "bookmark",
  "ship",
  "ball",
  "fire",
  "camera",
  "win",
  "present",
  "pool",
  "book",
  "wallet",
]
export type HabitIcon =
  | "bookmark"
  | "ship"
  | "ball"
  | "fire"
  | "camera"
  | "win"
  | "present"
  | "pool"
  | "book"
  | "wallet"
export const HabitIconMap: Record<HabitIcon, any> = {
  bookmark: BookmarkIcon,
  ship: ShipIcon,
  ball: BallIcon,
  fire: FireIcon,
  camera: CameraIcon,
  win: WinIcon,
  present: PresentIcon,
  pool: PoolIcon,
  book: BookIcon,
  wallet: WalletIcon,
}

export const HabitTypes: HabitType[] = ["daily", "weekly", "monthly", "custom"]
export type HabitType = "daily" | "weekly" | "monthly" | "custom"

const Habit = types
  .model("Habit", {
    id: types.identifier,
    name: types.string,
    recordsPerDay: types.number,
    color: types.enumeration("HabitColor", HabitColors),
    icon: types.enumeration("HabitIcon", HabitIcons),
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
      return this.records.filter(r => r.date === date).length > 0
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

    actions.setColor = (val: HabitColor) => {
      self.color = val
    }
    actionsMap.setColor = ["color"]

    actions.setIcon = (val: HabitIcon) => {
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
