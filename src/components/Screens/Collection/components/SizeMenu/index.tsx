import React from "react"
import { observer } from "mobx-react"
import styles from "../../styles.styl"
import classNames from "classnames"
import CheckIcon from "../../../../../assets/line_awesome/check-solid.svg"
import FloatMenu from "../../../../FloatMenu"

const SizeMenu = observer(({ currentSize, setSize, triggerRef, menuRef }) => {
  return (
    <FloatMenu
      target={triggerRef}
      menuRef={menuRef}
      position={"horizontal_auto"}
    >
      <div className={styles.menu}>
        <div className={styles.menuName}>Ширина колонок:</div>
        <div
          className={classNames({
            [styles.size]: true,
            [styles.active]: currentSize === "small",
          })}
          onClick={() => setSize("small")}
        >
          Маленькая
          <CheckIcon />
        </div>
        <div
          className={classNames({
            [styles.size]: true,
            [styles.active]: currentSize === "medium",
          })}
          onClick={() => setSize("medium")}
        >
          Средняя
          <CheckIcon />
        </div>
        <div
          className={classNames({
            [styles.size]: true,
            [styles.active]: currentSize === "big",
          })}
          onClick={() => setSize("big")}
        >
          Большая
          <CheckIcon />
        </div>
      </div>
    </FloatMenu>
  )
})

export default SizeMenu
