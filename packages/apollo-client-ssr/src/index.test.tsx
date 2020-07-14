import React from "react"
import { act } from "react-dom/test-utils"
import { ApolloServer } from "apollo-server"
import "reflect-metadata" //before type-graphql
import { buildSchema } from "type-graphql"
import { Field, Resolver, Query, Mutation, ObjectType } from "type-graphql"
import { mount } from "enzyme"
import gql from "graphql-tag"

import { useQuery } from "./useQuery"
import { withApollo } from "./withApollo"

@ObjectType()
class Payload {
  @Field({ nullable: true })
  date!: Date
  @Field({ nullable: true })
  string!: string
}

@ObjectType()
class Reply {
  @Field({ nullable: false })
  status!: "success" | "failed"
  @Field({ nullable: true })
  payload?: Payload
}

@Resolver(() => Reply)
class TestResolver {
  @Query(() => Payload)
  async get() {
    return {
      status: "success",
      payload: { string: "hello", date: new Date() }
    } as Reply
  }
  @Mutation(() => Payload)
  async put() {
    return { status: "success" } as Reply
  }
  @Query(() => Payload)
  async subscribe() {
    return {
      status: "success",
      payload: { string: "hello", date: new Date() }
    } as Reply
  }
}

const QUERY = gql`
  query get {
    get {
      status
      payload {
        string
        date
      }
    }
  }
`
const startServer = async () => {
  const server = new ApolloServer({
    schema: await buildSchema({
      validate: false,
      resolvers: [TestResolver]
    })
  })
  return server
}

describe("apollo ssr client", () => {
  let server: ApolloServer
  beforeAll(async done => {
    server = await startServer()
    await server
      .listen()
      .then(({ url, subscriptionsUrl }) =>
        console.log(
          `🚀 test server istening on ${url}\r\n🚀 subscription server listening on ${subscriptionsUrl}`
        )
      )
    done()
  })
  test("can get", async done => {
    act(() => {
      const Test = withApollo(
        () => {
          const { data, loading } = useQuery(QUERY)
          return <div>{loading && data ? "loading" : JSON.stringify(data)}</div>
        },
        {
          httpUrl: "http://localhost:4000",
          wsUrl: "ws://localhost:4000/graphql",
          subscription: true
        }
      )
      const response = mount(<Test />)
      setTimeout(() => {
        expect(response.text()).toMatch(/success/)
        done()
      }, 1000)
    })
  })
  afterAll(() => server.stop())
})
