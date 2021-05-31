import React from "react"
import { observer } from "mobx-react"
import FloatMenu from "../FloatMenu"
import { IconNames, IconsMap } from "../../palette/icons"
import styles from "./styles.styl"
import classNames from "classnames"

const ListIconMenu = observer(({ currentIconName, setIcon, triggerRef, menuRef }) => {
  return <FloatMenu position={"vertical_left"} target={triggerRef} menuRef={menuRef}>
    <div className={styles.list}>
      {IconNames.map(name => {
        const Icon = IconsMap[name]
        return <div key={`icon_${name}`} className={classNames({
          [styles.block]: true,
          [styles.active]: currentIconName === name
        })} onClick={() => setIcon(name)}><Icon /></div>
      })}
    </div>
  </FloatMenu>
})

export default ListIconMenu