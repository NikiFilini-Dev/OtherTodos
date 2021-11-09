import React from "react"
import clsx from "clsx"
import { DateTime } from "luxon"
import { observer } from "mobx-react-lite"
import styles from "./styles.styl"

const DateElement = ({
  diff,
  initialDate,
  onClick,
}: {
  diff: number
  initialDate: string
  onClick: (date: string) => void
}) => {
  let date = DateTime.fromFormat(initialDate, "M/d/yyyy").plus({
    days: diff,
  })
  date = date.setLocale("ru")
  return (
    <div
      onClick={() => onClick(date.toFormat("M/d/yyyy"))}
      className={styles.dateElement}
    >
      <span className={styles.name}>{date.toFormat("ccc")}</span>
      <span className={clsx(styles.day, !diff && styles.today)}>
        {date.toFormat("d")}
      </span>
    </div>
  )
}

const DaysRow = observer(
  ({
    initialDate,
    onClick,
  }: {
    initialDate: string
    n: number
    onClick: (date: string) => void
  }) => {
    const date = DateTime.fromFormat(initialDate, "M/d/yyyy").toJSDate()
    // 7 - date.getDay()
    const diffs: number[] = []
    for (let i = 0 - date.getDay() + 1; i <= 7 - date.getDay(); i++) {
      diffs.push(i)
    }
    return (
      <div className={styles.dateElements}>
        {diffs.map((i, index) => (
          <DateElement
            diff={i}
            initialDate={initialDate}
            key={`${initialDate}${i}`}
            onClick={onClick}
          />
        ))}
      </div>
    )
  },
)

export default DaysRow
