import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import { useClick } from "tools/hooks"
import styles from "./styles.styl"
import FloatMenu from "components/FloatMenu"
import TimeSelector from "components/TimeSelector"
import TrashIcon from "assets/awesome/regular/trash-alt.svg"
import Checkbox from "components/Checkbox"
import classNames from "classnames"

const padTime = s => {
  let [hours, minutes] = s.split(":")
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
}

const Event = observer(({ event, boxRef }) => {
  const { deleteEvent } = useMst()
  const box =
    boxRef && boxRef.current ? boxRef.current.getBoundingClientRect() : {}
  const [editActive, setEditActive] = React.useState(false)
  const [startActive, setStartActive] = React.useState(false)
  const [endActive, setEndActive] = React.useState(false)
  const ref = React.useRef(null)
  const menuRef = React.useRef(null)
  const startRef = React.useRef(null)
  const endRef = React.useRef(null)
  const startMenuRef = React.useRef(null)
  const endMenuRef = React.useRef(null)
  const onEventClick = e => {
    e.preventDefault()
    setEditActive(true)
  }
  useClick(document, e => {
    if (!editActive) return
    const notInRef =
      !ref.current ||
      (e.target !== ref.current && !ref.current.contains(e.target))
    const notInMenuRef =
      !menuRef.current ||
      (e.target !== menuRef.current && !menuRef.current.contains(e.target))
    const notInStartMenuRef =
      !startActive ||
      (startMenuRef.current &&
        e.target !== startMenuRef.current &&
        !startMenuRef.current.contains(e.target))
    const notInEndMenuRef =
      !endActive ||
      (endMenuRef.current &&
        e.target !== endMenuRef.current &&
        !endMenuRef.current.contains(e.target))
    if (notInRef && notInMenuRef && notInStartMenuRef && notInEndMenuRef)
      setEditActive(false)
  })
  const position =
    box.y + box.height / 2 < window.innerHeight / 2 ? "lefttop" : "leftbottom"

  const onStartSet = (hours, minutes) => {
    let [endHours, endMinutes] = event.end.split(":")
    endHours = parseInt(endHours)
    endMinutes = parseInt(endMinutes)

    let [startHours, startMinutes] = event.start.split(":")
    startHours = parseInt(startHours)
    startMinutes = parseInt(startMinutes)

    endHours = endHours + (hours - startHours)
    endMinutes = endMinutes + (minutes - startMinutes)

    event.setStart(`${hours}:${minutes}`)
    event.setEnd(`${endHours}:${endMinutes}`)

    setStartActive(false)
  }

  const onEndSet = (hours, minutes) => {
    let [startHours, startMinutes] = event.start.split(":")
    startHours = parseInt(startHours)
    startMinutes = parseInt(startMinutes)

    let endHours = hours
    let endMinutes = minutes

    if (endHours < startHours) {
      endHours = startHours
      endMinutes = startMinutes
    }

    event.setEnd(`${endHours}:${endMinutes}`)

    setEndActive(false)
  }

  return (
    <div className={styles.eventAndMenuWrapper}>
      {startActive && (
        <FloatMenu
          position={position}
          targetBox={
            startRef.current ? startRef.current.getBoundingClientRect() : {}
          }
          menuRef={startMenuRef}
        >
          <TimeSelector
            onOutsideClick={() => setStartActive(false)}
            onSubmit={onStartSet}
            initialTime={event.start}
          />
        </FloatMenu>
      )}
      {endActive && (
        <FloatMenu
          position={position}
          targetBox={
            endRef.current ? endRef.current.getBoundingClientRect() : {}
          }
          menuRef={endMenuRef}
        >
          <TimeSelector
            onOutsideClick={() => setEndActive(false)}
            onSubmit={onEndSet}
            initialTime={event.end}
          />
        </FloatMenu>
      )}
      {editActive && (
        <FloatMenu position={position} targetBox={box}>
          <div className={styles.eventMenu} ref={menuRef}>
            <div className={styles.menuItem}>
              <input
                value={event.name}
                onChange={e => event.setName(e.target.value)}
              />
              <div
                className={styles.menuAction}
                onClick={() => deleteEvent(event)}
              >
                <TrashIcon />
              </div>
            </div>
            <div className={styles.menuItem}>
              <span className={styles.menuItemName}>Весь день:</span>
              <Checkbox checked={event.allDay} onChange={event.setAllDay} />
            </div>
            <div
              className={classNames({
                [styles.menuItem]: true,
                [styles.disabled]: event.allDay,
              })}
            >
              <span className={styles.menuItemName}>Начало:</span>{" "}
              <span
                className={styles.menuItemValue}
                ref={startRef}
                onClick={() => setStartActive(true)}
              >
                {padTime(event.start)}
              </span>
            </div>
            <div
              className={classNames({
                [styles.menuItem]: true,
                [styles.disabled]: event.allDay,
              })}
            >
              <span className={styles.menuItemName}>Конец:</span>{" "}
              <span
                className={styles.menuItemValue}
                ref={endRef}
                onClick={() => setEndActive(true)}
              >
                {padTime(event.end)}
              </span>
            </div>
          </div>
        </FloatMenu>
      )}
      <div
        className={event.allDay ? styles.allDayEvent : styles.event}
        ref={ref}
        onClick={onEventClick}
      >
        <span className={styles.start}>{padTime(event.start)}</span>
        <span className={styles.name}>{event.name}</span>
      </div>
    </div>
  )
})

export default Event
