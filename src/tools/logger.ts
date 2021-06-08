const winston = require("winston")

const myFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] > ${message} `
    if (metadata && JSON.stringify(metadata) !== "{}") {
      msg += JSON.stringify(metadata)
    }
    return msg
  },
)

const newLogger = (label?: string) => {
  const consoleFormats = [
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.timestamp({
      format: "HH:mm:ss",
    }),
    myFormat,
  ]

  if (label)
    consoleFormats.unshift(winston.format.label({ label, message: true }))

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info",
    format: winston.format.splat(),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(...consoleFormats),
      }),
    ],
  })

  if (!IS_WEB) {
    console.log("IS WEB:", IS_WEB, window.IS_WEB)
    logger.transports.push(
      new winston.transports.File({
        filename: "error.log",
        level: "error",
        format: winston.format.combine(
          winston.format.simple(),
          winston.format.timestamp(),
        ),
      }),
    )
  }

  return logger
}

module.exports = { logger: newLogger(), createLogger: newLogger }
