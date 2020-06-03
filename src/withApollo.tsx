/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React from 'react';
import { getDataFromTree } from '@apollo/react-ssr';
import nextWithApollo from 'next-with-apollo';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import fetch from 'isomorphic-unfetch';

type CommonProps = {
  // graphql port for ssr
  localPort?: number;
};

type Props =
  | ({
      url: string;
      httpUrl?: undefined;
      wsUrl?: undefined;
    } & CommonProps)
  | ({
      url?: undefined;
      wsUrl?: string;
      httpUrl: string;
    } & CommonProps);

const completeUrl = (raw: string | undefined, localPort?: number) =>
  raw
    ? raw[0] === '/'
      ? process.browser
        ? window.location.host + raw
        : `localhost${localPort ? `:${localPort}` : ''}` + raw
      : raw
    : raw;

export const withApollo = (
  component: Parameters<ReturnType<typeof nextWithApollo>>[0],
  { url, httpUrl, wsUrl, localPort }: Props
): ReturnType<ReturnType<typeof nextWithApollo>> => {
  const ssrMode = !process.browser;

  wsUrl = completeUrl(wsUrl, localPort);
  httpUrl = completeUrl(httpUrl, localPort);
  url = completeUrl(url, localPort);

  if (!wsUrl) {
    wsUrl = `ws://${url}`;
  }
  if (!httpUrl) {
    httpUrl = `http://${url}`;
  }
  if (!httpUrl) {
    throw new Error(
      'either url or httpUrl must be provided to make an apollo connection'
    );
  }

  const httpLink: ApolloLink = new HttpLink({
    uri: httpUrl,
    credentials: 'same-origin',
    fetch,
  });
  let link = httpLink;
  if (!ssrMode && wsUrl) {
    const wsLink = new WebSocketLink({
      uri: wsUrl,
      options: {
        reconnect: true,
      },
      // eslint not seeing WebSocket definition in typescript package. need to fix eslint rules
      // eslint-disable-next-line no-undef
      webSocketImpl: WebSocket,
    });
    link = split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return (
          def.kind === 'OperationDefinition' && def.operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    );
  }

  return nextWithApollo(
    ({ initialState }) => {
      return new ApolloClient({
        link,
        ssrMode,
        connectToDevTools: !ssrMode,
        // type is somehow lost here. need to fix it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cache: new InMemoryCache().restore((initialState as any) || {}),
      });
    },
    {
      render: ({ Page, props }) => (
        <ApolloProvider client={props.apollo}>
          <Page {...props} />
        </ApolloProvider>
      ),
    }
  )(component, { getDataFromTree });
};
