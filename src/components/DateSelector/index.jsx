import React from "react"
import PropTypes from "prop-types"
import styles from "./styles.styl"
import FloatMenu from "components/FloatMenu"
import { useFloatMenu } from "tools/hooks"
import classNames from "classnames"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"

import ArrowLeft from "assets/arrow_left.svg"
import ArrowRight from "assets/arrow_right.svg"
import { buildCalendar } from "tools/date"

const DateSelector = observer(({ value, onSelect, triggerRef }) => {
  if (!value) {
    value = new Date()
  }

  const {
    tasks: { all },
  } = useMst()

  const [_, box] = useFloatMenu(triggerRef)
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

  const weeks = buildCalendar(date, all)

  const onPrevClick = () => {
    const cpy = new Date()
    cpy.setMonth(date.getMonth() - 1)
    cpy.setFullYear(
      date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear(),
    )
    cpy.setDate(date.getDate())
    setDate(cpy)
  }

  const onNextClick = () => {
    const cpy = new Date()
    cpy.setMonth(date.getMonth() + 1)
    cpy.setFullYear(
      date.getMonth() === 11 ? date.getFullYear() + 1 : date.getFullYear(),
    )
    cpy.setDate(date.getDate())
    setDate(cpy)
  }

  const selectDate = (dayN) => {
    const resultDate = new Date(date)
    resultDate.setDate(dayN)
    if (onSelect) onSelect(resultDate)
  }

  return (
    <FloatMenu targetBox={box} position={"left"}>
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
                  [styles.today]: day.today,
                  [styles.selected]: day.selected,
                })}
                onClick={() => selectDate(day.number)}
              >
                {day.number}
                {day.hasTasks && <span className={styles.hasTasksMark} />}
              </span>
            ))}
          </div>
        ))}
      </div>
    </FloatMenu>
  )
})

export default DateSelector
