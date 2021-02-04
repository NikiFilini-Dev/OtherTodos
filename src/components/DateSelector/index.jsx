import React from "react"
import styles from "./styles.styl"
import FloatMenu from "components/FloatMenu"
import { useFloatMenu } from "tools/hooks"
import classNames from "classnames"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"

import ArrowLeft from "assets/arrow_left.svg"
import ArrowRight from "assets/arrow_right.svg"
import { buildCalendar } from "tools/date"

import moment from "moment"

const DateSelector = observer(({ value, onSelect, triggerRef, right }) => {
  if (!value) {
    value = new Date()
  }

  if (typeof value === "string") value = moment(value)._d

  const {
    tasks: { all },
  } = useMst()

  const [, box] = useFloatMenu(triggerRef)
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
    if (onSelect) onSelect(day)
  }

  return (
    <FloatMenu targetBox={box} position={right ? "right" : "left"}>
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
      <div className={styles.wrapper}>
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
    </FloatMenu>
  )
})

export default DateSelector
