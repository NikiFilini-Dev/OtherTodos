import React from "react"
import { observer } from "mobx-react"
import { IRootStore, useMst } from "../../models/RootStore"
import styles from "./styles.styl"
import Button from "../Button"
import Icon from "../Icon"
import { Duration } from "luxon"
import { onSnapshot } from "mobx-state-tree"

const Timer = observer(() => {
  const store: IRootStore = useMst()
  const {runningTimerSession, timerStatus,
    syncTimer, resumeTimer, pauseTimer, stopTimer, completeTimer } = store
  const [seconds, setSeconds] = React.useState(0)

  React.useEffect(() => {
    let lastTime: Date
    let seconds = 0
    let localTimerStatus = timerStatus
    onSnapshot(store, (snapshot: IRootStore) => {
      if (localTimerStatus !== snapshot.timerStatus) {
        localTimerStatus = snapshot.timerStatus
        lastTime = new Date()
      }
    })
    const updateTime = () => {
      setTimeout(() => updateTime(), 1000)

      if (localTimerStatus !== "RUNNING") {
        lastTime = new Date()
        seconds = 0
        setSeconds(0)
        return
      }
      seconds = seconds + (new Date().valueOf() - lastTime.valueOf()) / 1000
      lastTime = new Date()

      if (seconds >= 30) {
        syncTimer(seconds)
        seconds = 0
      }

      setSeconds(seconds)
    }
    lastTime = new Date()
    updateTime()
  }, [])

  if (!runningTimerSession) {
    return <React.Fragment />
  }

  const task = runningTimerSession.task

  return <div className={styles.wrapper}>
    <div className={styles.timer}>
      <span>{task.text}</span>
      <div className={styles.actions}>
        {timerStatus === "RUNNING" && (
          <Button color={"white"} iconName={"pause"}
                  textColor={"var(--brand)"} square onClick={() => pauseTimer(seconds)} />)}
        {timerStatus === "PAUSE" && (<
          Button color={"white"} iconName={"play"}
                 textColor={"var(--brand)"} square onClick={() => resumeTimer()} />)}
        {(timerStatus === "RUNNING" || timerStatus === "PAUSE") && (
          <Button color={"white"} iconName={"stop"}
                  textColor={"var(--brand)"} onClick={() => stopTimer(seconds)} square />)}
        <Button color={"white"} text={"Готово"} textColor={"var(--brand)"} onClick={() => completeTimer(seconds)} />
      </div>
      <Icon name={"timer"} className={styles.timerIcon} />
      <span className={styles.time}>
        {Duration
          .fromObject({seconds: runningTimerSession.task.totalTimeSpent + seconds})
          .toFormat("hh:mm:ss")}
      </span>
    </div>
  </div>
})
export default Timer