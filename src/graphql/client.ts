import { createClient, fetchExchange } from "urql"
console.log(process.env.API_URL)
const client = createClient({
  url: process.env.API_URL || "",
  fetchOptions: () => {
    const token = window.getToken()
    return {
      headers: { Authorization: token ? `${token}` : "" },
    }
    // return {}
  },
  exchanges: [fetchExchange],
})

export default client
