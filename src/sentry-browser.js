const Sentry = require("@sentry/browser")
const { Integrations } = require("@sentry/tracing")
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
})
