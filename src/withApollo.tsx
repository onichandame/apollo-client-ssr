/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React from 'react'
import { getDataFromTree } from '@apollo/react-ssr'
import nextWithApollo from 'next-with-apollo'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloLink, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'isomorphic-unfetch'

type Props =
| {
  url: string;
  httpUrl?: undefined;
  wsUrl?: undefined;
}
| {
  url?: undefined;
  httpUrl: string;
  wsUrl: string;
}

export const withApollo = ({ url, httpUrl, wsUrl }: Props, component: Parameters<ReturnType<typeof nextWithApollo>>[0]): ReturnType<ReturnType<typeof nextWithApollo>> => {
  if (!(httpUrl && wsUrl) && url) {
    httpUrl = `http://${url}`
    wsUrl = `ws://${url}`
  } else {
    throw new Error('either url or httpUrl and wsUrl must be provided to make apollo connection')
  }

  const ssrMode = !process.browser

  const httpLink: ApolloLink = new HttpLink({
    uri: httpUrl,
    credentials: 'same-origin',
    fetch
  })
  let link = httpLink
  if (!ssrMode) {
    const wsLink = new WebSocketLink({
      uri: wsUrl,
      options: {
        reconnect: true
      },
      webSocketImpl: WebSocket
    })
    link = split(
      ({ query }) => {
        const def = getMainDefinition((query))
        return def.kind === 'OperationDefinition' && def.operation === 'subscription'
      },
      wsLink,
      httpLink
    )
  }

  return nextWithApollo(
    ({ initialState }) => {
      return new ApolloClient({
        link,
        ssrMode,
        connectToDevTools: !ssrMode,
        // type is somehow lost. need to fix it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cache: new InMemoryCache().restore(initialState as any || {})
      })
    },
    {
      render: ({ Page, props }) => (
        <ApolloProvider client={props.apollo}>
          <Page {...props}/>
        </ApolloProvider>
      )
    }
  )(component, { getDataFromTree })
}
