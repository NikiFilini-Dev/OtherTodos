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
import TagsSelector from "../../TagsSelector"
import { randomTagColor } from "../../../models/Tag"

const padTime = s => {
  if (!s) return "00:00"
  let [hours, minutes] = s.split(":")
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
}

const Event = observer(({ event, isDragging }) => {
  const { deleteEvent } = useMst()
  const [editActive, setEditActive] = React.useState(false)
  const [startActive, setStartActive] = React.useState(false)
  const [endActive, setEndActive] = React.useState(false)
  const [tagActive, setTagActive] = React.useState(false)
  const ref = React.useRef(null)
  const menuRef = React.useRef(null)
  const startRef = React.useRef(null)
  const endRef = React.useRef(null)
  const tagRef = React.useRef(null)
  const startMenuRef = React.useRef(null)
  const endMenuRef = React.useRef(null)
  const tagMenuRef = React.useRef(null)
  const onEventClick = e => {
    if (isDragging) return
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
    const notInTagMenuRef =
      !tagActive ||
      (tagMenuRef.current &&
        e.target !== tagMenuRef.current &&
        !tagMenuRef.current.contains(e.target))
    if (
      notInRef &&
      notInMenuRef &&
      notInStartMenuRef &&
      notInEndMenuRef &&
      notInTagMenuRef
    )
      setEditActive(false)
  })

  const onStartSet = (hours, minutes) => {
    event.processSetStart(hours, minutes)
    setStartActive(false)
  }

  const onEndSet = (hours, minutes) => {
    event.processSetEnd(hours, minutes)
    setEndActive(false)
  }

  if (!event.tag && !event.color) {
    event.setColor(randomTagColor())
  }

  const styleVars = {
    "--background": event.tag?.color || "#545454",
    "--light": "white",
    "--normal": "white",
  }

  return (
    <div className={classNames({
      [styles.eventAndMenuWrapper]: true,
      [styles.compact]: event.duration < 60
    })}>
      {tagActive && (
        <FloatMenu
          position={"horizontal_left"}
          target={tagRef}
          menuRef={tagMenuRef}
        >
          <TagsSelector
            single={true}
            selected={event.tag ? [event.tag] : []}
            select={tag => {
              event.setTag(tag)
              setTagActive(false)
            }}
            unselect={() => {
              event.removeTag()
              setTagActive(false)
            }}
            type={"EVENT"}
          />
        </FloatMenu>
      )}
      {startActive && (
        <FloatMenu
          position={"horizontal_left"}
          target={startRef}
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
          position={"horizontal_left"}
          target={endRef}
          menuRef={endMenuRef}
        >
          <TimeSelector
            onOutsideClick={() => setEndActive(false)}
            onSubmit={onEndSet}
            minimalTime={event.start}
            initialTime={event.end}
          />
        </FloatMenu>
      )}
      {editActive && (
        <FloatMenu position={"horizontal_left"} target={ref}>
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
            <div
              className={classNames({
                [styles.menuItem]: true,
                [styles.disabled]: false,
              })}
            >
              <span className={styles.menuItemName}>Тэг:</span>{" "}
              <span
                className={styles.menuItemValue}
                ref={tagRef}
                onClick={() => setTagActive(true)}
              >
                {event.tag ? event.tag.name : "Нет"}
              </span>
            </div>
          </div>
        </FloatMenu>
      )}
      <div
        className={event.allDay ? styles.allDayEvent : styles.event}
        ref={ref}
        onClick={onEventClick}
        style={styleVars}
      >
        <span className={styles.start}>{padTime(event.start)}</span>
        <span className={styles.name}>
          {event.name}{" "}
          {!event.allDay && event.duration > 50 && (
            <span className={styles.duration}>({event.formattedDuration})</span>)
          }
        </span>

      </div>
    </div>
  )
})

export default Event
