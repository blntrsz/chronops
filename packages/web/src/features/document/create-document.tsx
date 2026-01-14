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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { countDocuments, createDocument, listDocuments } from "@/features/document/_atom";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import { Document } from "@chronops/domain";
import { Schema } from "effect";
import React from "react";

const CreateDocumentSchema = Document.CreateDocument;

type CreateDocumentInput = Schema.Schema.Type<typeof CreateDocumentSchema>;

const listRefreshAtom = listDocuments(1);
const countRefreshAtom = countDocuments();

export function CreateDocument({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [open, setOpen] = React.useState(false);

  const mutate = useAtomSet(createDocument(), { mode: "promise" });
  const refreshList = useAtomRefresh(listRefreshAtom);
  const refreshCount = useAtomRefresh(countRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const [values, setValues] = React.useState<CreateDocumentInput>({
    name: "",
    type: "evidence",
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
          type: values.type,
          url: values.url.trim(),
          size: values.size,
          frameworkId: values.frameworkId,
          controlId: values.controlId,
        },
      });

      setOpen(false);
      setValues({
        name: "",
        type: "evidence",
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
    <div className={cn("flex", className)} {...props}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button">Create document</Button>
        </DialogTrigger>

        <DialogContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>Create document</DialogTitle>
              <DialogDescription>
                For now, provide a URL. S3 upload next.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field data-disabled={pending}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, name: e.target.value }))
                  }
                  placeholder="SOC2 evidence"
                  disabled={pending}
                  required
                />
              </Field>

              <Field data-disabled={pending}>
                <FieldLabel>Type</FieldLabel>
                <Select
                  value={values.type}
                  onValueChange={(value) =>
                    setValues((v) => ({
                      ...v,
                      type: value as CreateDocumentInput["type"],
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requirement">requirement</SelectItem>
                    <SelectItem value="evidence">evidence</SelectItem>
                    <SelectItem value="clause">clause</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field data-disabled={pending}>
                <FieldLabel htmlFor="url">URL</FieldLabel>
                <Input
                  id="url"
                  name="url"
                  value={values.url}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, url: e.target.value }))
                  }
                  placeholder="https://..."
                  disabled={pending}
                  required
                />
              </Field>

              <Field data-disabled={pending}>
                <FieldLabel htmlFor="size">Size (bytes)</FieldLabel>
                <Input
                  id="size"
                  name="size"
                  type="number"
                  value={values.size ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      size:
                        e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="12345"
                  disabled={pending}
                />
              </Field>

              <Field data-disabled={pending}>
                <FieldLabel htmlFor="frameworkId">Framework ID</FieldLabel>
                <Input
                  id="frameworkId"
                  name="frameworkId"
                  value={values.frameworkId ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      frameworkId: e.target.value === "" ? null : (e.target.value as any),
                    }))
                  }
                  placeholder="fwk_..."
                  disabled={pending}
                />
              </Field>

              <Field data-disabled={pending}>
                <FieldLabel htmlFor="controlId">Control ID</FieldLabel>
                <Input
                  id="controlId"
                  name="controlId"
                  value={values.controlId ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      controlId: e.target.value === "" ? null : (e.target.value as any),
                    }))
                  }
                  placeholder="ctrl_..."
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
      </Dialog>
    </div>
  );
}
