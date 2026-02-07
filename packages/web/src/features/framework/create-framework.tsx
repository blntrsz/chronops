import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
    version: null,
    description: "",
  });

  async function onSubmit(e: React.SubmitEvent) {
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
      setValues({ name: "", version: null, description: "" });

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
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                name: e.target.value,
              }))
            }
            placeholder="Framework name"
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

          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <span>version</span>
            <div className="rounded-md border bg-muted/10 px-2 py-1">
              <GhostInput
                id="version"
                name="version"
                type="text"
                value={values.version ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    version: e.target.value ? Framework.SemVer.make(e.target.value) : null,
                  }))
                }
                placeholder="1.0.0"
                aria-label="Version"
                className="w-20 text-sm text-foreground placeholder:text-muted-foreground/60"
                disabled={pending}
              />
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
