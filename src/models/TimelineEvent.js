import { types } from "mobx-state-tree"
import { LateTask } from "./Task"
import Tag, { randomTagColor } from "./Tag"
import moment from "moment"

const TimelineEvent = types
  .model("TimelineEvent", {
    id: types.identifier,
    name: types.string,
    start: types.maybeNull(types.string),
    duration: types.maybeNull(types.number), // in minutes
    allDay: types.optional(types.boolean, false),
    date: types.string,
    color: types.optional(types.string, randomTagColor),
    task: types.maybeNull(types.reference(types.late(LateTask))),
    tag: types.maybeNull(types.reference(Tag)),
  })
  .views(self => ({
    get end() {
      return moment(self.start, "HH:mm")
        .add(self.duration, "minutes")
        .format("HH:mm")
    },
    get syncName() {
      return "TimelineEvent"
    },
    get syncable() {
      return true
    },
  }))
  .actions(self => {
    const actions = {}
    const actionsMap = {}
    actions.setDuration = val => {
      if (val < 30) return
      const startDay = moment(self.start, "HH:mm").format("DD.MM")
      const potentialEndMoment = moment(self.start, "HH:mm").add(val, "minutes")
      if (
        potentialEndMoment.format("DD.MM") !== startDay &&
        potentialEndMoment.format("HH:mm") !== "00:00"
      ) {
        return
      }
      self.duration = val
    }
    actionsMap.setDuration = ["duration"]

    actions.processSetStart = (hours, minutes) => {
      if (typeof hours === "string" && !minutes) {
        ;[hours, minutes] = hours.split(":").map(i => parseInt(i))
      }
      let startS = `${hours}:${minutes}`
      const newStartMoment = moment(startS, "HH:mm")
      const potentialEndMoment = moment(startS, "HH:mm").add(
        self.duration,
        "minutes",
      )
      if (
        potentialEndMoment.format("DD.MM") !== newStartMoment.format("DD.MM")
      ) {
        startS = moment("00:00", "HH:mm")
          .subtract(self.duration, "minutes")
          .format("HH:mm")
      }
      console.log("Final startS", startS)
      self.start = startS
    }
    actionsMap.processSetStart = ["start"]

    actions.processSetEnd = (hours, minutes) => {
      if (typeof hours === "string" && !minutes) {
        ;[hours, minutes] = hours.split(":").map(i => parseInt(i))
      }
      if (!hours && !minutes) {
        const startMoment = moment(self.start, "HH:mm")
        let newEndMoment = moment(startMoment).endOf("day")
        const diff = newEndMoment.diff(startMoment)
        return this.setDuration(moment.duration(diff).asMinutes() + 1)
      }
      this.setEnd(`${hours}:${minutes}`)
    }
    actionsMap.processSetEnd = []

    actions.removeTag = () => {
      self.tag = null
    }
    actionsMap.removeTag = ["tag"]

    actions.setTag = tag => {
      self.tag = tag
    }
    actionsMap.setTag = ["tag"]

    actions.setName = val => {
      self.name = val
    }
    actionsMap.setName = ["name"]

    actions.setStart = val => {
      self.start = val
    }
    actionsMap.setStart = ["start"]

    actions.setEnd = val => {
      self.duration = moment
        .duration(moment(val, "HH:mm").diff(moment(self.start, "HH:mm")))
        .asMinutes()
    }
    actionsMap.setEnd = ["duration"]

    actions.setAllDay = val => {
      self.allDay = val
      if (!val && (!self.start || !self.end)) {
        self.start = "00:00"
        self.duration = 60
      }
    }
    actionsMap.setAllDay = ["allDay", "start", "duration"]

    actions.setDate = val => {
      self.date = val
    }
    actionsMap.setDate = ["date"]

    actions.setColor = val => {
      self.color = val
    }
    actionsMap.setColor = ["color"]

    actions.getActionsMap = () => actionsMap

    return actions
  })

export default TimelineEvent

export const factory = (id, data = {}) => {
  if (data.task === "") data.task = null
  if (data.tag === "") data.tag = null
  return {
    id,
    ...data,
  }
}

export function LateTimelineEvent() {
  return TimelineEvent
}
