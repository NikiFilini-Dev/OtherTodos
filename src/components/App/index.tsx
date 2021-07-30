import React, { CSSProperties } from "react"
import styles from "./styles.styl"

import { observer } from "mobx-react"
import { useMst } from "models/RootStore"

import Collection from "components/Screens/Collection"
import Today from "components/Screens/Today"
import Project from "components/Screens/Project"
import Inbox from "components/Screens/Inbox"
import Log from "components/Screens/Log"
import TaskTags from "components/Screens/TaskTags"
import Auth from "components/Screens/Auth"
import Sidebar from "components/Sidebar"
import { DragDropContext } from "react-beautiful-dnd"
import Timeline from "../Timeline"
import noop from "lodash-es/noop"
import Timer from "../Timer"
import classNames from "classnames"
import CardForm from "../CardForm"
import UploadView from "../Screens/Collection/components/UploadView"
import Top from "../Top"
import CollectionPersonal from "../Screens/CollectionPersonal"

const App = observer(() => {
  const {
    user,
    screen,
    setScreen,
    sidebarWidth,
    setSidebarWidth,
    timelineWidth,
    setTimelineWidth,
    collectionsStore: { editingCard },
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
    case "COLLECTION":
      Screen = Collection
      break
    case "COLLECTION_PERSONAL":
      Screen = CollectionPersonal
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
        : noop),
    [],
  )

  const onDragStart = (
    getInitialData,
    processMove,
    prevent: (e?: any) => boolean = () => false,
  ) => {
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

  const sidebarRef = React.useRef<HTMLDivElement | null>(null)
  const onResizeSidebarStart = onDragStart(
    () => ({}),
    e => {
      if (!sidebarRef.current) return
      const box = sidebarRef.current.getBoundingClientRect()
      const width = e.pageX - 32 - box.left
      setSidebarWidth(width > 250 ? width : 250)
    },
  )

  const timelineRef = React.useRef<HTMLDivElement | null>(null)
  const onResizeTimelineStart = onDragStart(
    () => ({}),
    e => {
      if (!timelineRef.current) return
      const box = timelineRef.current.getBoundingClientRect()
      const width =
        window.innerWidth - e.pageX - (window.innerWidth - box.right) - 18
      // console.log(width, window.innerWidth, e.pageX, (window.innerWidth - box.right))
      setTimelineWidth(width > 350 ? width : 350)
    },
  )

  const topRef = React.useRef<HTMLDivElement | null>(null)
  const [topSize, setTopSize] = React.useState(0)
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        console.log("Resize", entry.contentRect.height, entries)
        setTopSize(entry.contentRect.height)
      }
    })
    if (topRef.current) {
      console.log("Subscribe")
      resizeObserver.observe(topRef.current)
    }
    return () => {
      if (!topRef.current) return
      resizeObserver.unobserve(topRef.current)
    }
  }, [topRef.current])

  const noSidebar = ["COLLECTION", "COLLECTION_PERSONAL"].includes(screen)

  return (
    <div
      className={styles.globalWrapper}
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
          "--timeline-width": `${timelineWidth}px`,
          "--topHeight": `${topSize}px`,
          "--bottomHeight": "calc(100% - var(--topHeight, 0px))",
        } as CSSProperties
      }
    >
      <div className={styles.topBar}>
        <Top />
      </div>
      <div className={styles.app}>
        <div className={styles.sideBar} ref={sidebarRef}>
          <Sidebar />
        </div>
        <div
          className={styles.resizeHandle}
          draggable={true}
          onDragStart={e => onResizeSidebarStart(e)}
        />
        <div className={styles.verticalWrapper}>
          <div ref={topRef}>
            <Timer />
          </div>
          <div
            className={classNames({
              [styles.mainAndTimeline]: true,
              [styles.noSidebar]: noSidebar,
            })}
          >
            <div
              className={classNames({
                [styles.main]: true,
                [styles.noSidebar]: noSidebar,
              })}
            >
              <DragDropContext
                onDragEnd={(...args) => window.onDragEndFunc(...args)}
              >
                <Screen />
                {editingCard !== null && <CardForm cardId={editingCard.id} />}
                <UploadView />
              </DragDropContext>
            </div>
            {!noSidebar && (
              <div
                className={styles.resizeHandle}
                draggable={true}
                onDragStart={e => onResizeTimelineStart(e)}
              />
            )}
            {!noSidebar && (
              <div className={styles.timeline} ref={timelineRef}>
                <Timeline />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default <App />
