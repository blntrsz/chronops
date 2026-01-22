import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Actor } from "@chronops/domain";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Schema } from "effect";
import type React from "react";
import { authClient } from "./client";

const CreateOrgSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  slug: Actor.OrgSlug,
});

type CreateOrgInput = Schema.Schema.Type<typeof CreateOrgSchema>;

export function CreateOrg({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "" as Actor.OrgSlug,
    } satisfies CreateOrgInput,
    onSubmit: async ({ value }) => {
      const res = await authClient.organization.create({
        name: value.name.trim(),
        slug: value.slug.trim(),
      });

      const orgSlug = (res as { data?: { slug?: string } | null } | null)?.data?.slug;
      const nextSlug = orgSlug ?? value.slug.trim();

      await authClient.organization.setActive({
        organizationSlug: nextSlug,
      });

      form.reset();
      navigate({ to: "/org/$slug", params: { slug: nextSlug } });
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = Schema.validateEither(CreateOrgSchema)(value);
        if (result._tag === "Left") return result.left.message || "Invalid input";
        return undefined;
      },
    },
  });

  const isPending = form.state.isSubmitting;

  return (
    <div className={cn(className)} {...props}>
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardHeader>
            <CardTitle>Create organization</CardTitle>
            <CardDescription>Set org name and unique slug.</CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <form.Field name="name">
                {(field) => (
                  <Field data-disabled={isPending} data-invalid={!field.state.meta.isValid}>
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
                  <Field data-disabled={isPending} data-invalid={!field.state.meta.isValid}>
                    <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={() => {
                        field.handleBlur();
                      }}
                      onChange={(e) => {
                        field.handleChange(Actor.OrgSlug.make(e.target.value));
                      }}
                      placeholder="acme"
                      disabled={isPending}
                      required
                    />
                    <FieldDescription>Lowercase, numbers, hyphens.</FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <FieldError errors={form.state.errors} />
            </FieldGroup>
          </CardContent>

          <CardFooter className="mt-4 flex gap-2 flex-col">
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Creating…
                </>
              ) : (
                "Create"
              )}
            </Button>
            <Button className="w-full" variant="outline">
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
