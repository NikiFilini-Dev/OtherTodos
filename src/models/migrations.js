import { v4 as uuidv4 } from "uuid"
import { randomTagColor } from "./Tag"
import moment from "moment"

const migrations = [
  {
    id: 3,
    desc: "Add indexes to projects",
    up(Store) {
      Store.projects.forEach(
        (project, i) => (project.index = project.index ? project.index : i),
      )
    },
  },
  {
    id: 4,
    desc: "Add indexes to tags",
    up(Store) {
      Store.tags.forEach((tag, i) => (tag.index = tag.index ? tag.index : i))
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
    },
  },
  {
    id: 7,
    desc: "Replace ids with uuids",
    up(Store) {
      // tasks: all, selectedTask
      const refs = { projects: {}, tags: {}, tasks: {} }
      Store.projects.forEach(project => {
        let newId = uuidv4()
        refs.projects[project.id] = newId
        project.id = newId
      })
      Store.tags.forEach(tag => {
        let newId = uuidv4()
        refs.tags[tag.id] = newId
        tag.id = newId
      })
      Store.tasks.all.forEach(task => {
        let newId = uuidv4()
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
    },
  },
  {
    id: 9,
    desc: "Set tag colors",
    up(Store) {
      Store.tags.forEach(
        tag => (tag.color = tag.color ? tag.color : randomTagColor()),
      )
    },
  },
  {
    id: 10,
    desc: "Move from end to duration",
    up(Store) {
      Store.events.forEach(event => {
        event.duration = moment
          .duration(
            moment(event.end, "HH:mm").diff(moment(event.start, "HH:mm")),
          )
          .asMinutes()
      })
    },
  },
]

export default migrations
