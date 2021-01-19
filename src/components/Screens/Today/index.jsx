import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import moment from "moment"
import classNames from "classnames"

import TaskList from "components/TaskList"
import ExpiredTasks from "components/ExpiredTasks"
import Button from "components/Button"
import DateSelector from "components/DateSelector"

import CalendarIcon from "assets/calendar_empty.svg"
import ListIcon from "assets/list.svg"
import PlusIcon from "assets/plus.svg"
import Task from "components/Task"
import TagsFilter from "components/TagsFilter"
import { useTrap } from "tools/hooks"

function toTitleCase(str) {
  return str
    .split(" ")
    .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ")
}

const Today = observer(() => {
  const {
    tasks: { all, expired },
    selectedDate,
    selectDate,
    createTask,
    setTempTask,
    insertTempTask,
    setScreen,
  } = useMst()

  const [viewMode, setViewMode] = React.useState("projects")
  const today = moment().format("YYYY-MM-DD")
  let tasks = all.filter(
    task => task.date && task.date === selectedDate && !task.done,
  )

  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  const [isDateSelectorShown, setIsDateSelectorShown] = React.useState(false)

  const ref = React.useRef(null)

  useTrap("command+n", () => {
    setIsNewTaskShown(!isNewTaskShown)
  })

  const [selectedTag, setSelectedTag] = React.useState(null)

  let tags = new Set()
  tasks.forEach(task => {
    if (task.tags.length) task.tags.forEach(tag => tags.add(tag))
  })
  tags = [...tags]

  if (selectedTag)
    tasks = tasks.filter(task => task.tags.indexOf(selectedTag) >= 0)

  let projects = new Set()
  tasks.forEach(task => {
    if (task.project) projects.add(task.project)
  })
  projects = [...projects]
  projects.sort((a, b) => a.index - b.index)

  const withoutProject = tasks.filter(task => !task.project)

  let expiredTasks = selectedDate === today ? expired() : []
  expiredTasks = expiredTasks.filter(
    task => !task.done && (!selectedTag || task.tags.indexOf(selectedTag) >= 0),
  )

  const initialTaskData = { date: selectedDate }
  if (selectedTag) initialTaskData.tags = [selectedTag]
  const [task, setTask] = React.useState(createTask(initialTaskData))
  setTempTask(task)

  const setDate = date => {
    if (date === null) return setScreen("INBOX")
    selectDate(date)
    setIsDateSelectorShown(false)
    task.setDate(date)
  }

  const onReject = () => {
    setTask(createTask({}))
    setIsNewTaskShown(false)
  }

  const onConfirm = () => {
    if (!task.text) return
    insertTempTask()
    let next = createTask(initialTaskData)
    setTempTask(next)
    setTask(next)
    setIsNewTaskShown(false)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        <span className={styles.title}>
          {selectedDate === today
            ? "Сегодня"
            : toTitleCase(moment(selectedDate).format("dd DD MMM"))}
        </span>
        {selectedDate === today && (
          <span className={styles.additional}>
            {toTitleCase(moment().format("dd DD MMM"))}
          </span>
        )}
        <div className={styles.actions}>
          <span
            className={classNames({
              [styles.viewSwitch]: true,
              [styles.active]: viewMode === "list",
            })}
          >
            <ListIcon
              onClick={() =>
                setViewMode(viewMode === "list" ? "projects" : "list")
              }
            />
          </span>
          <span className={styles.calendar} ref={ref}>
            <CalendarIcon
              onClick={() => setIsDateSelectorShown(!isDateSelectorShown)}
            />
            {isDateSelectorShown && (
              <DateSelector
                right
                triggerRef={ref}
                onSelect={day => setDate(day.date)}
                value={selectedDate}
              />
            )}
          </span>
          <Button
            icon={PlusIcon}
            activated={isNewTaskShown}
            onClick={() => setIsNewTaskShown(!isNewTaskShown)}
          />
        </div>
      </div>
      {isNewTaskShown && (
        <div>
          <Task task={task} active onConfirm={onConfirm} />
          <div className={styles.newTaskActions}>
            <Button text={"Добавить"} onClick={onConfirm} />
            <Button text={"Отменить"} secondary onClick={onReject} />
          </div>
        </div>
      )}
      <TagsFilter
        tags={tags}
        selected={selectedTag}
        select={tag => {
          if (isNewTaskShown && tag) task.addTag(tag)
          setSelectedTag(tag)
        }}
      />
      <div className={styles.listOfLists}>
        {!!expiredTasks.length && <ExpiredTasks tasks={expiredTasks} />}

        {viewMode === "list" ? (
          <TaskList
            tasks={tasks.filter(task => !expiredTasks.includes(task))}
            name={"Все задачи"}
          />
        ) : (
          <React.Fragment>
            <TaskList tasks={withoutProject} name={"Входящие"} />
            {projects.map(project => (
              <TaskList
                key={`task_list_${project.name}`}
                tasks={tasks.filter(task => task.project === project)}
                name={project.name}
              />
            ))}
          </React.Fragment>
        )}
        {}
      </div>
    </div>
  )
})

export default Today
