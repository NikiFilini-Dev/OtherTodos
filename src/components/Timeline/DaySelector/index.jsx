import React from "react"
import { buildCalendar, getMonth } from "tools/date"
import styles from "./styles.styl"
import classNames from "classnames"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import { DateTime } from "luxon"

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const DaySelector = observer(() => {
  const { timelineDate, setTimelineDate } = useMst()
  const date = DateTime.fromFormat(timelineDate, "M/d/yyyy")
  const [monthOffset, setMonthOffset] = React.useState(0)
  const calendarReferenceDate = new Date()
  calendarReferenceDate.setMonth(calendarReferenceDate.getMonth() + monthOffset)
  const weeks = buildCalendar(calendarReferenceDate, date.toJSDate(), [])
  const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]

  return (
    <div className={styles.calendar}>
      <div className={styles.monthsSelector}>
        <span
          className={styles.changeMonth}
          onClick={() => setMonthOffset(monthOffset - 1)}
        >
          {capitalizeFirstLetter(
            getMonth(calendarReferenceDate.getMonth() - 1),
          )}
        </span>
        <span className={styles.currentMonth}>
          {capitalizeFirstLetter(getMonth(calendarReferenceDate.getMonth()))}
          {calendarReferenceDate.getFullYear() !== new Date().getFullYear() && (
            <span className={styles.yearHint}>
              {" "}
              ({calendarReferenceDate.getFullYear()})
            </span>
          )}
        </span>
        <span
          className={styles.changeMonth}
          onClick={() => setMonthOffset(monthOffset + 1)}
        >
          {capitalizeFirstLetter(
            getMonth(calendarReferenceDate.getMonth() + 1),
          )}
        </span>
      </div>
      <div className={styles.week}>
        {weekdays.map(name => (
          <span
            key={name}
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
        <div key={`week_${weekI}`} className={styles.week}>
          {week.map((day, dayI) => (
            <div
              key={`week_${weekI}_day_${dayI}`}
              className={classNames({
                [styles.day]: true,
                [styles.alien]: day.alien,
                [styles.today]: day.today,
                [styles.selected]: day.selected,
              })}
              onClick={() => setTimelineDate(day.date)}
            >
              {day.number}
              {day.hasTasks && <span className={styles.hasTasksMark} />}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
})

export default DaySelector
