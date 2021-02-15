import { types } from "mobx-state-tree"

const TimelineEvent = types
  .model("TimelineEvent", {
    id: types.identifier,
    name: types.string,
    start: types.maybeNull(types.string),
    end: types.maybeNull(types.string),
    allDay: types.optional(types.boolean, false),
    date: types.string,
    color: types.optional(types.string, "#FFE8EA"),
  })
  .actions(self => ({
    setName(val) {
      self.name = val
    },
    setStart(val) {
      self.start = val
    },
    setEnd(val) {
      self.end = val
    },
    setAllDay(val) {
      self.allDay = val
    },
    setDate(val) {
      self.date = val
    },
    setColor(val) {
      self.color = val
    },
  }))

export default TimelineEvent
