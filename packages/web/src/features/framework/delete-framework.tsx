import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogAction,
  ResponsiveAlertDialogCancel,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
} from "@/components/ui/responsive-alert-dialog";
import { Button } from "@/components/ui/button";
import { countFrameworks, listFrameworks, removeFramework } from "@/features/framework/_atom";
import { cn } from "@/lib/utils";
import type { Framework } from "@chronops/domain";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import { useNavigate } from "@tanstack/react-router";
import React from "react";

const listRefreshAtom = listFrameworks(1);
const countRefreshAtom = countFrameworks();

export function DeleteFramework({
  frameworkId,
  slug,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  frameworkId: Framework.FrameworkId;
  slug: string;
}) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();
  const navigate = useNavigate();

  const mutate = useAtomSet(removeFramework(), { mode: "promise" });
  const refreshList = useAtomRefresh(listRefreshAtom);
  const refreshCount = useAtomRefresh(countRefreshAtom);

  const [pending, setPending] = React.useState(false);
  const open = activeDialog === "deleteFramework";

  async function onDelete() {
    setPending(true);
    try {
      await mutate({ payload: { id: frameworkId } });
      setActiveDialog(null);
      refreshList();
      refreshCount();
      navigate({ to: "/org/$slug/framework", params: { slug } });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("flex", className)} {...props}>
      <ResponsiveAlertDialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "deleteFramework" : null)}
      >
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <ResponsiveAlertDialogTitle>Delete framework</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              This removes framework and associated work. Irreversible.
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>
          <ResponsiveAlertDialogFooter>
            <ResponsiveAlertDialogCancel disabled={pending}>Cancel</ResponsiveAlertDialogCancel>
            <ResponsiveAlertDialogAction asChild>
              <Button variant="destructive" onClick={onDelete} disabled={pending}>
                Delete
              </Button>
            </ResponsiveAlertDialogAction>
          </ResponsiveAlertDialogFooter>
        </ResponsiveAlertDialogContent>
      </ResponsiveAlertDialog>
    </div>
  );
}
