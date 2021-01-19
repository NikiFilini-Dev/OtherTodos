const migrations = [
  {
    id: 2,
    desc: "Add indexes to tags",
    up(Store) {
      console.log(Store)
      Store.tags.forEach((tag, i) => (tag.idex = i))
    },
  },
]

export default migrations
