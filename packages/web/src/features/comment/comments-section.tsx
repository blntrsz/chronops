import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import type { Comment } from "@chronops/domain";
import { DateTime } from "effect";
import { ArrowUp, Paperclip } from "lucide-react";
import React from "react";
import { createComment, listCommentsByTarget } from "./_atom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function formatCreatedAtRelative(value: unknown) {
  if (value == null) return "—";
  try {
    const dt = DateTime.isDateTime(value) ? value : DateTime.unsafeMake(value as never);
    const deltaMs = Date.now() - DateTime.toEpochMillis(dt);

    const abs = Math.abs(deltaMs);
    const minutes = Math.round(abs / 60_000);
    const hours = Math.round(abs / 3_600_000);
    const days = Math.round(abs / 86_400_000);

    const sign = deltaMs < 0 ? 1 : -1;
    if (minutes < 60) return rtf.format(sign * Math.max(1, minutes), "minute");
    if (hours < 48) return rtf.format(sign * hours, "hour");
    if (days < 14) return rtf.format(sign * days, "day");

    return formatCreatedAt(value);
  } catch {
    return formatCreatedAt(value);
  }
}

function initials(value: unknown) {
  const s = String(value ?? "").trim();
  if (s === "") return "?";
  const parts = s.split(/\s+/g).filter(Boolean);
  const a = parts[0]?.[0] ?? s[0];
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : s[1];
  return (a + (b ?? "")).toUpperCase();
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

  const result = Result.getOrElse(list, () => ({
    data: [] as readonly Comment.Comment[],
    total: 0,
    page: 1,
    size: 10,
  }));
  const data = result.data;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold tracking-tight">Activity</div>
      </div>

      <div className="relative">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment..."
          rows={4}
          className={cn(
            "min-h-28 rounded-xl bg-muted/30 px-4 py-4",
            "pr-20 pb-12",
            "focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" aria-label="Attach file" disabled>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={onPost}
            disabled={!canPost}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {list._tag === "Initial" ? (
        <FieldDescription>Loading comments...</FieldDescription>
      ) : Result.isFailure(list) ? (
        <FieldDescription>Failed loading comments</FieldDescription>
      ) : data.length === 0 ? (
        <FieldDescription>No comments yet</FieldDescription>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((c: Comment.Comment) => (
            <div key={c.id} className="bg-card text-card-foreground rounded-xl border p-5">
              <div className="flex items-start gap-3">
                <Avatar className="mt-0.5 size-7">
                  <AvatarFallback className="text-[10px] font-semibold">
                    {initials(c.createdBy)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="truncate text-sm font-medium">{c.createdBy}</div>
                    <div className="text-muted-foreground text-xs">
                      {formatCreatedAtRelative(c.createdAt)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm whitespace-pre-wrap">{c.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
