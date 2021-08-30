import { types } from "mobx-state-tree"
import { LateTask } from "./Task"
import Tag, { randomTagColor } from "./Tag"
import { DateTime, Duration } from "luxon"

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
      return DateTime.fromFormat(self.start, "H:m")
        .plus({ minutes: self.duration })
        .toFormat("HH:mm")
    },
    get syncName() {
      return "TimelineEvent"
    },
    get syncable() {
      return true
    },
    get formattedDuration() {
      let format = "hh:mm"
      if (self.duration < 60) format = "mм"
      else if (self.duration % 60 === 0) format = "hч"
      else format = "hч mм"
      return Duration.fromObject({ minutes: self.duration })
        .normalize()
        .toFormat(format)
    },
  }))
  .actions(self => {
    const actions = {}
    const actionsMap = {}
    actions.setDuration = val => {
      if (val < 30) return
      const startDay = DateTime.fromFormat(self.start, "H:m").toFormat("dd.MM")
      const potentialEndMoment = DateTime.fromFormat(self.start, "H:m").plus({
        minutes: val,
      })
      if (
        potentialEndMoment.toFormat("dd.MM") !== startDay &&
        potentialEndMoment.toFormat("HH:mm") !== "00:00"
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
      const newStartMoment = DateTime.fromFormat(startS, "H:m")
      const potentialEndMoment = DateTime.fromFormat(startS, "H:m").plus({
        minutes: self.duration,
      })
      if (
        potentialEndMoment.toFormat("dd.MM") !==
        newStartMoment.toFormat("dd.MM")
      ) {
        startS = DateTime.fromFormat("00:00", "HH:mm")
          .minus({ minutes: self.duration })
          .toFormat("HH:mm")
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
        const startMoment = DateTime.fromFormat(self.start, "H:m")
        let newEndMoment = startMoment.endOf("day")
        const diff = newEndMoment.diff(startMoment, "minutes")
        return this.setDuration(diff.values.minutes + 1)
      }
      actions.setEnd(`${hours}:${minutes}`)
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
      self.duration = DateTime.fromFormat(val, "H:m").diff(
        DateTime.fromFormat(self.start, "H:m"),
        "minutes",
      ).values.minutes
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
