import React, { CSSProperties } from "react"
import styles from "./styles.m.styl"
import { observer } from "mobx-react"
import { useMst } from "../../models/RootStore"
import { HabitColorMap, HabitIconMap, IHabit } from "../../models/Habit"
import range from "../../tools/range"
import CheckboxIcon from "../../assets/checkmark.svg"
import EditIcon from "../../assets/customIcons/edit.svg"
import PlusIcon from "../../assets/customIcons/plusCircle.svg"
import { DateTime } from "luxon"
import HabitForm from "../HabitForm"
import classNames from "classnames"

const Habit = observer(
  ({ habit, onEditClick }: { habit: IHabit; onEditClick: () => void }) => {
    const { createHabitRecord, deleteHabitRecord } = useMst()
    const editRef = React.useRef<HTMLDivElement>(null)
    const donePercent = (100 / habit.recordsPerDay) * habit.records.length
    const onHabitClick = e => {
      if (!editRef.current) return
      if (editRef.current === e.target || editRef.current.contains(e.target))
        onEditClick()
      if (
        e.target.classList.contains(styles.done) ||
        e.target.tagName === "svg" ||
        e.target.tagName === "path"
      )
        return
      else if (habit.records.length < habit.recordsPerDay)
        createHabitRecord({
          habit,
          date: DateTime.now().toFormat("M/d/yyyy"),
        })
    }
    const Icon = HabitIconMap[habit.icon]
    return (
      <div
        className={styles.habit}
        style={
          {
            "--donePercent": `${donePercent}%`,
            "--habitColor": HabitColorMap[habit.color],
          } as CSSProperties
        }
        onClick={onHabitClick}
      >
        <div className={styles.edit} ref={editRef}>
          <EditIcon />
        </div>
        <div
          className={classNames({
            [styles.background]: true,
            [styles.invisible]: !habit.records.length,
          })}
        />
        <div className={styles.info}>
          <Icon />
          <span>{habit.name}</span>
        </div>
        <div className={styles.records}>
          {habit.records.map(record => (
            <div
              className={styles.done}
              key={record.id}
              onClick={() => deleteHabitRecord(record.id)}
            >
              <CheckboxIcon />
            </div>
          ))}
          {range(habit.recordsPerDay - habit.records.length).map(index => (
            <div className={styles.waiting} key={index} />
          ))}
        </div>
      </div>
    )
  },
)

const Habits = observer(({ date }: { date: string }) => {
  const { habits, setTempHabit } = useMst()
  const [editingHabitId, setEditingHabitId] = React.useState<null | string>(
    null,
  )
  return (
    <React.Fragment>
      <div className={styles.list}>
        {habits
          .filter(habit => habit.hasDate(date))
          .map(habit => (
            <Habit
              habit={habit}
              key={habit.id}
              onEditClick={() => {
                setEditingHabitId(habit.id)
                setTempHabit({ ...habit })
              }}
            />
          ))}
        <div className={styles.addHabit} onClick={() => setTempHabit({})}>
          <PlusIcon />
          Добавить
        </div>
      </div>
      <HabitForm
        habitId={editingHabitId}
        onDone={() => setEditingHabitId(null)}
      />
    </React.Fragment>
  )
})

export default Habits
