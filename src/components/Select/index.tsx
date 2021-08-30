import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { IconName } from "../../palette/icons"
import Icon from "../Icon"
import AngleDown from "../../assets/line_awesome/angle-down-solid.svg"
import styles from "./styles.styl"
import classNames from "classnames"
import { useClickOutsideRef } from "../../tools/hooks"
import noop from "lodash-es/noop"

export interface Variant {
  code: string
  name: string
  icon?: IconName
}

const Select = observer(
  ({
    variants,
    selected,
    select,
    stretch = false,
  }: {
    variants: Variant[]
    selected?: Variant | string
    select: (code: string) => void
    stretch?: boolean
  }) => {
    const list = [...variants]
    if (typeof selected === "string") {
      let tmp = variants.find(v => v.code === selected)
      if (!tmp) {
        tmp = { code: selected, name: selected }
        list.push(tmp)
      }
      selected = tmp
    }

    selected = selected as Variant

    const [isActive, setIsActive] = React.useState(false)
    const headRef = React.useRef<HTMLDivElement | null>(null)
    useClickOutsideRef(headRef, () => setIsActive(false))

    const listRef = React.useRef<HTMLDivElement | null>(null)
    const [listSize, setTopSize] = React.useState(0)
    React.useEffect(() => {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setTopSize(entry.contentRect.height)
        }
      })
      if (listRef.current) {
        const obj = listRef.current
        resizeObserver.observe(obj)
        return () => resizeObserver.unobserve(obj)
      }

      return noop
    }, [listRef.current])

    return (
      <div
        className={classNames({
          [styles.select]: true,
          [styles.active]: isActive,
          [styles.stretch]: stretch,
        })}
        style={{ "--selectListHeight": `${listSize}px` } as CSSProperties}
      >
        <div
          className={classNames({
            [styles.head]: true,
            [styles.active]: isActive,
          })}
          ref={headRef}
          onClick={() => setIsActive(!isActive)}
        >
          {selected && (
            <React.Fragment>
              {selected.icon && (
                <Icon name={selected.icon} className={styles.icon} />
              )}
              <span>{selected.name}</span>
            </React.Fragment>
          )}
          {!selected && <span>Выберите...</span>}
          <AngleDown className={styles.angle} />
        </div>
        <div className={styles.list} ref={listRef}>
          {isActive &&
            variants.map(variant => (
              <div
                className={classNames({
                  [styles.variant]: true,
                  [styles.active]:
                    selected &&
                    typeof selected === "object" &&
                    selected?.code === variant.code,
                })}
                key={variant.code}
                onClick={() => select(variant.code)}
              >
                {variant.icon && (
                  <Icon name={variant.icon} className={styles.icon} />
                )}
                <span>{variant.name}</span>
              </div>
            ))}
        </div>
      </div>
    )
  },
)

export default Select
