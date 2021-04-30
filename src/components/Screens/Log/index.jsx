import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"
import { DateTime } from "luxon"
import TagsFilter from "../../TagsFilter"

const Log = observer(() => {
  window.luxon = DateTime
  const {
    tasks: { all },
  } = useMst()
  const [selectedTag, setSelectedTag] = React.useState(null)

  const days = []
  let tags = new Set()
  all.forEach(task => {
    if (!task.done) return
    task.tags.forEach(tag => tags.add(tag))

    if (selectedTag && !task.tags.includes(selectedTag)) return

    const key = task.closeDate

    if (days[key]) days[key].push(task)
    else days[key] = [task]
  })
  tags = [...tags]

  let reversedDays = Object.keys(days).reverse()
  reversedDays.sort(
    (a, b) =>
      DateTime.fromFormat(b, "M/d/yyyy") - DateTime.fromFormat(a, "M/d/yyyy"),
  )

  const onTagSelect = tag => {
    setSelectedTag(tag)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        <span className={styles.title}>Закрытые задачи</span>
      </div>
      <TagsFilter tags={tags} select={onTagSelect} selected={selectedTag} />
      <div className={styles.listOfLists}>
        {reversedDays.map(day => (
          <TaskList
            showHidden
            key={`day_${day}`}
            tasks={days[day]}
            name={DateTime.fromFormat(day, "M/d/yyyy").toFormat("dd.MM.yyyy")}
          />
        ))}
      </div>
    </div>
  )
})

export default Log
