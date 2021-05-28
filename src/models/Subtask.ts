import { getRoot, Instance, types } from "mobx-state-tree"
import { DateTime } from "luxon"
import Task from "./Task"
import { IRootStore } from "./RootStore"

export const SubtaskStatuses: SubtaskStatus[] = ["ACTIVE", "DONE"]
export type SubtaskStatus = "ACTIVE" | "DONE"

const DateString = types.custom<string, string>({
  name: "DateString",
  fromSnapshot(value: string) {
    return value
  },
  toSnapshot(value: string) {
    return value
  },
  isTargetType(value: string): boolean {
    if (!value) return false
    return DateTime.fromFormat(value, "M/d/yyyy").isValid
  },
  getValidationMessage(value: string): string {
    if (value && DateTime.fromFormat(value, "M/d/yyyy").isValid) return "" // OK
    return `'${value}' doesn't look like a valid decimal number`
  },
})

const Subtask = types
  .model("Subtask", {
    id: types.identifier,
    text: types.string,
    status: types.enumeration("SubtaskStatus", SubtaskStatuses),
    closedAt: types.maybeNull(DateString),
    task: types.reference<typeof Task>(Task),
    index: types.number,
  })
  .views(self => ({
    get syncable() {
      return getRoot<IRootStore>(self).tempTask !== self.task
    },
    get syncName() {
      return "Subtask"
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, (keyof ISubtask)[]> = {}

    actions.setTask = val => self.task = val
    actionsMap.setTask = ["task"]

    actions.setTaskSilent = val => self.task = val
    actionsMap.setTaskSilent = []

    actions.setText = (val: string) => self.text = val
    actionsMap.setText = ["text"]

    actions.setStatus = (val: SubtaskStatus) => {
      self.status = val
      if (val === "DONE") self.closedAt = DateTime.now().toFormat("M/d/yyyy")
    }
    actionsMap.setStatus = ["status", "closedAt"]

    actions.setIndex = (val: number) => self.index = val
    actionsMap.setIndex = ["index"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default Subtask
export type ISubtask = Instance<typeof Subtask>
