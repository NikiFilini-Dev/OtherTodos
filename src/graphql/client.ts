import { createClient, fetchExchange } from "urql"

const client = createClient({
  url: "http://localhost:8888/query",
  fetchOptions: () => {
    const token = window.getToken()
    return {
      headers: { Authorization: token ? `${token}` : "" },
    }
  },
  exchanges: [fetchExchange],
})

export default client
