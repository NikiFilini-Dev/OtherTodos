import React from "react"
import "./styles.styl"

import { observer } from "mobx-react"
import { useMst } from "../../models/RootStore"

import Project from "../Project/index.jsx"

const App = observer(() => {
  const { projects } = useMst()
  return (
    <div>
      {projects.map((project) => (
        <Project project={project} key={`project_${project.id}`} />
      ))}
    </div>
  )
})

export default <App />
