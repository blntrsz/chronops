import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { countDocuments, createDocument, listDocuments } from "@/features/document/_atom";
import { cn } from "@/lib/utils";
import { Document } from "@chronops/domain";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import { Schema } from "effect";
import React from "react";

const CreateDocumentSchema = Document.CreateDocument;

type CreateDocumentInput = Schema.Schema.Type<typeof CreateDocumentSchema>;

const listRefreshAtom = listDocuments(1);
const countRefreshAtom = countDocuments();

function CreateDocumentForm() {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createDocument(), { mode: "promise" });
  const refreshList = useAtomRefresh(listRefreshAtom);
  const refreshCount = useAtomRefresh(countRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const [values, setValues] = React.useState<CreateDocumentInput>({
    name: "",
    url: "",
    size: null,
    frameworkId: null,
    controlId: null,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    setFormError(null);

    const validation = Schema.validateEither(CreateDocumentSchema)(values);
    if (validation._tag === "Left") {
      setFormError(validation.left.message || "Invalid input");
      return;
    }

    setPending(true);
    try {
      await mutate({
        payload: {
          name: values.name.trim(),
          url: values.url.trim(),
          size: values.size,
          frameworkId: values.frameworkId,
          controlId: values.controlId,
        },
      });

      setActiveDialog(null);
      setValues({
        name: "",
        url: "",
        size: null,
        frameworkId: null,
        controlId: null,
      });
      refreshList();
      refreshCount();
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
            placeholder="Document name"
            aria-label="Name"
            className="w-full text-3xl font-semibold leading-tight tracking-tight placeholder:text-muted-foreground/40"
            disabled={pending}
            required
            autoFocus
          />

          <div
            className={cn(
              "mt-4 rounded-lg border border-dashed bg-muted/10 px-4 py-10 text-center",
              pending && "opacity-60",
            )}
          >
            <div className="text-base font-medium">Drop file</div>
            <div className="mt-1 text-sm text-muted-foreground">Upload not wired yet</div>
          </div>

          {formError ? (
            <div role="alert" className="mt-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}
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

export function CreateDocument({
  className,
  trigger,
  ...props
}: React.ComponentProps<"div"> & {
  trigger?: React.ReactNode;
}) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createDocument";

  const triggerNode = trigger || <Button type="button">Create document</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createDocument" : null)}
      >
        {trigger && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}

        <CreateDocumentForm />
      </Dialog>
    </div>
  );
}
