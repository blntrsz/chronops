import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { createIssue, issueReactiveKeys, listIssues } from "@/features/issue/_atom";
import { cn } from "@/lib/utils";
import { Control, Issue } from "@chronops/domain";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import { Schema } from "effect";
import React from "react";

const CreateIssueSchema = Issue.CreateIssue;

type CreateIssueInput = Schema.Schema.Type<typeof CreateIssueSchema>;

const typeOptions = ["issue", "finding"] as const;
const severityOptions = ["low", "medium", "high", "critical"] as const;

function CreateIssueForm({ controlId }: { controlId: Control.ControlId }) {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createIssue(), { mode: "promise" });
  const refreshList = useAtomRefresh(listIssues(1, controlId));

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const [values, setValues] = React.useState<CreateIssueInput>({
    title: "",
    description: null,
    type: "issue",
    severity: null,
    controlId,
    assessmentInstanceId: null,
    evidenceId: null,
    dueAt: null,
    resolvedAt: null,
  });

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    e.stopPropagation();

    setFormError(null);

    const validation = Schema.validateEither(CreateIssueSchema)(values);
    if (validation._tag === "Left") {
      setFormError(validation.left.message || "Invalid input");
      return;
    }

    setPending(true);
    try {
      await mutate({
        payload: {
          ...values,
          title: values.title.trim(),
        },
        reactivityKeys: issueReactiveKeys.all,
      });

      setActiveDialog(null);
      setValues({
        title: "",
        description: null,
        type: "issue",
        severity: null,
        controlId,
        assessmentInstanceId: null,
        evidenceId: null,
        dueAt: null,
        resolvedAt: null,
      });
      refreshList();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <DialogContent className="gap-0 p-0">
      <form onSubmit={onSubmit} className="flex flex-col">
        <div className="px-6 pt-6 pb-5">
          <GhostInput
            id="title"
            name="title"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="Issue title"
            aria-label="Title"
            className="w-full text-3xl font-semibold leading-tight tracking-tight placeholder:text-muted-foreground/40"
            disabled={pending}
            required
            autoFocus
          />

          <GhostTextArea
            id="description"
            name="description"
            value={values.description ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="Add description..."
            aria-label="Description"
            className="mt-3 w-full min-h-28 text-lg leading-relaxed placeholder:text-muted-foreground/40"
            disabled={pending}
          />

          {formError ? (
            <div role="alert" className="mt-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>type</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={pending}>
                  <button
                    type="button"
                    className="rounded-md border bg-muted/10 px-2 py-1 text-sm text-foreground"
                  >
                    {values.type}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup
                    value={values.type}
                    onValueChange={(value) =>
                      setValues((v) => ({ ...v, type: value as Issue.IssueType }))
                    }
                  >
                    {typeOptions.map((opt) => (
                      <DropdownMenuRadioItem key={opt} value={opt}>
                        {opt}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <span>severity</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={pending}>
                  <button
                    type="button"
                    className="rounded-md border bg-muted/10 px-2 py-1 text-sm text-foreground"
                  >
                    {values.severity ?? "Select"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup
                    value={values.severity ?? "__none"}
                    onValueChange={(value) =>
                      setValues((v) => ({
                        ...v,
                        severity: value === "__none" ? null : (value as Issue.IssueSeverity),
                      }))
                    }
                  >
                    <DropdownMenuRadioItem value="__none">none</DropdownMenuRadioItem>
                    {severityOptions.map((opt) => (
                      <DropdownMenuRadioItem key={opt} value={opt}>
                        {opt}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <hr className="w-full" />

        <div className="flex flex-row items-center justify-end gap-3 px-6 py-4">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function CreateIssue({
  className,
  trigger,
  controlId,
  ...props
}: React.ComponentProps<"div"> & {
  trigger?: React.ReactNode;
  controlId?: Control.ControlId;
}) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createIssue";
  const triggerNode = trigger || (
    <Button type="button" disabled={!controlId}>
      {controlId ? "Create issue" : "Select control"}
    </Button>
  );

  return (
    <div className={cn("flex", className)} {...props}>
      <Dialog open={open} onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createIssue" : null)}>
        {trigger ? (
          <DialogTrigger asChild>{triggerNode}</DialogTrigger>
        ) : (
          <DialogTrigger asChild disabled={!controlId}>
            {triggerNode}
          </DialogTrigger>
        )}
        {controlId ? <CreateIssueForm controlId={controlId} /> : null}
      </Dialog>
    </div>
  );
}
