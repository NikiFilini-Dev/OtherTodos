import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import classNames from "classnames"

import TaskList from "components/TaskList"
import ExpiredTasks from "components/ExpiredTasks"
import Button from "components/Button"
import DateSelector from "components/DateSelector"

import CalendarIcon from "assets/calendar_empty.svg"
import ListIcon from "assets/list.svg"
import PlusIcon from "assets/line_awesome/plus-solid.svg"
import Task from "components/Task"
import TagsFilter from "components/TagsFilter"
import { useDateFormat, useTrap } from "tools/hooks"

import ScrollContext from "../../../contexts/scrollContext"
import Emitter from "events"
import { DateTime } from "luxon"
import Habits from "../../Habits"

function toTitleCase(str) {
  if (!str) return ""
  return str
    .split(" ")
    .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ")
}

const Today = observer(() => {
  const {
    tasks: { all },
    selectedDate,
    selectDate,
    setTempTask,
    insertTempTask,
    setScreen,
    tempTask,
  } = useMst()

  const [viewMode, setViewMode] = React.useState("projects")
  const today = DateTime.now().toFormat("M/d/yyyy")
  let tasks = all.filter(task => {
    return (
      task.date &&
      DateTime.fromFormat(task.date, "M/d/yyyy").startOf("day").toMillis() ===
        DateTime.fromFormat(selectedDate, "M/d/yyyy")
          .startOf("day")
          .toMillis() &&
      !task.done
    )
  })

  const [isNewTaskShown, setIsNewTaskShown] = React.useState(false)
  const [isDateSelectorShown, setIsDateSelectorShown] = React.useState(false)

  const ref = React.useRef(null)

  useTrap("alt+n", () => {
    setIsNewTaskShown(!isNewTaskShown)
  })

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

  let expiredTasks =
    selectedDate === today
      ? all.filter(
          task =>
            task.date &&
            DateTime.fromFormat(task.date, "M/d/yyyy").startOf("day") <
              DateTime.now().startOf("day") &&
            !task.done &&
            (!selectedTag || task.tags.indexOf(selectedTag) >= 0),
        )
      : []

  const initialTaskData = { date: selectedDate }
  if (selectedTag) initialTaskData.tags = [selectedTag]
  React.useEffect(() => {
    if (!tempTask) setTempTask(initialTaskData)
  }, [tempTask])

  const setDate = date => {
    if (date === null) return setScreen("INBOX")
    selectDate(date)
    setIsDateSelectorShown(false)
    tempTask.setDate(date)
  }

  const onReject = () => {
    setTempTask(initialTaskData)
    setIsNewTaskShown(false)
  }

  const onConfirm = () => {
    if (!tempTask.text) return
    insertTempTask()
    setTempTask(initialTaskData)
    setIsNewTaskShown(false)
  }

  const scrollRef = React.useRef(null)
  const [scrollEmitter] = React.useState(new Emitter())

  React.useEffect(() => {
    let last_known_scroll_position
    let ticking
    const onScroll = e => {
      last_known_scroll_position = e.target.scrollTop

      if (!ticking) {
        window.requestAnimationFrame(function () {
          scrollEmitter.emit("scroll", last_known_scroll_position)
          ticking = false
        })

        ticking = true
      }
    }

    const current = scrollRef.current
    current?.addEventListener("scroll", onScroll)
    return () => current?.removeEventListener("scroll", onScroll)
  })

  const onPlusClick = () => {
    setIsNewTaskShown(!isNewTaskShown)
  }

  let onDragEnd = args => {
    console.log(args)
    if (!args) return
    let { destination, source, draggableId } = args
    if (!destination) return
    console.log(destination, source, draggableId)

    const id = draggableId.match(/.+?_(.+)/)[1]

    if (
      draggableId.startsWith("task") &&
      destination.droppableId.startsWith("project")
    ) {
      let match = destination.droppableId.match(/.+?_(.+)/)
      const targetProject = match ? match[1] : null

      let task = all.find(t => t.id === id)
      task.setProject(targetProject)
    }
  }
  React.useEffect(() => (window.onDragEndFunc = onDragEnd), [])
  window.onDragEndFunc = onDragEnd

  const date = toTitleCase(
    DateTime.fromFormat(selectedDate, "M/d/yyyy").toFormat("dd.MM"),
  )

  return (
    <div className={styles.screen}>
      <Habits date={selectedDate} />
      <div className={styles.head}>
        <div className={styles.info}>
          <span className={styles.title}>
            {selectedDate === today ? "Сегодня" : date}
          </span>
          {selectedDate === today && (
            <span className={styles.additional}>{date}</span>
          )}
          <div className={styles.actions}>
            <span
              onClick={() =>
                setViewMode(viewMode === "list" ? "projects" : "list")
              }
              className={classNames({
                [styles.viewSwitch]: true,
                [styles.active]: viewMode === "list",
              })}
            >
              <ListIcon />
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
              square
              activated={isNewTaskShown}
              onClick={() => onPlusClick()}
            />
          </div>
        </div>
        <TagsFilter
          tags={tags}
          selected={selectedTag}
          select={tag => {
            if (!isNewTaskShown) {
              tempTask.removeTag(selectedTag)
              if (tag) tempTask.addTag(tag)
            }
            setSelectedTag(tag)
          }}
        />
      </div>
      <ScrollContext.Provider value={scrollEmitter}>
        <div className={styles.listOfLists} ref={scrollRef}>
          {isNewTaskShown && tempTask !== null && (
            <div style={{ marginBottom: "24px" }}>
              <Task
                task={tempTask}
                active
                onConfirm={onConfirm}
                newPrompt
                onReject={onReject}
              />
            </div>
          )}

          {!!expiredTasks.length && <ExpiredTasks tasks={expiredTasks} />}

          {viewMode === "list" ? (
            <TaskList
              tasks={tasks.filter(task => !expiredTasks.includes(task))}
              name={"Все задачи"}
            />
          ) : (
            <React.Fragment>
              <TaskList
                tasks={withoutProject}
                name={"Входящие"}
                iconName={"msg_bubble"}
              />
              {projects.map(project => (
                <TaskList
                  iconName={project.icon}
                  setIcon={name => project.setIcon(name)}
                  dnd={"project_" + project.id}
                  key={`task_list_${project.name}`}
                  tasks={tasks.filter(task => task.project === project)}
                  name={project.name}
                />
              ))}
            </React.Fragment>
          )}
          {}
        </div>
      </ScrollContext.Provider>
    </div>
  )
})

export default Today
