import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import {
  countFrameworks,
  listFrameworks,
  removeFramework,
} from "@/features/framework/_atom";
import { cn } from "@/lib/utils";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { Framework } from "@chronops/domain";
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
      <AlertDialog open={open} onOpenChange={(isOpen) => setActiveDialog(isOpen ? "deleteFramework" : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete framework</AlertDialogTitle>
            <AlertDialogDescription>
              This removes framework and associated work. Irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={onDelete} disabled={pending}>
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
