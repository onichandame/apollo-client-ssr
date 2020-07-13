import { Field, Resolver, Query, Mutation, ObjectType } from "type-graphql"

@ObjectType()
export class Reply {
  @Field({ nullable: false })
  status!: "success" | "failed"
  @Field({ nullable: true })
  message?: string
}

@Resolver(() => Reply)
export class TestResolver {
  @Query(() => Reply)
  async get() {
    return { status: "success", message: "hello" } as Reply
  }
  @Mutation(() => Boolean)
  async put() {
    return { status: "success" } as Reply
  }
}
