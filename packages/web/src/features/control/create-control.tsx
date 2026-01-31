import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { createControl, listControls } from "@/features/control/_atom";
import { listFrameworks } from "@/features/framework/_atom";
import { cn } from "@/lib/utils";
import { Control, Framework } from "@chronops/domain";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { useRouterState, useSearch } from "@tanstack/react-router";
import { Schema } from "effect";
import React from "react";

const CreateControlSchema = Control.CreateControl;

type CreateControlInput = Schema.Schema.Type<typeof CreateControlSchema>;
type FrameworkId = Framework.FrameworkId;

const listRefreshAtom = listControls(1);
const frameworkListAtom = listFrameworks(1);

const testingFrequencyOptions = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;

function CreateControlForm() {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createControl(), { mode: "promise" });
  const refreshList = useAtomRefresh(listRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const frameworks = useAtomValue(frameworkListAtom);
  const frameworkOptions = Result.getOrElse(frameworks, () => ({ data: [] as any[] })).data;

  const location = useRouterState({ select: (s) => s.location });
  const search = useSearch({ strict: false });

  const [values, setValues] = React.useState<CreateControlInput>({
    name: "",
    description: null,
    frameworkId: "" as FrameworkId,
    testingFrequency: null,
  });

  const [selectedFrameworkIds, setSelectedFrameworkIds] = React.useState<FrameworkId[]>([]);

  const parseFrameworkId = React.useCallback((value: unknown) => {
    if (typeof value !== "string") return undefined;
    const result = Schema.decodeOption(Framework.FrameworkId)(value);
    return result._tag === "Some" ? result.value : undefined;
  }, []);

  React.useEffect(() => {
    const fwkId = parseFrameworkId(location.pathname.match(/\/framework\/(fwk_[^/]+)/)?.[1]);
    if (!fwkId) return;
    setValues((v) => ({ ...v, frameworkId: fwkId }));
    setSelectedFrameworkIds([fwkId]);
  }, [location.pathname, parseFrameworkId]);

  React.useEffect(() => {
    const fwkId = parseFrameworkId(
      typeof search === "object" && search && "frameworkId" in search
        ? (search as { frameworkId?: unknown }).frameworkId
        : undefined,
    );
    if (!fwkId) return;
    setValues((v) => ({ ...v, frameworkId: fwkId }));
    setSelectedFrameworkIds([fwkId]);
  }, [parseFrameworkId, search]);

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    e.stopPropagation();

    setFormError(null);

    const validation = Schema.validateEither(CreateControlSchema)(values);
    if (validation._tag === "Left") {
      setFormError(validation.left.message || "Invalid input");
      return;
    }

    setPending(true);
    try {
      await mutate({
        payload: {
          name: values.name.trim(),
          description: values.description,
          frameworkId: values.frameworkId,
          testingFrequency: values.testingFrequency,
        },
      });

      setActiveDialog(null);
      setValues({
        name: "",
        description: null,
        frameworkId: "" as FrameworkId,
        testingFrequency: null,
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
            id="name"
            name="name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="Control name"
            aria-label="Name"
            className="w-full text-3xl font-semibold leading-tight tracking-tight placeholder:text-muted-foreground/40"
            disabled={pending}
            required
            autoFocus
          />

          <GhostTextArea
            id="description"
            name="description"
            value={values.description ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                description: e.target.value,
              }))
            }
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
              <span>framework</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={pending}>
                  <button
                    type="button"
                    className="rounded-md border bg-muted/10 px-2 py-1 text-sm text-foreground"
                  >
                    {selectedFrameworkIds.length
                      ? `${selectedFrameworkIds.length} selected`
                      : "Select"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {frameworkOptions.map((f) => (
                    <DropdownMenuCheckboxItem
                      key={f.id}
                      checked={selectedFrameworkIds.includes(f.id)}
                      onCheckedChange={(checked) => {
                        setSelectedFrameworkIds((prev) => {
                          const next = checked
                            ? Array.from(new Set([...prev, f.id]))
                            : prev.filter((id) => id !== f.id);

                          setValues((v) => ({
                            ...v,
                            frameworkId: (next[0] ?? ("" as FrameworkId)) as FrameworkId,
                          }));

                          return next;
                        });
                      }}
                    >
                      {f.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <span>testing</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={pending}>
                  <button
                    type="button"
                    className="rounded-md border bg-muted/10 px-2 py-1 text-sm text-foreground"
                  >
                    {values.testingFrequency ?? "Select"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup
                    value={values.testingFrequency ?? "__none"}
                    onValueChange={(value) =>
                      setValues((v) => ({
                        ...v,
                        testingFrequency: value === "__none" ? null : value,
                      }))
                    }
                  >
                    <DropdownMenuRadioItem value="__none">none</DropdownMenuRadioItem>
                    {testingFrequencyOptions.map((opt) => (
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

export function CreateControl({
  className,
  trigger,
  ...props
}: React.ComponentProps<"div"> & {
  trigger?: React.ReactNode;
}) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createControl";

  const triggerNode = trigger || <Button type="button">Create control</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createControl" : null)}
      >
        {trigger && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}

        <CreateControlForm />
      </Dialog>
    </div>
  );
}
