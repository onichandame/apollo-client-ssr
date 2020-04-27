# Apollo Client for SSR

The necessary HOC and hook for SSR. e.g. Next.js.

This is a thin wrapper around [next-with-apollo](https://www.npmjs.com/package/next-with-apollo). If you don't need subscription to work with SSR, please use it instead.

# Author

[onichandame](https://github.com/onichandame)

# Usage

```typescript
import React, { FC } from 'react'
import gql fromo 'graphql-tag'
import { withApollo, useQuery, useMutation, useSubscription } from 'apollo-client-ssr'

const QUERY = gql`
  query book($id: String!){
    book(id: $id){
      author
    }
  }
`

const MUTATION = gql`
  mutation book($id: String!, $authoor: String!){
    book(id: $id, author: $authoor)
  }
`

const SUBSCRIPTION = gql`
  subscription book($id: String!){
    book(id: $id){
      author
    }
  }
`

const Query: FC = () => {
  const { data,loading } = useQuery<{book: {author: string}}>(QUERY, { variables: {id: '1'} })
  if(loading || !data) return <p>loading...</p>
  else return <p>{`book 1 is authored by ${data.book.author}`}</p>
}

export const QueryAuthor = withApollo(Query, {
  url: 'localhost/graphql'
})

const Mutation: FC = () => {
  const { data, loading } = useMutation<boolean>(MUTATION, {variables: {id: '1', author: 'shakespeare'}})
  if(loading || !data) return <p>loading...</p>
  else return <p>{data.book ? 'done' : 'failed'}</p>
}

export const MutateAuthor = withApollo(Mutation, {
  url: 'localhost/graphql'
})

const Subscription: FC = () => {
  const { data, loading } = useQuery<{book: {author: string}}>({
    query: [ QUERY, { variables: {id: '1'} }], // needed for the first render on the server side
    subscription: [ SUBSCRIPTION, { variables: {id: '1'} } ]
  })
  if(loading || !data) return <p>loading...</p>
  else return <p>{`book 1 is authored by ${data.book.author}`}</p>
}

export const SubscriptionAuthor = withApollo(Subscription, {
  url: 'localhost/graphql'
})
```

# License

MIT

# Contributing

Please open issues or PRs to discuss whatever you think that will make this tool more convenient!

# Roadmap

- add SSL support for http and ws
- allow more customization of the ApolloClient
- allow different options for query and subscription
