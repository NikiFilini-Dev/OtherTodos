import { v4 as uuidv4 } from "uuid"
import { randomTagColor } from "./Tag"
import { DateTime } from "luxon"
import { IRootStore } from "./RootStore"
import moment from "moment"

type Migration = {
  id: number
  desc: string
  up: (store: IRootStore) => IRootStore
}

const migrations: Migration[] = []

export default migrations
