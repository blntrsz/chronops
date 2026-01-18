import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { countControls, createControl, listControls } from "@/features/control/_atom";
import { cn } from "@/lib/utils";
import { Control } from "@chronops/domain";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import { Schema } from "effect";
import React from "react";

const CreateControlSchema = Control.CreateControl;

type CreateControlInput = Schema.Schema.Type<typeof CreateControlSchema>;

const listRefreshAtom = listControls(1);
const countRefreshAtom = countControls();

function CreateControlForm() {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createControl(), { mode: "promise" });
  const refreshList = useAtomRefresh(listRefreshAtom);
  const refreshCount = useAtomRefresh(countRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const [values, setValues] = React.useState<CreateControlInput>({
    name: "",
    description: null,
    frameworkId: "" as any,
    status: "draft",
    testingFrequency: null,
  });

  async function onSubmit(e: React.FormEvent) {
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
          frameworkId: values.frameworkId as any,
          status: values.status,
          testingFrequency: values.testingFrequency,
        },
      });

      setActiveDialog(null);
      setValues({
        name: "",
        description: null,
        frameworkId: "" as any,
        status: "draft",
        testingFrequency: null,
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
    <DialogContent>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle>Create control</DialogTitle>
          <DialogDescription>
            Define a security control with framework association.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field data-disabled={pending}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <GhostInput
              id="name"
              name="name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="Password policy"
              disabled={pending}
              required
            />
          </Field>

          <Field data-disabled={pending}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
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
              placeholder="Control requirements..."
              disabled={pending}
            />
          </Field>

          <Field data-disabled={pending}>
            <FieldLabel htmlFor="frameworkId">Framework ID</FieldLabel>
            <Input
              id="frameworkId"
              name="frameworkId"
              value={values.frameworkId}
              onChange={(e) =>
                setValues((v) => ({ ...v, frameworkId: e.target.value as any }) as any)
              }
              placeholder="fwk_..."
              disabled={pending}
              required
            />
          </Field>

          <Field data-disabled={pending}>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={values.status}
              onValueChange={(value) =>
                setValues((v) => ({
                  ...v,
                  status: value as CreateControlInput["status"],
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">draft</SelectItem>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="deprecated">deprecated</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field data-disabled={pending}>
            <FieldLabel htmlFor="testingFrequency">Testing frequency</FieldLabel>
            <Input
              id="testingFrequency"
              name="testingFrequency"
              value={values.testingFrequency ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  testingFrequency: e.target.value,
                }))
              }
              placeholder="quarterly"
              disabled={pending}
            />
          </Field>

          {formError ? <FieldError>{formError}</FieldError> : null}
        </FieldGroup>

        <DialogFooter>
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
        </DialogFooter>
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
