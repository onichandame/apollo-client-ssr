import express from "express"
import bodyParser from "body-parser"
import "reflect-metadata" //before type-graphql

import { app } from "./app"
import { apollo } from "./apollo"
import { port } from "../common"

const handle = app.getRequestHandler()
;(async () => {
  await app.prepare()
  const server = express()
  // common middlewares
  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(bodyParser.json())
  // graphql middleware
  const [httpServer, apolloServer] = await apollo(server)

  server.all("*", (req, res) => res.headersSent || handle(req, res))

  httpServer.listen(port, () => {
    console.log(`🚀listening on ${port}`)
    console.log(`🚀graphql server ready at ${apolloServer.graphqlPath}`)
  })
})()
