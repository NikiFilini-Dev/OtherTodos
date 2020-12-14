import React from "react"
import styles from "./styles.styl"

import { observer } from "mobx-react"
import { useMst } from "../../models/RootStore"
import classNames from "classnames"

import Project from "../Project/index.jsx"
import logo from "../../assets/logo.svg"

const App = observer(() => {
  const { projects } = useMst()
  return (
    <div className={styles.app}>
      <div className={styles.sideBar}>
        <div className={styles.logoWrapper}>
          <img className={styles.logo} src={logo} />
          <span className={styles.logoTitle}>Task</span>
        </div>
        <div
          className={classNames({
            [styles.groupElement]: true,
            [styles.active]: true,
          })}
        >
          Сегодня
        </div>
      </div>
      <div className={styles.main}>
        {projects.map((project) => (
          <Project project={project} key={`project_${project.id}`} />
        ))}
      </div>
      <div className={styles.timeline}></div>
    </div>
  )
})

export default <App />
