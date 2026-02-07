import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { createAssessmentTemplate, listAssessmentTemplates } from "@/features/assessment/_atom";
import { listControls } from "@/features/control/_atom";
import { cn } from "@/lib/utils";
import { Control } from "@chronops/domain";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Schema } from "effect";
import React from "react";

const CreateTemplateSchema = Schema.Struct({
  controlId: Control.ControlId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
});

type CreateTemplateInput = Schema.Schema.Type<typeof CreateTemplateSchema>;

const listRefreshAtom = listAssessmentTemplates(1);

function CreateTemplateForm({ controlId }: { controlId?: Control.ControlId }) {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createAssessmentTemplate(), { mode: "promise" });
  const refreshTemplates = useAtomRefresh(listRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const controls = useAtomValue(listControls(1));
  const controlOptions = Result.getOrElse(controls, () => ({ data: [] as any[] })).data;

  const [values, setValues] = React.useState<CreateTemplateInput>({
    controlId: (controlId ?? ("" as Control.ControlId)) as Control.ControlId,
    name: "",
    description: null,
  });

  const [selectedControlId, setSelectedControlId] = React.useState<Control.ControlId | null>(
    controlId ?? null,
  );

  React.useEffect(() => {
    if (!controlId) return;
    setSelectedControlId(controlId);
    setValues((v) => ({ ...v, controlId }));
  }, [controlId]);

  const parseControlId = React.useCallback((value: unknown) => {
    if (typeof value !== "string") return undefined;
    const result = Schema.decodeOption(Control.ControlId)(value);
    return result._tag === "Some" ? result.value : undefined;
  }, []);

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    e.stopPropagation();

    setFormError(null);

    const validation = Schema.validateEither(CreateTemplateSchema)(values);
    if (validation._tag === "Left") {
      setFormError(validation.left.message || "Invalid input");
      return;
    }

    setPending(true);
    try {
      await mutate({
        payload: {
          controlId: values.controlId,
          name: values.name.trim(),
          description: values.description,
        },
      });

      setActiveDialog(null);
      setValues({ controlId: values.controlId, name: "", description: null });
      refreshTemplates();
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
            placeholder="Assessment name"
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
                          controlId: (next ?? ("" as Control.ControlId)) as Control.ControlId,
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
        </div>

        <hr className="w-full" />

        <div className="flex flex-row items-center justify-end gap-3 px-6 py-4">
          <Button type="submit" disabled={pending || !values.controlId}>
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

export function CreateAssessmentTemplate({
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

  const open = activeDialog === "createAssessmentTemplate";

  const triggerNode = trigger || <Button type="button">Create assessment</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createAssessmentTemplate" : null)}
      >
        {trigger && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}
        <CreateTemplateForm controlId={controlId} />
      </Dialog>
    </div>
  );
}
