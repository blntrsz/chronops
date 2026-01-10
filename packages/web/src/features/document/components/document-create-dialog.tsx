import * as React from "react";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

import { documentCreateMutation } from "@/features/document/atom";
import { controlListQuery } from "@/features/control/atom";
import { frameworkListQuery } from "@/features/framework/atom";
import {
  DocumentForm,
  toCreateDocumentPayload,
  type DocumentFormValue,
} from "@/features/document/components/document-form";

export function DocumentCreateDialog({
  onCreated,
}: {
  onCreated: (documentId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const frameworksResult = useAtomValue(frameworkListQuery(0));
  const frameworks =
    frameworksResult._tag === "Success" ? frameworksResult.value : [];

  const [form, setForm] = React.useState<DocumentFormValue>({
    name: "",
    type: "evidence",
    url: "",
    size: "",
    frameworkId: "",
    controlId: "",
  });

  const controlsResult = useAtomValue(controlListQuery(0));

  const controls =
    form.frameworkId && controlsResult._tag === "Success"
      ? controlsResult.value.filter((c) => c.frameworkId === form.frameworkId)
      : [];

  const createDocument = useAtomSet(documentCreateMutation, {
    mode: "promise",
  });

  const canSubmit = form.name.trim().length > 0 && form.url.trim().length > 0;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || pending) return;

    setPending(true);
    try {
      const created = await createDocument({
        payload: toCreateDocumentPayload(form),
        reactivityKeys: {
          list: ["document:list", 0],
        },
      });
      setOpen(false);
      setForm({
        name: "",
        type: "evidence",
        url: "",
        size: "",
        frameworkId: "",
        controlId: "",
      });
      onCreated(created.id);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" onClick={() => setOpen(true)}>
        New document
      </Button>

      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Create document</DialogTitle>
            <DialogDescription>
              Add evidence, clauses, or requirements. Link to a control.
            </DialogDescription>
          </DialogHeader>

          <DocumentForm
            value={form}
            onChange={setForm}
            frameworks={frameworks.map((fw) => ({ id: fw.id, name: fw.name }))}
            controls={controls.map((c) => ({ id: c.id, name: c.name }))}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || pending}>
              {pending ? (
                <>
                  <Spinner />
                  Creating
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
