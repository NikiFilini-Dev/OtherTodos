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
]

export default migrations
