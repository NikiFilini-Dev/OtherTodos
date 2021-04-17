import React from "react"
import { observer } from "mobx-react"
import classNames from "classnames"
import styles from "./styles.styl"

const Input = observer(
  ({
    placeholder,
    value,
    onChange,
    type = "text",
    className = "",
    name = "",
  }) => {
    const ref = React.useRef<HTMLInputElement>(null)
    const [isActive, setIsActive] = React.useState(false)

    React.useEffect(() => {
      if (!ref.current) return

      const onFocus = () => setIsActive(true)
      const onBlur = () => setIsActive(false)

      ref.current.addEventListener("blur", onBlur)
      ref.current.addEventListener("focus", onFocus)

      return () => {
        if (!ref.current) return
        ref.current.removeEventListener("blur", onBlur)
        ref.current.removeEventListener("focus", onFocus)
      }
    })

    const onClick = () => {
      if (!ref.current) return
      ref.current.focus()
    }

    return (
      <div
        className={classNames({
          [styles.inputWrapper]: true,
          [styles.active]: isActive || value,
          [className]: true,
        })}
        onClick={onClick}
      >
        <span className={styles.placeholder}>{placeholder}</span>
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          type={type}
          name={name}
        />
      </div>
    )
  },
)

export default Input
