import React from "react"
import { ApolloClient, InMemoryCache } from "@apollo/client"

export const client = new ApolloClient({
  uri: "http://localhost:8888/query",
  cache: new InMemoryCache(),
})

const GqlContext = React.createContext(client)
export default GqlContext
