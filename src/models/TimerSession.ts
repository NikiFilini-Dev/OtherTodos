import { Instance, types } from "mobx-state-tree"
import Task from "./Task"

const TimerSession = types
  .model("TimerSession", {
    id: types.identifier,
    date: types.string,
    start: types.string,
    duration: types.optional(types.number, 0),
    task: types.reference(Task),
  })
  .views(() => ({
    get syncable() {
      return true
    },
    get syncName() {
      return "TimerSession"
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setDate = (val: string) => (self.date = val)
    actionsMap.setDate = ["date"]

    actions.setStart = (val: string) => (self.start = val)
    actionsMap.setStart = ["start"]

    actions.setDuration = (val: number) => (self.duration = Math.round(val))
    actionsMap.setDuration = ["duration"]

    actions.addDuration = (val: number) => (self.duration += Math.round(val))
    actionsMap.addDuration = ["duration"]

    actions.setTask = val => (self.task = val)
    actionsMap.setName = ["task"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default TimerSession
export type ITimerSession = Instance<typeof TimerSession>
