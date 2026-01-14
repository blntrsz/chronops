import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { CreateOrg } from "@/features/auth/create-org";
import { authMiddleware } from "@/features/auth/middleware";
import { createFileRoute } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";

export const Route = createFileRoute("/org/create")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Chronops</span>
            </a>
            <h1 className="text-xl font-bold">Create organization</h1>
            <FieldDescription>
              Create an org to start using the app.
            </FieldDescription>
          </div>

          <CreateOrg />
        </div>
      </div>
    </div>
  );
}
