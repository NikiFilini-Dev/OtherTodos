import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import FloatMenu from "../FloatMenu"
import { ColorNames, ColorsMap } from "../../palette/colors"
import styles from "./styles.styl"
import classNames from "classnames"

const ListColorMenu = observer(({ currentColorName, setColor, triggerRef, menuRef }) => {
  return <FloatMenu position={"horizontal_auto"} target={triggerRef} menuRef={menuRef}>
    <div className={styles.list}>
      {ColorNames.map(name => {
        return <div key={`color_${name}`} className={classNames({
          [styles.block]: true,
          [styles.active]: currentColorName === name
        })} onClick={() => setColor(name)} style={{"--color": ColorsMap[name]} as CSSProperties} />
      })}
    </div>
  </FloatMenu>
})

export default ListColorMenu