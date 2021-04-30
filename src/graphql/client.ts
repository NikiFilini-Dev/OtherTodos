import { createClient, fetchExchange } from "urql"

const client = createClient({
  url: process.env.API_URL || "",
  fetchOptions: () => {
    const token = window.getToken()
    return {
      headers: { Authorization: token ? `${token}` : "" },
    }
  },
  exchanges: [fetchExchange],
})

export default client
