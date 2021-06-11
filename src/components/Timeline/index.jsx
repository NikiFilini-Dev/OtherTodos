/* eslint-disable prettier/prettier */
import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import { DateTime } from "luxon"
import ChevronLeft from "assets/line_awesome/angle-left-solid.svg"
import ChevronRight from "assets/line_awesome/angle-right-solid.svg"
import Event from "./Event"
import { useMst } from "models/RootStore"
import { useScrollEmitter } from "../../tools/hooks"
import ScrollContext from "../../contexts/scrollContext"
import classNames from "classnames"
import DaySelector from "./DaySelector"
import Icon from "../Icon"

const ipc = require("electron").ipcRenderer

function parseTime(s) {
  let date = DateTime.fromFormat(s, "HH:mm")
  if (!date.isValid) date = DateTime.fromFormat(s, "H:mm")
  if (!date.isValid) date = DateTime.fromFormat(s, "H:m")
  return date
}

const Timeline = observer(() => {
  const { events, createEvent, timelineDate, setTimelineDate } = useMst()
  const todayEvents = events.filter(e => e.date === timelineDate)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [calendarShown, setCalendarShown] = React.useState(false)

  const arr = []
  for (let i = 0; i < 24; i++) {
    arr.push(i)
  }
  arr.push(0)

  const hourHeight = 37
  const fontSize = 13
  const minuteHeight = (fontSize + hourHeight) / 60

  const [nowOffset, setNowOffset] = React.useState(fontSize)
  const calcOffset = s => {
    if (!s) s = DateTime.now().toFormat("HH:mm")
    let offset = fontSize
    const hours = parseInt(s.split(":")[0])
    offset += hours * (fontSize + hourHeight)
    const minutes = parseInt(s.split(":")[1])
    offset += minutes * minuteHeight
    return offset
  }
  React.useEffect(() => {
    setNowOffset(calcOffset())
    ref.current.scrollTop =
      nowRef.current.offsetTop - ref.current.getBoundingClientRect().height / 2
    const timer = setInterval(() => setNowOffset(calcOffset()), 10000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  React.useEffect(() => {
    const onFocus = () => {
      ref.current.scrollTop =
        nowRef.current.offsetTop -
        ref.current.getBoundingClientRect().height / 2
    }
    onFocus()
    ipc.on("focus", onFocus)
    return () => {
      ipc.off("focus", onFocus)
    }
  }, [])

  let _isCreating = false

  const ref = React.useRef(null)
  const nowRef = React.useRef(null)
  const [eventRefs, setEventRefs] = React.useState({})

  const onPrevClick = () => {
    setTimelineDate(
      DateTime.fromFormat(timelineDate, "M/d/yyyy")
        .minus({ days: 1 })
        .toFormat("M/d/yyyy"),
    )
  }

  const onNextClick = () => {
    setTimelineDate(
      DateTime.fromFormat(timelineDate, "M/d/yyyy")
        .plus({ days: 1 })
        .toFormat("M/d/yyyy"),
    )
  }

  const onTimelineClick = e => {
    if (isDragging || isCreating || _isCreating) return

    setIsCreating(true)
    _isCreating = true

    setTimeout(() => {
      _isCreating = false
      setIsCreating(false)
    }, 300)

    const modalsEl = document.querySelector("#modals")
    if (e.target === modalsEl || modalsEl.contains(e.target)) return

    const floatsEl = document.querySelector("#floats")
    if (e.target === floatsEl || floatsEl.contains(e.target)) return

    for (const id of Object.keys(eventRefs)) {
      const el = eventRefs[id].current
      if (el && (el === e.target || el.contains(e.target))) return
    }
    const box = ref.current.getBoundingClientRect()
    const hoursTotal =
      (e.pageY - box.top - fontSize + ref.current.scrollTop) /
      (fontSize + hourHeight)
    const hours = Math.floor(hoursTotal < 0 ? 0 : hoursTotal)
    const minutes = Math.floor(hoursTotal < 0 ? 0 : 60 * (hoursTotal % 1))
    const start =
      `${hours}`.padStart(2, "0") +
      ":" +
      `${minutes - (minutes % 5)}`.padStart(2, "0")
    createEvent({
      start,
      duration: 60,
      date: timelineDate,
      name: "Новое событие",
    })
  }

  const newRefs = {}
  todayEvents.forEach(e => {
    if (!(e.id in eventRefs)) {
      newRefs[e.id] = React.createRef()
    }
  })
  if (Object.keys(newRefs).length) setEventRefs({ ...eventRefs, ...newRefs })

  const onDragStart = (getInitialData, processMove, prevent = () => false) => {
    return (event, e) => {
      if (prevent(event, e)) return
      e.preventDefault()
      setIsDragging(true)
      const startY = e.pageY
      const initialData = getInitialData(event)
      const box = ref.current.getBoundingClientRect()
      const onMove = moveE => {
        if (moveE.pageY <= box.top + fontSize) return
        const move = moveE.pageY - startY
        const minutes = Math.floor(move / minuteHeight)
        const add = minutes - (minutes % 5)
        processMove(event, add, initialData)
      }
      document.addEventListener("mousemove", onMove)
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", onMove)
        setTimeout(() => setIsDragging(false), 300)
      })
    }
  }

  const onStretchStart = onDragStart(
    event => event.duration,
    (event, add, initialTime) => {
      event.setDuration(initialTime + add)
    },
  )

  const onMoveStart = onDragStart(
    event => ({ initialStart: event.start, initialDuration: event.duration }),
    (event, add, { initialStart }) => {
      const start = DateTime.fromFormat("00:00", "H:mm")
      const end = parseTime(initialStart)
      console.log(start, end)
      const minimum = 0 - end.diff(start).shiftTo("minutes").values.minutes
      if (add < minimum) add = minimum
      let newStart = parseTime(initialStart)
        .plus({ minutes: add })
        .toFormat("HH:mm")
      event.processSetStart(newStart)
    },
    (event, e) => {
      return e.target.classList.contains(styles.eventStretch)
    },
  )

  const [initialScrolled, setInitialScrolled] = React.useState(false)

  React.useEffect(() => {
    if (initialScrolled) return
    ref.current.scrollTop =
      nowRef.current.offsetTop - ref.current.getBoundingClientRect().height / 2
    if (nowRef.current.offsetTop > 6) setInitialScrolled(true)
  }, [nowRef.current?.getBoundingClientRect().top])

  const scrollEmitter = useScrollEmitter(ref)

  return (
    <div className={styles.wrapper}>
      <div className={styles.block}>
        <div className={styles.currentDate}>
          <span className={styles.dayName}>
            {timelineDate === DateTime.now().toFormat("M/d/yyyy")
              ? "Сегодня"
              : ""}
          </span>

          <span className={styles.dayDetail}>
            {DateTime.fromFormat(timelineDate, "M/d/yyyy").toFormat("DD")}
          </span>
          <div className={styles.actions}>
            <span className={styles.action} onClick={onPrevClick}>
              <ChevronLeft />
            </span>
              <span className={styles.action} onClick={onNextClick}>
              <ChevronRight />
            </span>
            <div className={classNames({
              [styles.calendarTrigger]: true,
              [styles.active]: calendarShown
            })} onClick={() => setCalendarShown(!calendarShown)}>
              <Icon name={"calendar"} />
            </div>
          </div>
        </div>
        {calendarShown && <DaySelector />}
      </div>
      <div className={classNames(styles.block)} style={{ overflowY: "hidden" }}>
          {/*<div className={styles.tabs}>*/}
          {/*  <div className={classNames(styles.tab, styles.active)}>День</div>*/}
          {/*  <div className={styles.tab}>Неделя</div>*/}
          {/*</div>*/}
        <div className={styles.allDayList}>
          {Boolean(todayEvents.filter(t => t.allDay).length) && (
            <div className={styles.allDayName}>Весь день:</div>
          )}
          {todayEvents
            .filter(e => e.allDay)
            .map(event => {
              return (
                <div
                  key={`event_${event.id}`}
                  className={styles.allDayTask}
                  ref={eventRefs[event.id] || { current: null }}
                >
                  <Event event={event} boxRef={eventRefs[event.id]} />
                </div>
              )
            })}
        </div>
        <div className={styles.timelineWrapper}>
          <div
            className={styles.timeline}
            ref={ref}
            onDoubleClick={onTimelineClick}
          >
            <ScrollContext.Provider value={scrollEmitter}>
              {todayEvents
                .filter(t => !t.allDay)
                .map(event => (
                  <div
                    ref={eventRefs[event.id] || { current: null }}
                    key={`event_${event.id}`}
                    className={styles.eventContainer}
                    style={{
                      "--start": `${calcOffset(event.start)}px`,
                      "--end": `${
                        ((hourHeight + fontSize) / 60) * event.duration +
                        calcOffset(event.start)
                      }px`,
                    }}
                    draggable={true}
                    onDragStart={e => onMoveStart(event, e)}
                  >
                    <Event
                      event={event}
                      boxRef={eventRefs[event.id]}
                      isDragging={isDragging}
                    />
                    <div
                      className={styles.eventStretch}
                      draggable={true}
                      onDragStart={e => onStretchStart(event, e)}
                    />
                  </div>
                ))}
              <div
                className={styles.now}
                style={{ "--now-offset": `${nowOffset}px` }}
                ref={nowRef}
              >
                <span>{DateTime.now().toFormat("HH:mm")}</span>
                <div className={styles.line} />
              </div>
              {arr.map((i, index) => (
                <div
                  key={index}
                  className={styles.hour}
                  style={{
                    "--hour-height": `${hourHeight}px`,
                    "--font-size": `${fontSize}px`,
                  }}
                >
                  <span>{`${i}`.padStart(2, "0")}:00</span>
                  <div className={styles.dash} />
                </div>
              ))}
            </ScrollContext.Provider>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Timeline
