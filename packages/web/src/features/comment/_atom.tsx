import { Client } from "@/lib/rpc-client";
import type { Comment } from "@chronops/domain";

export const commentReactiveKeys = {
  all: ["comment"],
  target: (entityId: Comment.CommentEntityId) => [...commentReactiveKeys.all, "target", entityId],
} as const;

export const listCommentsByTarget = (entityId: Comment.CommentEntityId, page = 1) =>
  Client.query(
    "CommentList",
    {
      page,
      size: 100,
      entityId,
    },
    {
      reactivityKeys: commentReactiveKeys.target(entityId),
    },
  );

export const createComment = () => Client.mutation("CommentCreate");
