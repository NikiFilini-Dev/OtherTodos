import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import Logo from "assets/logo.svg"
import classNames from "classnames"
import LetterIcon from "assets/letter.svg"
import TodayIcon from "assets/today.svg"
import ArrowRightIcon from "assets/arrow_right.svg"
import FolderIcon from "assets/folder.svg"
import propTypes from "prop-types"

const Element = ({ active, onClick, icon, text }) => {
  const Icon = icon
  return (
    <div
      className={classNames({
        [styles.groupElement]: true,
        [styles.active]: active,
      })}
      onClick={onClick}
    >
      <Icon className={styles.groupElementIcon} />
      {text}
    </div>
  )
}

Element.propTypes = {
  active: propTypes.bool,
  onClick: propTypes.func,
  icon: propTypes.any,
  text: propTypes.string,
}

const Group = ({ name, elements, isActive, onElementClick }) => {
  const [isOpen, setIsOpen] = React.useState(true)
  if (!isActive) isActive = () => {}

  return (
    <div>
      <div className={styles.groupTitle} onClick={() => setIsOpen(!isOpen)}>
        <ArrowRightIcon
          className={classNames({
            [styles.groupTitleIcon]: true,
            [styles.groupTitleIconOpen]: isOpen,
          })}
        />
        {name}
      </div>
      {isOpen &&
        elements.map((project) => (
          <Element
            key={`project_${project.id}`}
            text={project.name}
            icon={FolderIcon}
            active={isActive(project)}
            onClick={onElementClick(project)}
          />
        ))}
    </div>
  )
}

Group.propTypes = {
  name: propTypes.string,
  elements: propTypes.array,
  isActive: propTypes.func,
  onElementClick: propTypes.func,
}

const Sidebar = observer(() => {
  const {
    screen,
    setScreen,
    projects,
    selectedProject,
    selectProject,
  } = useMst()
  return (
    <div>
      <div className={styles.logoWrapper}>
        <Logo className={styles.logo} />
        <span className={styles.logoTitle}>Task</span>
      </div>
      <div
        className={classNames({
          [styles.groupElement]: true,
          [styles.active]: screen === "INBOX",
        })}
        onClick={() => setScreen("INBOX")}
      >
        <LetterIcon className={styles.groupElementIcon} />
        Входящие
      </div>
      <div
        className={classNames({
          [styles.groupElement]: true,
          [styles.active]: screen === "TODAY",
        })}
        onClick={() => setScreen("TODAY")}
      >
        <TodayIcon className={styles.groupElementIcon} />
        Сегодня
      </div>

      <Group
        name={"Проекты"}
        elements={projects}
        isActive={(project) =>
          project === selectedProject && screen === "PROJECT"
        }
        onElementClick={(project) => {
          return () => {
            setScreen("PROJECT")
            selectProject(project)
          }
        }}
      />
    </div>
  )
})

export default Sidebar
