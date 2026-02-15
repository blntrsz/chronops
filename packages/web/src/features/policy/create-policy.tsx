import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { createPolicy, listPolicies, policyReactiveKeys } from "@/features/policy/_atom";
import { listControls } from "@/features/control/_atom";
import { cn } from "@/lib/utils";
import { Control, Policy } from "@chronops/domain";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Schema } from "effect";
import React from "react";

const CreatePolicySchema = Policy.CreatePolicy;

type CreatePolicyInput = Schema.Schema.Type<typeof CreatePolicySchema>;

const listRefreshAtom = listPolicies(1);
const reviewOptions = ["daily", "weekly", "monthly", "quarterly", "semiannual", "annual"] as const;

function CreatePolicyForm() {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createPolicy(), { mode: "promise" });
  const refreshList = useAtomRefresh(listRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const controls = useAtomValue(listControls(1));
  const controlOptions = Result.getOrElse(controls, () => ({ data: [] as any[] })).data;

  const [values, setValues] = React.useState<CreatePolicyInput>({
    title: "",
    description: null,
    version: null,
    effectiveAt: null,
    reviewDueAt: null,
    reviewFrequency: null,
    ownerId: null,
    controlId: null,
  });

  const [selectedControlId, setSelectedControlId] = React.useState<Control.ControlId | null>(null);

  const parseControlId = React.useCallback((value: unknown) => {
    if (typeof value !== "string") return undefined;
    const result = Schema.decodeOption(Control.ControlId)(value);
    return result._tag === "Some" ? result.value : undefined;
  }, []);

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    e.stopPropagation();

    setFormError(null);

    const validation = Schema.validateEither(CreatePolicySchema)(values);
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
        reactivityKeys: policyReactiveKeys.all,
      });

      setActiveDialog(null);
      setValues({
        title: "",
        description: null,
        version: null,
        effectiveAt: null,
        reviewDueAt: null,
        reviewFrequency: null,
        ownerId: null,
        controlId: null,
      });
      setSelectedControlId(null);
      refreshList();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <ResponsiveDialogContent>
      <form onSubmit={onSubmit} className="flex flex-col">
        <ResponsiveDialogBody>
          <GhostInput
            id="title"
            name="title"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="Policy title"
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
              <span>version</span>
              <div className="rounded-md border bg-muted/10 px-2 py-1">
                <GhostInput
                  id="version"
                  name="version"
                  type="text"
                  value={values.version ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      version: e.target.value ? e.target.value : null,
                    }))
                  }
                  placeholder="1.0"
                  aria-label="Version"
                  className="w-20 text-sm text-foreground placeholder:text-muted-foreground/60"
                  disabled={pending}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span>review</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={pending}>
                  <button
                    type="button"
                    className="rounded-md border bg-muted/10 px-2 py-1 text-sm text-foreground"
                  >
                    {values.reviewFrequency ?? "Select"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup
                    value={values.reviewFrequency ?? "__none"}
                    onValueChange={(value) =>
                      setValues((v) => ({
                        ...v,
                        reviewFrequency:
                          value === "__none" ? null : (value as Policy.PolicyReviewFrequency),
                      }))
                    }
                  >
                    <DropdownMenuRadioItem value="__none">none</DropdownMenuRadioItem>
                    {reviewOptions.map((opt) => (
                      <DropdownMenuRadioItem key={opt} value={opt}>
                        {opt}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <span>control</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={pending}>
                  <button
                    type="button"
                    className="rounded-md border bg-muted/10 px-2 py-1 text-sm text-foreground"
                  >
                    {selectedControlId ? "Selected" : "Select"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {controlOptions.map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      checked={selectedControlId === c.id}
                      onCheckedChange={(checked) => {
                        const next = checked ? parseControlId(c.id) : undefined;
                        setSelectedControlId(next ?? null);
                        setValues((v) => ({
                          ...v,
                          controlId: (next ?? null) as Control.ControlId | null,
                        }));
                      }}
                    >
                      {c.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
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
        </ResponsiveDialogFooter>
      </form>
    </ResponsiveDialogContent>
  );
}

export function CreatePolicy({
  className,
  trigger,
  ...props
}: React.ComponentProps<"div"> & { trigger?: React.ReactNode }) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createPolicy";

  const triggerNode = trigger || <Button type="button">Create policy</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <ResponsiveDialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createPolicy" : null)}
      >
        {trigger && <ResponsiveDialogTrigger asChild>{triggerNode}</ResponsiveDialogTrigger>}
        <CreatePolicyForm />
      </ResponsiveDialog>
    </div>
  );
}
