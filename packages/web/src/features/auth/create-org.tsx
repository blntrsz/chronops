import { authClient } from "@chronops/core/auth/client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Schema } from "effect";
import React from "react";

const CreateOrgSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  slug: Schema.String.pipe(
    Schema.minLength(1),
    Schema.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  ),
});

type CreateOrgInput = Schema.Schema.Type<typeof CreateOrgSchema>;

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateOrg({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    } satisfies CreateOrgInput,
    onSubmit: async ({ value }) => {
      const res = await authClient.organization.create({
        name: value.name.trim(),
        slug: value.slug.trim(),
      });

      const orgSlug = (res as { data?: { slug?: string } | null } | null)?.data
        ?.slug;
      const nextSlug = orgSlug ?? value.slug.trim();

      await authClient.organization.setActive({
        organizationSlug: nextSlug,
      });

      setOpen(false);
      setSlugTouched(false);
      form.reset();
      navigate({ to: "/org/$slug", params: { slug: nextSlug } });
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = Schema.validateEither(CreateOrgSchema)(value);
        if (result._tag === "Left")
          return result.left.message || "Invalid input";
        return undefined;
      },
    },
  });

  const isPending = form.state.isSubmitting;

  const name = form.state.values.name;

  React.useEffect(() => {
    if (slugTouched) return;
    form.setFieldValue("slug", slugify(name));
  }, [name, slugTouched, form]);

  return (
    <div className={cn("flex", className)} {...props}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button">Create org</Button>
        </DialogTrigger>

        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col gap-6"
          >
            <DialogHeader>
              <DialogTitle>Create organization</DialogTitle>
              <DialogDescription>
                Set org name and unique slug.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <form.Field name="name">
                {(field) => (
                  <Field
                    data-disabled={isPending}
                    data-invalid={!field.state.meta.isValid}
                  >
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Acme"
                      disabled={isPending}
                      required
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="slug">
                {(field) => (
                  <Field
                    data-disabled={isPending}
                    data-invalid={!field.state.meta.isValid}
                  >
                    <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={() => {
                        setSlugTouched(true);
                        field.handleBlur();
                      }}
                      onChange={(e) => {
                        setSlugTouched(true);
                        field.handleChange(e.target.value);
                      }}
                      placeholder="acme"
                      disabled={isPending}
                      required
                    />
                    <FieldDescription>
                      Lowercase, numbers, hyphens.
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <FieldError errors={form.state.errors} />
            </FieldGroup>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className="mr-2" />
                    Creating…
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
