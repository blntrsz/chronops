import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { createQuestionerInstance, listQuestionerInstances } from "@/features/questioner/_atom";
import { cn } from "@/lib/utils";
import { QuestionerTemplate } from "@chronops/domain";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import React from "react";

type CreateInstanceInput = {
  templateId: QuestionerTemplate.QuestionerTemplateId;
  name: string;
};

function CreateInstanceForm({
  templateId,
}: {
  templateId: QuestionerTemplate.QuestionerTemplateId;
}) {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createQuestionerInstance(), { mode: "promise" });
  const refreshInstances = useAtomRefresh(listQuestionerInstances(1));

  const [pending, setPending] = React.useState(false);
  const [values, setValues] = React.useState<CreateInstanceInput>({
    templateId,
    name: "",
  });

  React.useEffect(() => {
    setValues((v) => ({
      ...v,
      templateId,
    }));
  }, [templateId]);

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!values.name.trim()) return;

    setPending(true);
    try {
      await mutate({
        payload: {
          templateId: values.templateId,
          name: values.name.trim(),
          responses: [],
        },
      });

      setActiveDialog(null);
      setValues((v) => ({ ...v, name: "" }));
      refreshInstances();
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
            placeholder="Questioner instance name"
            aria-label="Name"
            className="w-full text-3xl font-semibold leading-tight tracking-tight placeholder:text-muted-foreground/40"
            disabled={pending}
            required
            autoFocus
          />
        </div>

        <hr className="w-full" />

        <div className="flex flex-row items-center justify-end gap-3 px-6 py-4">
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
        </div>
      </form>
    </DialogContent>
  );
}

export function CreateQuestionerInstance({
  className,
  trigger,
  templateId,
  ...props
}: React.ComponentProps<"div"> & {
  trigger?: React.ReactNode;
  templateId: QuestionerTemplate.QuestionerTemplateId;
}) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createQuestionerInstance";
  const triggerNode = trigger || <Button type="button">Create instance</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createQuestionerInstance" : null)}
      >
        {trigger && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}
        <CreateInstanceForm templateId={templateId} />
      </Dialog>
    </div>
  );
}
