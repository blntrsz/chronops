import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Spinner } from "@/components/ui/spinner";
import { createAssessmentInstance, listAssessmentInstances } from "@/features/assessment/_atom";
import { cn } from "@/lib/utils";
import { AssessmentTemplate, Control } from "@chronops/domain";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import React from "react";

type CreateInstanceInput = {
  templateId: AssessmentTemplate.AssessmentTemplateId;
  controlId: Control.ControlId;
  name: string;
  dueDate: null;
};

function CreateInstanceForm({
  templateId,
  controlId,
}: {
  templateId: AssessmentTemplate.AssessmentTemplateId;
  controlId: Control.ControlId;
}) {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createAssessmentInstance(), { mode: "promise" });
  const refreshInstances = useAtomRefresh(listAssessmentInstances(1));

  const [pending, setPending] = React.useState(false);
  const [values, setValues] = React.useState<CreateInstanceInput>({
    templateId,
    controlId,
    name: "",
    dueDate: null,
  });

  React.useEffect(() => {
    setValues((v) => ({
      ...v,
      templateId,
      controlId,
    }));
  }, [controlId, templateId]);

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!values.name.trim()) return;

    setPending(true);
    try {
      await mutate({
        payload: {
          templateId: values.templateId,
          controlId: values.controlId,
          name: values.name.trim(),
          dueDate: null,
        },
      });

      setActiveDialog(null);
      setValues((v) => ({ ...v, name: "", dueDate: null }));
      refreshInstances();
    } finally {
      setPending(false);
    }
  }

  return (
    <ResponsiveDialogContent>
      <form onSubmit={onSubmit} className="flex flex-col">
        <ResponsiveDialogBody>
          <GhostInput
            id="name"
            name="name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="Assessment instance name"
            aria-label="Name"
            className="w-full text-3xl font-semibold leading-tight tracking-tight placeholder:text-muted-foreground/40"
            disabled={pending}
            required
            autoFocus
          />
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button type="submit" disabled={pending || !values.name.trim()}>
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

export function CreateAssessmentInstance({
  className,
  trigger,
  templateId,
  controlId,
  ...props
}: React.ComponentProps<"div"> & {
  trigger?: React.ReactNode;
  templateId: AssessmentTemplate.AssessmentTemplateId;
  controlId: Control.ControlId;
}) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createAssessmentInstance";

  const triggerNode = trigger || <Button type="button">Create instance</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <ResponsiveDialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createAssessmentInstance" : null)}
      >
        {trigger && <ResponsiveDialogTrigger asChild>{triggerNode}</ResponsiveDialogTrigger>}
        <CreateInstanceForm templateId={templateId} controlId={controlId} />
      </ResponsiveDialog>
    </div>
  );
}
