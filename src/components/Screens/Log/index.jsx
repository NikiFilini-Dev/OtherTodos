import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"

import TaskList from "components/TaskList"
import { DateTime } from "luxon"
import TagsFilter from "../../TagsFilter"
import EndlessScroll from "react-endless-scroll"

const Log = observer(() => {
  window.luxon = DateTime
  const {
    tasks: { all },
  } = useMst()
  const [selectedTag, setSelectedTag] = React.useState(null)
  const [shownDays, setShownDays] = React.useState(10)

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
      <div className={styles.head}>
        <div className={styles.info}>
          <span className={styles.title}>Закрытые задачи</span>
        </div>
        <TagsFilter tags={tags} select={onTagSelect} selected={selectedTag} />
      </div>
      <div className={styles.listOfLists}>
        <EndlessScroll
          onReachBottom={() => setShownDays(shownDays+10)}
          isLoading={false}
          hasMore={reversedDays.length > shownDays}
        >
          {reversedDays.slice(0, shownDays).map(day => (
            <TaskList
              showHidden
              key={`day_${day}`}
              tasks={days[day]}
              name={DateTime.fromFormat(day, "M/d/yyyy").toFormat("dd.MM.yyyy")}
            />
          ))}
        </EndlessScroll>
      </div>
    </div>
  )
})

export default Log
