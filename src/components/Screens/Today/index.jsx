import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import moment from "moment"
import classNames from "classnames"

import TaskList from "components/TaskList"
import ExpiredTasks from "components/ExpiredTasks"

function toTitleCase(str) {
  return str
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ")
}

const Today = observer(() => {
  const {
    tasks: { today, expired },
  } = useMst()

  const [selectedTag, setSelectedTag] = React.useState(null)

  let tags = new Set()
  today.forEach((task) => {
    if (task.tags.length) task.tags.forEach((tag) => tags.add(tag))
  })
  tags = [...tags]
  const withoutTags = today.filter((task) => task.tags.length === 0)

  return (
    <div>
      <div className={styles.info}>
        <span className={styles.title}>Сегодня</span>
        <span className={styles.additional}>
          {toTitleCase(moment().format("dd DD MMM"))}
        </span>
      </div>
      <div className={styles.tags}>
        <span
          className={classNames({
            [styles.tag]: true,
            [styles.selected]: selectedTag === null,
          })}
          onClick={() => setSelectedTag(null)}
        >
          Все
        </span>
        {tags.map((tag) => (
          <span
            className={classNames({
              [styles.tag]: true,
              [styles.selected]: selectedTag === tag,
            })}
            key={`tag_${tag.name}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag.name}
          </span>
        ))}
      </div>
      {selectedTag === null && (
        <div>
          {!!expired.length && <ExpiredTasks tasks={expired} />}
          <TaskList tasks={withoutTags} name={"Сегодня"} />
          {tags.map((tag) => (
            <TaskList
              key={`task_list_${tag.name}`}
              tasks={today.filter((task) => task.tags.indexOf(tag) >= 0)}
              name={tag.name}
            />
          ))}
        </div>
      )}
      {selectedTag && (
        <div>
          <TaskList
            key={`task_list_${selectedTag.name}`}
            tasks={today.filter((task) => task.tags.indexOf(selectedTag) >= 0)}
            name={selectedTag.name}
          />
        </div>
      )}
    </div>
  )
})

export default Today
