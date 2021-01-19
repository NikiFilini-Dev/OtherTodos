import React from "react"
import styles from "./styles.styl"

import { observer } from "mobx-react"
import { useMst } from "models/RootStore"

import Today from "components/Screens/Today"
import Project from "components/Screens/Project"
import Tags from "components/Screens/Tags"
import Inbox from "components/Screens/Inbox"
import Log from "components/Screens/Log"
import Sidebar from "components/Sidebar"

const App = observer(() => {
  const { screen } = useMst()
  let Screen = Today
  switch (screen) {
    case "INBOX":
      Screen = Inbox
      break
    case "TODAY":
      Screen = Today
      break
    case "PROJECT":
      Screen = Project
      break
    case "TAGS":
      Screen = Tags
      break
    case "LOG":
      Screen = Log
      break
  }
  return (
    <div className={styles.app}>
      <div className={styles.sideBar}>
        <Sidebar />
      </div>
      <div className={styles.main}>
        <Screen />
      </div>
    </div>
  )
})

export default <App />
