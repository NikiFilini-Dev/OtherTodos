import { v4 as uuidv4 } from "uuid"
import { randomTagColor } from "./Tag"
import { DateTime } from "luxon"
import { IRootStore } from "./RootStore"
import moment from "moment"

type Migration = {
  id: number
  desc: string
  up: (store: IRootStore) => IRootStore
}

const migrations: Migration[] = [
  {
    id: 3,
    desc: "Add indexes to projects",
    up(Store) {
      Store.projects.forEach(
        (project, i) => (project.index = project.index ? project.index : i),
      )
      return Store
    },
  },
  {
    id: 4,
    desc: "Add indexes to tags",
    up(Store) {
      Store.tags.forEach((tag, i) => (tag.index = tag.index ? tag.index : i))
      return Store
    },
  },
  {
    id: 5,
    desc: "Add categories to projects",
    up(Store) {
      Store.projects.forEach(
        project =>
          (project.categories = project.categories ? project.categories : []),
      )
      return Store
    },
  },
  {
    id: 7,
    desc: "Replace ids with uuids",
    up(Store) {
      // tasks: all, selectedTask
      const refs = { projects: {}, tags: {}, tasks: {} }
      Store.projects.forEach(project => {
        const newId = uuidv4()
        refs.projects[project.id] = newId
        project.id = newId
      })
      Store.tags.forEach(tag => {
        const newId = uuidv4()
        refs.tags[tag.id] = newId
        tag.id = newId
      })
      Store.tasks.all.forEach(task => {
        const newId = uuidv4()
        refs.tasks[task.id] = newId
        task.id = newId
        task.project = refs.projects[task.project]
        task.tags = task.tags.map(tag => refs.tags[tag])
      })
      if (Store.tasks.selected)
        Store.tasks.selected = refs.tasks[Store.tasks.selected]
      if (Store.selectedProject)
        Store.selectedProject = refs.projects[Store.selectedProject]
      if (Store.selectedTag) Store.selectedTag = refs.tags[Store.selectedTag]
      if (Store.tempTask) Store.tempTask = null
      return Store
    },
  },
  {
    id: 9,
    desc: "Set tag colors",
    up(Store) {
      Store.tags.forEach(
        tag => (tag.color = tag.color ? tag.color : randomTagColor()),
      )
      return Store
    },
  },
  {
    id: 10,
    desc: "Move from end to duration",
    up(Store) {
      // Store.events.forEach(event => {
      //   event.duration = DateTime.fromFormat(event.end, "HH:mm")
      //     .diff(DateTime.fromFormat(event.start, "HH:mm"), "minutes")
      //     .toObject().minutes
      // })
      return Store
    },
  },
  {
    id: 25,
    desc: "Remove events from temp tasks",
    up(Store) {
      ;[...Store.events].forEach(event => {
        const task = Store.tasks.all.find(t => t.id === event.task)
        if (!task && event.task) {
          Store.events.splice(Store.events.indexOf(event), 1)
        }
      })
      Store.tasks.all.forEach(task => {
        const event = Store.events.find(e => e.id === task.event)
        if (!event && task.event) {
          task.event = null
        }
      })
      return Store
    },
  },
  {
    id: 29,
    desc: "Add creation date",
    up(Store) {
      if (Store.tempTask?.id) {
        Store.tempTask.creationDate = DateTime.now().toFormat("D")
      }
      Store.tasks.all.forEach(task => {
        let time = task.creationDate
        if (!time) time = task.date
        if (!time) time = task.closeDate
        if (!time) time = DateTime.now().toFormat("D")
        task.creationDate = time
      })
      return Store
    },
  },
  {
    id: 30,
    desc: "Move project categories to new root",
    up(Store) {
      Store.projects.forEach(project => {
        project.categories = project.categories.map(category => {
          Store.categories.push(category)
          return category.id
        })
      })
      return Store
    },
  },
  {
    id: 31,
    desc: "Remove selected items from saved data",
    up(Store) {
      Store.selectedProject = null
      Store.selectedTag = null
      Store.tasks.selected = null
      return Store
    },
  },
  {
    id: 32,
    desc: "Round event durations",
    up(Store) {
      Store.events.forEach(event => {
        if (event.duration) {
          event.duration = Math.floor(event.duration)
        } else {
          event.duration = 0
        }
      })
      return Store
    },
  },
  {
    id: 33,
    desc: "Remove links to projects from tags",
    up(Store) {
      Store.tags.forEach(tag => {
        if (tag.project) tag.project = null
      })
      return Store
    },
  },
  {
    id: 34,
    desc: "Remove screen from saved data",
    up(Store) {
      delete Store.screen
      return Store
    },
  },
  {
    id: 35,
    desc: "Change dates format",
    up(Store) {
      Store.events.forEach(event => {
        event.date = momentToLuxon(event.date)
      })
      Store.tasks.all.forEach(task => {
        task.creationDate = momentToLuxon(task.creationDate)
        if (task.date) task.date = momentToLuxon(task.date)
        if (task.closeDate) task.closeDate = momentToLuxon(task.closeDate)
      })
      if (Store.selectedDate)
        Store.selectedDate = momentToLuxon(Store.selectedDate)
      if (Store.timelineDate)
        Store.timelineDate = momentToLuxon(Store.timelineDate)
      return Store
    },
  },
]

function momentToLuxon(date) {
  const val = DateTime.fromJSDate(moment(date).toDate()).toFormat("D")
  console.log(date, val)
  return val
}

export default migrations
