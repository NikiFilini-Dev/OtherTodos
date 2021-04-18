import { DateTime } from "luxon"

export function isSameDate(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function isToday(date) {
  return isSameDate(date, new Date())
}

const getDay = date => {
  let d = date.getDay() - 1
  if (d === -1) d = 6
  return d
}

const getMonthDaysCount = originalDate => {
  const date = new Date(originalDate)
  let c = 28
  const initialMonth = date.getMonth()
  while (date.getMonth() === initialMonth) {
    c++
    date.setDate(c)
  }
  c--
  return c
}

export function buildCalendar(date, value, tasks = []) {
  const weeks = []
  const now = new Date()
  const tmpDate = new Date(date)

  const daysWithTasks = []
  tasks.forEach(task => {
    if (!task.date) return
    let d = DateTime.fromFormat(task.date, "D").toJSDate()
    if (
      d.getMonth() !== date.getMonth() ||
      d.getFullYear() !== date.getFullYear()
    )
      return

    const key = DateTime.fromJSDate(d).toFormat("D")
    if (daysWithTasks.indexOf(key)) daysWithTasks.push(key)
  })

  tmpDate.setDate(1)
  const daysCount = getMonthDaysCount(date)

  tmpDate.setMonth(date.getMonth())
  tmpDate.setDate(1)

  let monthStart = getDay(tmpDate)

  tmpDate.setDate(daysCount)
  let monthEnd = getDay(tmpDate)
  const totalDaysCount = daysCount + monthStart + (6 - monthEnd)
  let wc = 0
  let week = []
  for (let i = 0; i < totalDaysCount; i++) {
    let d = i - monthStart + 1
    if (wc === 7) {
      weeks.push(week)
      week = []
      wc = 0
    }
    tmpDate.setMonth(date.getMonth())
    tmpDate.setFullYear(date.getFullYear())
    tmpDate.setDate(d)
    // if (i < 0 && tmpDate.getMonth() === 0)
    //   tmpDate.setFullYear(date.getFullYear() - 1)
    week.push({
      number: tmpDate.getDate(),
      date: new Date(tmpDate),
      alien: d <= 0 || d > daysCount,
      today: isSameDate(tmpDate, now),
      selected: isSameDate(tmpDate, value),
      hasTasks:
        daysWithTasks.indexOf(DateTime.fromJSDate(tmpDate).toFormat("D")) >= 0,
    })
    wc++
  }
  weeks.push(week)

  return weeks
}
