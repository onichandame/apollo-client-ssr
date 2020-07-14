import {
  Root,
  Field,
  Resolver,
  Query,
  Mutation,
  Subscription,
  ObjectType,
  BuildSchemaOptions,
} from "type-graphql"
import { PubSub } from "apollo-server-express"

export const pubSub = new PubSub()

setInterval(() => pubSub.publish("greeting", new Date().toString()), 1000)

@ObjectType()
class Reply {
  @Field({ nullable: false })
  status!: "success" | "failed"
  @Field({ nullable: true })
  message?: string
}

@Resolver(() => Reply)
class TestQueryResolver {
  @Query(() => Reply)
  test(): Reply {
    return { status: "success", message: "hello" }
  }
}
@Resolver(() => Reply)
class TestMutationResolver {
  @Mutation(() => Reply)
  test(): Reply {
    return { status: "success", message: new Date().toString() }
  }
}
@Resolver(() => Reply)
class TestSubscriptionResolver {
  @Subscription({ topics: ["greeting"] })
  test(@Root() payload: string): Reply {
    return { status: "success", message: payload }
  }
}
export const TestResolvers = [
  TestQueryResolver,
  TestMutationResolver,
  TestSubscriptionResolver,
] as BuildSchemaOptions["resolvers"]
