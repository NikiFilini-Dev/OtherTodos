import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"
import moment from "moment"
import TagsFilter from "../../TagsFilter"

const Log = observer(() => {
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

    if (days[task.closeDate]) days[task.closeDate].push(task)
    else days[task.closeDate] = [task]
  })
  tags = [...tags]

  let reversedDays = Object.keys(days).reverse()
  reversedDays.sort((a, b) => moment(b)._d - moment(a)._d)

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
            name={moment(day).format("DD MMM YYYY")}
          />
        ))}
      </div>
    </div>
  )
})

export default Log
