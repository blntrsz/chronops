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
import { Spinner } from "@/components/ui/spinner";
import { countFrameworks, createFramework, listFrameworks } from "@/features/framework/_atom";
import { cn } from "@/lib/utils";
import { Framework } from "@chronops/domain";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import { Schema } from "effect";
import React from "react";

function CreateFrameworkForm() {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createFramework(), {
    mode: "promise",
  });
  const refreshList = useAtomRefresh(listRefreshAtom);
  const refreshCount = useAtomRefresh(countRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const [values, setValues] = React.useState<Framework.CreateFramework>({
    name: "",
    version: 0,
    description: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    setFormError(null);

    const validation = Schema.validateEither(Framework.CreateFramework)({
      name: values.name,
      version: values.version,
      description: values.description,
    });

    if (validation._tag === "Left") {
      setFormError(validation.left.message || "Invalid input");
      return;
    }

    setPending(true);
    try {
      await mutate({
        payload: {
          name: values.name.trim(),
          version: values.version,
          description: values.description,
        },
      });

      setActiveDialog(null);
      setValues({ name: "", version: 0, description: "" });

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
          <DialogTitle>Create framework</DialogTitle>
          <DialogDescription>Name, optional version/description.</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field data-disabled={pending}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <GhostInput
              id="name"
              name="name"
              value={values.name}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  name: e.target.value,
                }))
              }
              placeholder="React"
              disabled={pending}
              required
            />
          </Field>

          <Field data-disabled={pending}>
            <FieldLabel htmlFor="version">Version</FieldLabel>
            <GhostInput
              id="version"
              name="version"
              type="number"
              value={values.version ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  version: Number(e.target.value),
                }))
              }
              placeholder="19"
              disabled={pending}
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
              placeholder="UI framework"
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

export function CreateFramework({
  className,
  trigger,
  ...props
}: React.ComponentProps<"div"> & {
  trigger?: React.ReactNode;
}) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createFramework";

  const triggerNode = trigger || <Button type="button">Create framework</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createFramework" : null)}
      >
        {trigger && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}

        <CreateFrameworkForm />
      </Dialog>
    </div>
  );
}

const listRefreshAtom = listFrameworks(1);
const countRefreshAtom = countFrameworks();
