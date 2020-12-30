import React from "react"
import styles from "./styles.styl"

import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import classNames from "classnames"

import Today from "components/Screens/Today"
import Project from "components/Screens/Project"
import Tag from "components/Screens/Tag"
import Inbox from "components/Screens/Inbox"
import Sidebar from "components/Sidebar"

import DaySelector from "components/DaySelector"

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
    case "TAG":
      Screen = Tag
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
      {/*<div className={styles.timeline}>*/}
      {/*  <DaySelector />*/}
      {/*</div>*/}
    </div>
  )
})

export default <App />
