import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import moment from "moment"
import classNames from "classnames"

import TaskList from "components/TaskList"
import ExpiredTasks from "components/ExpiredTasks"
import Button from "components/Button"

import CalendarIcon from "assets/calendar_empty.svg"
import PlusIcon from "assets/plus.svg"
import Task from "../../Task"

function toTitleCase(str) {
  return str
    .split(" ")
    .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ")
}

const Today = observer(() => {
  const {
    tasks: { today, expired, add },
    createTask,
    setTempTask,
    detachTempTask,
  } = useMst()

  const [task, setTask] = React.useState(
    createTask({ date: moment().format("YYYY-MM-DD") }),
  )
  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  setTempTask(task)

  const onReject = () => {
    setTask(createTask(""))
    setIsNewTaskShown(false)
  }
  const onConfirm = () => {
    if (!task.text) return
    detachTempTask()
    add(task)
    setTask(createTask(""))
    setIsNewTaskShown(false)
  }

  const [selectedTag, setSelectedTag] = React.useState(null)

  let tags = new Set()
  today.forEach(task => {
    if (task.tags.length) task.tags.forEach(tag => tags.add(tag))
  })
  tags = [...tags]
  const withoutTags = today.filter(task => task.tags.length === 0)

  const expiredTasks = expired()
  console.log(expiredTasks, expired)

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        <span className={styles.title}>Сегодня</span>
        <span className={styles.additional}>
          {toTitleCase(moment().format("dd DD MMM"))}
        </span>
        <div className={styles.actions}>
          <span className={styles.calendar}>
            <CalendarIcon />
          </span>
          <Button icon={PlusIcon} activated={isNewTaskShown} />
        </div>
      </div>
      {isNewTaskShown && (
        <div>
          <Task task={task} active />
          <div className={styles.newTaskActions}>
            <Button text={"Добавить"} onClick={onConfirm} />
            <Button text={"Отменить"} secondary onClick={onReject} />
          </div>
        </div>
      )}
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
        {tags.map(tag => (
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
      <div className={styles.listOfLists}>
        {selectedTag === null && (
          <div>
            {!!expiredTasks.length && <ExpiredTasks tasks={expiredTasks} />}
            <TaskList tasks={withoutTags} name={"Сегодня"} />
            {tags.map(tag => (
              <TaskList
                key={`task_list_${tag.name}`}
                tasks={today.filter(task => task.tags.indexOf(tag) >= 0)}
                name={tag.name}
              />
            ))}
          </div>
        )}
        {selectedTag && (
          <div>
            <TaskList
              key={`task_list_${selectedTag.name}`}
              tasks={today.filter(task => task.tags.indexOf(selectedTag) >= 0)}
              name={selectedTag.name}
            />
          </div>
        )}
      </div>
    </div>
  )
})

export default Today
