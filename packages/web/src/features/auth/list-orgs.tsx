import { authClient } from "@chronops/core/auth/client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import React from "react";

export function ListOrgs({ className, ...props }: React.ComponentProps<"div">) {
  const orgs = authClient.useListOrganizations();
  const navigate = useNavigate();

  async function pickOrg(slug: string) {
    await authClient.organization.setActive({
      organizationSlug: slug,
    });
    navigate({ to: "/org/$slug", params: { slug } });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        {orgs.isPending ? (
          <FieldDescription>Loading…</FieldDescription>
        ) : orgs.error ? (
          <FieldDescription>Failed loading orgs</FieldDescription>
        ) : (orgs.data?.length ?? 0) === 0 ? (
          <FieldDescription>No orgs yet</FieldDescription>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {orgs.data!.map((org) => (
              <Card
                key={org.id}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => pickOrg(org.slug)}
              >
                <CardHeader>
                  <CardTitle>{org.name}</CardTitle>
                  <CardDescription>Select to switch</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </FieldGroup>
    </div>
  );
}
