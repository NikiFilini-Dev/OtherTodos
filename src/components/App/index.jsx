import React from "react"
import styles from "./styles.styl"

import { observer } from "mobx-react"
import { useMst } from "models/RootStore"

import Today from "components/Screens/Today"
import Project from "components/Screens/Project"
import Inbox from "components/Screens/Inbox"
import Log from "components/Screens/Log"
import TaskTags from "components/Screens/TaskTags"
import Auth from "components/Screens/Auth"
import Sidebar from "components/Sidebar"
import { DragDropContext } from "react-beautiful-dnd"
import Timeline from "../Timeline"

const App = observer(() => {
  const {
    user,
    screen,
    setScreen,
    sidebarWidth,
    setSidebarWidth,
    timelineWidth,
    setTimelineWidth,
  } = useMst()
  let Screen = Today
  switch (screen) {
    case "INBOX":
      Screen = Inbox
      break
    case "TODAY":
      Screen = Today
      break
    case "PROJECT":
      Screen = Project
      break
    case "LOG":
      Screen = Log
      break
    case "TAGS":
      Screen = TaskTags
      break
    case "AUTH":
      Screen = Auth
      break
  }

  if (screen !== "AUTH" && !user?.id) {
    Screen = Auth
    setScreen("AUTH")
  }

  React.useEffect(
    () =>
      (window.onDragEndFunc = window.onDragEndFunc
        ? window.onDragEndFunc
        : () => {}),
    [],
  )

  const onDragStart = (getInitialData, processMove, prevent = () => false) => {
    return e => {
      if (prevent(e)) return
      e.preventDefault()
      const startX = e.pageX
      const initialData = getInitialData()
      const onMove = moveE => {
        processMove(moveE, initialData, startX)
      }
      document.addEventListener("mousemove", onMove)
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", onMove)
      })
    }
  }

  const sidebarRef = React.useRef(null)
  const onResizeSidebarStart = onDragStart(
    () => ({}),
    e => {
      const width = e.pageX - 32
      setSidebarWidth(width > 250 ? width : 250)
    },
  )

  const timelineRef = React.useRef(null)
  const onResizeTimelineStart = onDragStart(
    () => ({}),
    e => {
      const box = timelineRef.current.getBoundingClientRect()
      const width = box.right - e.pageX - 18
      console.log(width)
      setTimelineWidth(width > 350 ? width : 350)
    },
  )

  return (
    <div
      className={styles.app}
      style={{
        "--sidebar-width": `${sidebarWidth}px`,
        "--timeline-width": `${timelineWidth}px`,
      }}
    >
      <div className={styles.sideBar} ref={sidebarRef}>
        <Sidebar />
      </div>
      <div
        className={styles.resizeHandle}
        draggable={true}
        onDragStart={e => onResizeSidebarStart(e)}
      />
      <div className={styles.main}>
        <DragDropContext onDragEnd={(...args) => window.onDragEndFunc(...args)}>
          <Screen />
        </DragDropContext>
      </div>
      <div
        className={styles.resizeHandle}
        draggable={true}
        onDragStart={e => onResizeTimelineStart(e)}
      />
      <div className={styles.timeline} ref={timelineRef}>
        <Timeline />
      </div>
    </div>
  )
})

export default <App />
