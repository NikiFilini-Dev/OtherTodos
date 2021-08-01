import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import { useMst } from "../../models/RootStore"
import { LogEntry } from "../Screens/Collection"
import { DateTime } from "luxon"
import classNames from "classnames"
import { LogAction } from "../Screens/Collection/actions"

const Notifications = observer(() => {
  const { user } = useMst()

  const logs = user.notifications.all
  const newLogs = user.notifications.new

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <span className={styles.title}>
          Уведомления
          {newLogs.length > 0 && (
            <React.Fragment> ({newLogs.length} новых)</React.Fragment>
          )}
          :
        </span>
        <span
          className={styles.markSeen}
          onClick={() =>
            user.setLastSeenNotificationsAt(DateTime.now().toISO())
          }
        >
          {newLogs.length > 0 && "Просмотрено"}
        </span>
      </div>
      {logs.map(log => (
        <div
          className={classNames({
            [styles.logWrapper]: true,
            [styles.new]: newLogs.includes(log),
          })}
          key={log.id}
        >
          <LogAction log={log} />
          <div className={styles.log}>
            <LogEntry log={log} />
            <div className={styles.datetime}>
              {DateTime.fromISO(log.datetime).toLocaleString({
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

export default Notifications
