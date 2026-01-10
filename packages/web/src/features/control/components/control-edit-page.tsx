import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Control } from "@chronops/domain";

import { Page } from "@/components/page";
import { PageHeader } from "@/components/page-header";
import { ResultView } from "@/components/result-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { Spinner } from "@/components/ui/spinner";

import { formatDateTime } from "@/lib/format";
import {
  controlByIdQuery,
  controlRemoveMutation,
  controlUpdateMutation,
} from "@/features/control/atom";
import { frameworkListQuery } from "@/features/framework/atom";
import { ControlForm } from "@/features/control/components/control-form";
import {
  toCreateControlPayload,
  type ControlFormValue,
} from "@/features/control/components/control-form";

export function ControlEditPage({ controlId }: { controlId: string }) {
  const id = Control.ControlId.make(controlId);

  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [pendingSave, setPendingSave] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState(false);

  const controlResult = useAtomValue(controlByIdQuery(id));
  const frameworksResult = useAtomValue(frameworkListQuery(0));

  console.log({ controlResult });

  const updateControl = useAtomSet(controlUpdateMutation, { mode: "promise" });
  const removeControl = useAtomSet(controlRemoveMutation, { mode: "promise" });

  const frameworks =
    frameworksResult._tag === "Success" ? frameworksResult.value : [];

  const [form, setForm] = React.useState<ControlFormValue>({
    name: "",
    description: "",
    frameworkId: "",
    status: "draft",
    testingFrequency: "",
  });

  React.useEffect(() => {
    if (controlResult._tag !== "Success") return;
    const maybe = controlResult.value;
    if (maybe._tag !== "Some") return;

    const ctrl = maybe.value;
    setForm({
      name: ctrl.name,
      description: ctrl.description ?? "",
      frameworkId: ctrl.frameworkId,
      status: ctrl.status,
      testingFrequency: ctrl.testingFrequency ?? "",
    });
  }, [controlResult]);

  const onSave = async () => {
    if (pendingSave) return;
    setPendingSave(true);
    try {
      await updateControl({
        payload: { id, data: toCreateControlPayload(form) },
        reactivityKeys: {
          list: ["control:list", 0],
          detail: ["control:detail", id],
          byFramework: ["control:byFramework", form.frameworkId],
        },
      });
    } finally {
      setPendingSave(false);
    }
  };

  const onDelete = async () => {
    if (pendingDelete) return;
    setPendingDelete(true);
    try {
      await removeControl({
        payload: { id },
        reactivityKeys: {
          list: ["control:list", 0],
          detail: ["control:detail", id],
        },
      });
      navigate({ to: "/org/$slug/control", params: { slug: "-" } });
    } finally {
      setPendingDelete(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Control"
        description={controlId}
        right={
          <Button asChild variant="outline">
            <Link to="/org/$slug/control" params={{ slug: "-" }}>
              Back
            </Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Review identity and base fields.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResultView result={controlResult}>
              {(maybe) =>
                maybe._tag === "Some" ? (
                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold">
                        {maybe.value.name}
                      </div>
                      <Badge variant="secondary">{maybe.value.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>ID: {maybe.value.id}</div>
                      <div>Framework: {maybe.value.frameworkId}</div>
                      <div>Workflow: {maybe.value.workflowId}</div>
                      <div>
                        Updated: {formatDateTime(maybe.value.updatedAt)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Not found</div>
                )
              }
            </ResultView>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit</CardTitle>
            <CardDescription>Update fields then save.</CardDescription>
          </CardHeader>
          <CardContent>
            <ControlForm
              value={form}
              onChange={setForm}
              frameworks={frameworks.map((fw) => ({
                id: fw.id,
                name: fw.name,
              }))}
            />

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" onClick={onSave} disabled={pendingSave}>
                {pendingSave ? (
                  <>
                    <Spinner />
                    Saving
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>

              <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete control?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This marks the control as deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={pendingDelete}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={pendingDelete}
                      onClick={onDelete}
                    >
                      {pendingDelete ? (
                        <>
                          <Spinner />
                          Deleting
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator className="my-6" />

            <div className="text-sm text-muted-foreground">
              Tip: documents can link to a control, but live under Documents.
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
