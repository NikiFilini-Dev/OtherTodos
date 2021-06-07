function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt)
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const parrots = [":parrot:", ":partyparrot:"]
const count = [1, 2, 3, 4, 5]
const seconds = range(10, 1)
const lastMessages = []
const uniqueLength = 10
let TOTAL = 0
let WAITING = false

const rawTotal = localStorage.getItem("TOTAL")
if (rawTotal) TOTAL = parseInt(rawTotal)

function generateMessage() {
  let prts = []
  const c = randomChoice(count)
  for (let i = 0; i < c; i++) {
    prts.push(randomChoice(parrots))
  }
  return prts.join(" ")
}

function sendMessage(msg) {
  if (lastMessages.length >= uniqueLength) lastMessages.shift()
  lastMessages.push(msg)
  console.log("Sending message \"" + msg + "\"")
  document.querySelector("input#content").value = msg
  document.querySelector("button#submit_button").click()
}

function processResponses(str) {
  if (str === "9000") {
    WAITING = true
    setTimeout(() => WAITING = false, 60000)
    return str
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(str, "text/html")
  const el = doc.querySelector(".bustate.bolded")
  if (!el) return str
  const s = el.innerText
  const re = /\(([\+\-])(\d+?) шк\)/
  const results = s.match(re)

  if (results[1] === "+") {
    TOTAL += parseInt(results[2])
    localStorage.setItem("TOTAL", TOTAL)
    console.log("%cWIN: %c+%d %c(total: %d)", "color: green;", "color: green; font-weight: bold;", parseInt(results[2]), `color: ${TOTAL < 0? "red" : "green"}; font-style: italic;`, TOTAL)
  }
  if (results[1] === "-") {
    TOTAL -= parseInt(results[2])
    localStorage.setItem("TOTAL", TOTAL)
    console.log("%cLOSE: %c-%d %c(total: %d)", "color: red;", "color: red; font-weight: bold;", parseInt(results[2]), `color: ${TOTAL < 0? "red" : "green"}; font-style: italic;`, TOTAL)
  }

  return str
}

function main() {
  if (!WAITING) {
    let msg = generateMessage()
    while (lastMessages.includes(msg)) msg = generateMessage()
    sendMessage(msg)
  } else {
    console.log("Waiting...")
  }
  const nextIn = randomChoice(seconds)
  console.log("%cWaiting %d seconds", "color: grey; font-style: italic;", nextIn)
  setTimeout(() => main(), nextIn * 1000)
}

$.ajaxSetup({
  dataFilter: processResponses,
})
main()