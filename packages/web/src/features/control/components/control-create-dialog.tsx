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

import { frameworkListQuery } from "@/features/framework/atom";
import { controlCreateMutation } from "@/features/control/atom";
import {
  ControlForm,
  toCreateControlPayload,
  type ControlFormValue,
} from "@/features/control/components/control-form";

export function ControlCreateDialog({
  onCreated,
}: {
  onCreated: (controlId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const frameworksResult = useAtomValue(frameworkListQuery(0));
  const createControl = useAtomSet(controlCreateMutation, { mode: "promise" });

  const frameworks =
    frameworksResult._tag === "Success" ? frameworksResult.value : [];

  const [form, setForm] = React.useState<ControlFormValue>({
    name: "",
    description: "",
    frameworkId: "",
    status: "draft",
    testingFrequency: "",
  });

  const canSubmit =
    form.name.trim().length > 0 && form.frameworkId.trim().length > 0;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || pending) return;

    setPending(true);
    try {
      const created = await createControl({
        payload: toCreateControlPayload(form),
        reactivityKeys: {
          list: ["control:list", 0],
          byFramework: ["control:byFramework", form.frameworkId],
        },
      });
      setOpen(false);
      setForm({
        name: "",
        description: "",
        frameworkId: "",
        status: "draft",
        testingFrequency: "",
      });
      onCreated(created.id);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" onClick={() => setOpen(true)}>
        New control
      </Button>

      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Create control</DialogTitle>
            <DialogDescription>
              Controls are the units you test and attach evidence to.
            </DialogDescription>
          </DialogHeader>

          <ControlForm
            value={form}
            onChange={setForm}
            frameworks={frameworks.map((fw) => ({ id: fw.id, name: fw.name }))}
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
