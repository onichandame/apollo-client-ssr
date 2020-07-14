import { ApolloServer } from "apollo-server-express"
import { createServer, Server } from "http"
import { buildSchema } from "type-graphql"
import { Express } from "express"

import { TestResolvers, pubSub } from "./resolver"

export const apollo = async (app: Express) => {
  const server = new ApolloServer({
    schema: await buildSchema({
      validate: false,
      resolvers: TestResolvers,
      pubSub,
    }),
  })
  server.applyMiddleware({ app, path: "/graphql", cors: false })
  const httpServer = createServer(app)
  server.installSubscriptionHandlers(httpServer)
  return [httpServer, server] as [Server, ApolloServer]
}
