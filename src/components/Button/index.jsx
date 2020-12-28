import styles from "./styles.styl"
import propTypes from "prop-types"
import classNames from "classnames"

const Button = ({
  icon,
  text,
  onClick,
  secondary = false,
  activated = false,
}) => {
  const Icon = icon
  return (
    <div
      className={classNames({
        [styles.button]: true,
        [styles.secondary]: secondary,
        [styles.activated]: activated,
      })}
      onClick={onClick}
    >
      {icon && <Icon className={styles.icon} />}
      {text && <span className={styles.text}>{text}</span>}
    </div>
  )
}

Button.propTypes = {
  icon: propTypes.any,
  text: propTypes.string,
  onClick: propTypes.func,
}

export default Button
