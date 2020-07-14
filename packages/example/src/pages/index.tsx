import React from "react"
import gql from "graphql-tag"
import {
  withApollo,
  useQuery,
  useSubscription,
  useMutation,
} from "apollo-client-ssr"

import { port } from "../common"

const QUERY = gql`
  query {
    test {
      status
      message
    }
  }
`

const MUTATION = gql`
  mutation {
    test {
      status
      message
    }
  }
`

const SUBSCRIPTION = gql`
  subscription {
    test {
      status
      message
    }
  }
`

const Home = () => {
  const query = useQuery(QUERY)
  const subscription = useSubscription<{
    test: { status: string; message: string }
  }>({ subscription: { schema: SUBSCRIPTION }, query: { schema: QUERY } })
  const [mutate, mutation] = useMutation(MUTATION)
  return (
    <div>
      <div>
        Query:{" "}
        {query.error
          ? query.error.message
          : query.data && !query.loading
          ? `${query.data.test.status} ${query.data.test.message}`
          : "loading"}
      </div>
      <div>
        Mutation:{" "}
        {mutation.error
          ? mutation.error.message
          : mutation.data && !mutation.loading
          ? `${mutation.data.test.status} ${mutation.data.test.message}`
          : "loading"}
        <button onClick={() => mutate()}>update</button>
      </div>
      <div>
        Subscription:{" "}
        {subscription.error
          ? subscription.error.message
          : subscription.data && !subscription.loading
          ? `${subscription.data.test.status} ${subscription.data.test.message}`
          : "loading"}
      </div>
    </div>
  )
}

export default withApollo(Home, {
  url: "/graphql",
  localPort: port,
  subscription: true,
})
