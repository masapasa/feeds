import type { AppRouter } from "@server/router/app.router";
import type { inferProcedureOutput } from "@trpc/server";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

export type TQuery = keyof AppRouter["_def"]["queries"];

export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<
  AppRouter["_def"]["queries"][TRouteKey]
>;

export type CommentWithChildren =
  InferQueryOutput<"comments.all-comments">[number];

export type SinglePost = InferQueryOutput<"posts.single-post">;

export type PostFromList = InferQueryOutput<"posts.all">["posts"][number];

export type FollowingPosts = InferQueryOutput<"posts.following">;
export type TagType = InferQueryOutput<"tags.all">[number];

export type SingleTagType = InferQueryOutput<"tags.single-tag">;

export type TagWithPosts = InferQueryOutput<"posts.by-tags">["tags"][number];

export type TaggedPosts =
  InferQueryOutput<"posts.by-tags">["tags"][number]["posts"][number];

export type User = InferQueryOutput<"users.single-user">;
export type UserLink = InferQueryOutput<"users.single-user">["url"];

export type FollowingUser =
  InferQueryOutput<"users.get-following">["following"][number]["following"];

export type Metadata = InferQueryOutput<"scraper.scrape-link">;
export type Poll = InferQueryOutput<"posts.single-post">["poll"];

export type Notification =
  InferQueryOutput<"notification.get-all">["list"][number];

// React-hook-form Controller's 'field' type
export type FieldType = ControllerRenderProps<FieldValues, string>;
