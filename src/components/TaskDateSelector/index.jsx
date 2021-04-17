import React from "react"
import styles from "./styles.styl"
import classNames from "classnames"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"

import ArrowLeft from "assets/arrow_left.svg"
import ArrowRight from "assets/arrow_right.svg"
import { buildCalendar } from "tools/date"

import moment from "moment"
import Checkbox from "../Checkbox"
import FloatMenu from "../FloatMenu"
import TimeSelector from "../TimeSelector"
import TagsSelector from "../TagsSelector"

const padTime = s => {
  if (!s) return "00:00"
  let [hours, minutes] = s.split(":")
  return `${(hours || "").padStart(2, "0")}:${(minutes || "").padStart(2, "0")}`
}

const TaskDateSelector = observer(
  ({ task, startMenuRef, endMenuRef, tagMenuRef }) => {
    let value = task.date
    if (!value) {
      value = new Date()
    }

    if (typeof value === "string") value = moment(value)._d

    const {
      tasks: { all },
    } = useMst()

    const [date, setDate] = React.useState(value)

    const months = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ]
    const month = months[date.getMonth()]

    const weekDays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]

    const weeks = buildCalendar(date, value, all)

    const onPrevClick = () => {
      const cpy = new Date()
      cpy.setFullYear(date.getFullYear())
      cpy.setDate(1)
      cpy.setMonth(date.getMonth() - 1)

      setDate(cpy)
    }

    const onNextClick = () => {
      const cpy = new Date()
      cpy.setFullYear(date.getFullYear())
      cpy.setDate(1)
      cpy.setMonth(date.getMonth() + 1)
      setDate(cpy)
    }

    const selectDate = day => {
      let date = day.date
      if (moment.isDate(date)) date = moment(date).format()
      task.setDate(date)
    }

    const onIsEventChange = checked => {
      if (checked) {
        task.createAndConnectEvent()
      } else {
        task.unconnectEvent()
      }
    }

    const startRef = React.useRef(null)
    const endRef = React.useRef(null)
    const tagRef = React.useRef(null)

    const [startActive, setStartActive] = React.useState(false)
    const [endActive, setEndActive] = React.useState(false)
    const [tagActive, setTagActive] = React.useState(false)

    const onStartSet = (hours, minutes) => {
      task.event.processSetStart(hours, minutes)
      setTimeout(() => setStartActive(false), 10)
    }

    const onEndSet = (hours, minutes) => {
      task.event.processSetEnd(hours, minutes)
      setTimeout(() => setEndActive(false), 10)
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.column}>
          <div
            className={styles.fixedElement}
            onClick={() => selectDate({ date: new Date() })}
          >
            Сегодня
          </div>
          <div
            className={styles.fixedElement}
            onClick={() => selectDate({ date: null })}
          >
            Без срока
          </div>
          <div className={styles.info}>
            <span className={styles.monthText}>
              {month.slice(0, 3)}, {date.getFullYear()}
            </span>
            <div className={styles.actions}>
              <div className={styles.action} onClick={onPrevClick}>
                <ArrowLeft />
              </div>
              <div className={styles.action} onClick={onNextClick}>
                <ArrowRight />
              </div>
            </div>
          </div>
          <div className={styles.calendar}>
            <div className={styles.week}>
              {weekDays.map((name, i) => (
                <span
                  key={`weekday${i}`}
                  className={classNames({
                    [styles.day]: true,
                    [styles.dayname]: true,
                  })}
                >
                  {name}
                </span>
              ))}
            </div>
            {weeks.map((week, weekI) => (
              <div className={styles.week} key={`week${weekI}`}>
                {week.map((day, dayI) => (
                  <span
                    key={`week${weekI}_day${dayI}`}
                    className={classNames({
                      [styles.day]: true,
                      [styles.alien]: day.alien,
                      [styles.selected]: day.selected,
                    })}
                    onClick={() => selectDate(day)}
                  >
                    {day.number}
                    {day.today && <span className={styles.todayMark} />}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.eventCheckbox}>
            <span>Событие:</span>
            <Checkbox checked={!!task.event} onChange={onIsEventChange} />
          </div>
        </div>
        {Boolean(task.event) && (
          <div className={styles.column}>
            {tagActive && (
              <FloatMenu
                position={"horizontal_left"}
                target={tagRef}
                menuRef={tagMenuRef}
              >
                <TagsSelector
                  single={true}
                  selected={task.event.tag ? [task.event.tag] : []}
                  select={tag => {
                    setTimeout(() => {
                      task.event.setTag(tag)
                      setTagActive(false)
                    }, 100)
                  }}
                  unselect={() => {
                    setTimeout(() => {
                      task.event.setTag(null)
                      setTagActive(false)
                    }, 10)
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
                  initialTime={task.event.start}
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
                  minimalTime={task.event.start}
                  initialTime={task.event.end}
                />
              </FloatMenu>
            )}
            <div className={styles.eventMenu}>
              <div className={styles.menuItem}>
                <input
                  value={task.event.name}
                  onChange={e => task.event.setName(e.target.value)}
                />
              </div>
              <div className={styles.menuItem}>
                <span className={styles.menuItemName}>Весь день:</span>
                <Checkbox
                  checked={task.event.allDay}
                  onChange={task.event.setAllDay}
                />
              </div>
              <div
                className={classNames({
                  [styles.menuItem]: true,
                  [styles.disabled]: task.event.allDay,
                })}
              >
                <span className={styles.menuItemName}>Начало:</span>{" "}
                <span
                  className={styles.menuItemValue}
                  ref={startRef}
                  onClick={() => setStartActive(true)}
                >
                  {padTime(task.event.start)}
                </span>
              </div>
              <div
                className={classNames({
                  [styles.menuItem]: true,
                  [styles.disabled]: task.event.allDay,
                })}
              >
                <span className={styles.menuItemName}>Конец:</span>{" "}
                <span
                  className={styles.menuItemValue}
                  ref={endRef}
                  onClick={() => setEndActive(true)}
                >
                  {padTime(task.event.end)}
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
                  {task.event.tag ? task.event.tag.name : "Нет"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)

export default TaskDateSelector
