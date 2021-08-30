import React from "react"
import styles from "./styles.styl"
import { observer } from "mobx-react"
import classNames from "classnames"

type Props = {
  onClick: () => void
  className: string
}

const FloatPlus = observer(({ className, onClick }: Props) => {
  return (
    <div className={classNames(className, styles.wrapper)}>
      <div
        className={styles.floater}
        onClick={e => {
          e.stopPropagation()
          onClick()
        }}
      >
        +
      </div>
    </div>
  )
})

export default FloatPlus
