import { useEffect } from "react"
import { ApolloError } from "apollo-client"
import { DocumentNode } from "graphql"
import { OperationVariables } from "@apollo/react-common"
import { useQuery, QueryHookOptions } from "@apollo/react-hooks"

type Options<T, D> = {
  schema: DocumentNode
  options?: QueryHookOptions<T, D>
}

// need to simplify and refine types here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props<T = any, D = OperationVariables> = {
  query: Options<T, D>
  subscription: {
    schema: DocumentNode
    options?:
      | {
          variables: OperationVariables
        }
      | undefined
  }
}

export const useSubscription = <T>({
  query,
  subscription
}: Props<T>): {
  loading: boolean
  error: ApolloError | undefined
  data: T | undefined
} => {
  const { data, loading, error, subscribeToMore } = useQuery<T>(
    query.schema,
    query.options
  )
  useEffect(
    () =>
      subscribeToMore({
        document: subscription.schema,
        ...subscription.options,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev
          else return subscriptionData.data
        }
      }),
    [subscribeToMore]
  )
  return {
    loading,
    error,
    data
  }
}
