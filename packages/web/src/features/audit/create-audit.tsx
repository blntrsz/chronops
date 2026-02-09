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
import { createAudit, auditReactiveKeys, listAudits } from "@/features/audit/_atom";
import { listAssessmentTemplates } from "@/features/assessment/_atom";
import { cn } from "@/lib/utils";
import { AssessmentTemplate, Audit } from "@chronops/domain";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Schema } from "effect";
import React from "react";

const CreateAuditSchema = Audit.CreateAudit;

type CreateAuditInput = Schema.Schema.Type<typeof CreateAuditSchema>;

const listRefreshAtom = listAudits(1);

function CreateAuditForm() {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createAudit(), { mode: "promise" });
  const refreshList = useAtomRefresh(listRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const templates = useAtomValue(listAssessmentTemplates(1));
  const templateOptions = Result.getOrElse(templates, () => ({ data: [] as any[] })).data;

  const [values, setValues] = React.useState<CreateAuditInput>({
    name: "",
    description: null,
    scope: null,
    assessmentMethodId: "" as AssessmentTemplate.AssessmentTemplateId,
  });

  const [selectedTemplateId, setSelectedTemplateId] =
    React.useState<AssessmentTemplate.AssessmentTemplateId | null>(null);

  const parseTemplateId = React.useCallback((value: unknown) => {
    if (typeof value !== "string") return undefined;
    const result = Schema.decodeOption(AssessmentTemplate.AssessmentTemplateId)(value);
    return result._tag === "Some" ? result.value : undefined;
  }, []);

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    e.stopPropagation();

    setFormError(null);

    const validation = Schema.validateEither(CreateAuditSchema)(values);
    if (validation._tag === "Left") {
      setFormError(validation.left.message || "Invalid input");
      return;
    }

    setPending(true);
    try {
      await mutate({
        payload: {
          ...values,
          name: values.name.trim(),
        },
        reactivityKeys: auditReactiveKeys.all,
      });

      setActiveDialog(null);
      setValues({
        name: "",
        description: null,
        scope: null,
        assessmentMethodId: "" as AssessmentTemplate.AssessmentTemplateId,
      });
      setSelectedTemplateId(null);
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
            placeholder="Audit name"
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
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="Add description..."
            aria-label="Description"
            className="mt-3 w-full min-h-28 text-lg leading-relaxed placeholder:text-muted-foreground/40"
            disabled={pending}
          />

          <GhostTextArea
            id="scope"
            name="scope"
            value={values.scope ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, scope: e.target.value }))}
            placeholder="Scope"
            aria-label="Scope"
            className="mt-3 w-full min-h-20 text-sm leading-relaxed placeholder:text-muted-foreground/40"
            disabled={pending}
          />

          {formError ? (
            <div role="alert" className="mt-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>assessment</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={pending}>
                  <button
                    type="button"
                    className="rounded-md border bg-muted/10 px-2 py-1 text-sm text-foreground"
                  >
                    {selectedTemplateId ? "Selected" : "Select"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {templateOptions.map((t) => (
                    <DropdownMenuCheckboxItem
                      key={t.id}
                      checked={selectedTemplateId === t.id}
                      onCheckedChange={(checked) => {
                        const next = checked ? parseTemplateId(t.id) : undefined;
                        setSelectedTemplateId(next ?? null);
                        setValues((v) => ({
                          ...v,
                          assessmentMethodId: (next ??
                            ("" as AssessmentTemplate.AssessmentTemplateId)) as AssessmentTemplate.AssessmentTemplateId,
                        }));
                      }}
                    >
                      {t.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <hr className="w-full" />

        <div className="flex flex-row items-center justify-end gap-3 px-6 py-4">
          <Button type="submit" disabled={pending || !values.assessmentMethodId}>
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

export function CreateAudit({
  className,
  trigger,
  ...props
}: React.ComponentProps<"div"> & { trigger?: React.ReactNode }) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createAudit";

  const triggerNode = trigger || <Button type="button">Create audit</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <Dialog open={open} onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createAudit" : null)}>
        {trigger && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}
        <CreateAuditForm />
      </Dialog>
    </div>
  );
}
