import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import type { Comment } from "@chronops/domain";
import { DateTime } from "effect";
import React from "react";
import { createComment, listCommentsByTarget } from "./_atom";

const createdAtFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCreatedAt(value: unknown) {
  if (value == null) return "—";
  try {
    const dt = DateTime.isDateTime(value) ? value : DateTime.unsafeMake(value as never);
    return DateTime.formatIntl(dt, createdAtFormat);
  } catch {
    return String(value);
  }
}

export function CommentsSection({
  entityId,
  className,
  ...props
}: React.ComponentProps<"div"> & { entityId: Comment.CommentEntityId }) {
  const list = useAtomValue(listCommentsByTarget(entityId));
  const refresh = useAtomRefresh(listCommentsByTarget(entityId));
  const mutate = useAtomSet(createComment(), { mode: "promise" });

  const [body, setBody] = React.useState("");
  const [posting, setPosting] = React.useState(false);

  const canPost = !posting && body.trim() !== "";

  async function onPost() {
    if (!canPost) return;
    setPosting(true);
    try {
      const nextBody = body.trim();
      await mutate({
        payload: {
          entityId,
          body: nextBody,
        },
      });
      setBody("");
      refresh();
    } finally {
      setPosting(false);
    }
  }

  const data = Result.getOrElse(list, () => []);

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <div className="flex flex-col gap-4">
          <div className="text-lg font-semibold">Comments</div>
          <div className="flex flex-col gap-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment"
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="button" onClick={onPost} disabled={!canPost}>
                {posting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {list._tag === "Initial" ? (
        <FieldDescription>Loading comments...</FieldDescription>
      ) : Result.isFailure(list) ? (
        <FieldDescription>Failed loading comments</FieldDescription>
      ) : data.length === 0 ? (
        <FieldDescription>No comments yet</FieldDescription>
      ) : (
        <div className="bg-card text-card-foreground rounded-xl border p-6">
          <div className="flex flex-col gap-4">
            <div className="text-sm font-semibold">Thread</div>
            <Separator />
            <div className="flex flex-col gap-4">
              {data.map((c, idx) => (
                <div key={c.id} className="flex flex-col gap-2">
                  <div className="text-muted-foreground text-xs">
                    {formatCreatedAt(c.createdAt)} · {c.createdBy}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{c.body}</div>
                  {idx === data.length - 1 ? null : <Separator />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
