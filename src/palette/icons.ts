import BookmarkIcon from "../assets/customIcons/bookmark.svg"
import ShipIcon from "../assets/customIcons/ship.svg"
import BallIcon from "../assets/customIcons/ball.svg"
import FireIcon from "../assets/customIcons/fire.svg"
import CameraIcon from "../assets/customIcons/camera.svg"
import WinIcon from "../assets/customIcons/win.svg"
import PresentIcon from "../assets/customIcons/present.svg"
import PoolIcon from "../assets/customIcons/pool.svg"
import BookIcon from "../assets/customIcons/book.svg"
import WalletIcon from "../assets/customIcons/wallet.svg"
import EyeIcon from "../assets/customIcons/eye.svg"
import HeartIcon from "../assets/customIcons/heart.svg"
import KeyIcon from "../assets/customIcons/key.svg"
import LightningIcon from "../assets/customIcons/lightning.svg"
import MsgIcon from "../assets/customIcons/msg_bubble.svg"
import PinIcon from "../assets/customIcons/pin.svg"
import RocketIcon from "../assets/customIcons/rocket.svg"
import SendIcon from "../assets/customIcons/send.svg"
import TerminalIcon from "../assets/customIcons/terminal.svg"
import TodoListIcon from "../assets/customIcons/todo_list.svg"
import CheckListIcon from "../assets/customIcons/check_list.svg"

export const IconNames: IconName[] = [
  "bookmark",
  "ship",
  "ball",
  "fire",
  "camera",
  "win",
  "present",
  "pool",
  "book",
  "wallet",
  "eye",
  "heart",
  "key",
  "lightning",
  "msg_bubble",
  "pin",
  "rocket",
  "send",
  "terminal",
  "todo_list",
  "check_list",
]

export type IconName =
  | "bookmark"
  | "ship"
  | "ball"
  | "fire"
  | "camera"
  | "win"
  | "present"
  | "pool"
  | "book"
  | "wallet"
  | "eye"
  | "heart"
  | "key"
  | "lightning"
  | "msg_bubble"
  | "pin"
  | "rocket"
  | "send"
  | "terminal"
  | "todo_list"
  | "check_list"

export const IconsMap: Record<IconName, any> = {
  bookmark: BookmarkIcon,
  ship: ShipIcon,
  ball: BallIcon,
  fire: FireIcon,
  camera: CameraIcon,
  win: WinIcon,
  present: PresentIcon,
  pool: PoolIcon,
  book: BookIcon,
  wallet: WalletIcon,
  eye: EyeIcon,
  heart: HeartIcon,
  key: KeyIcon,
  lightning: LightningIcon,
  msg_bubble: MsgIcon,
  pin: PinIcon,
  rocket: RocketIcon,
  send: SendIcon,
  terminal: TerminalIcon,
  todo_list: TodoListIcon,
  check_list: CheckListIcon,
}
