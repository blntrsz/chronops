import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Document } from "@chronops/domain";

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
import { controlListQuery } from "@/features/control/atom";
import { frameworkListQuery } from "@/features/framework/atom";
import {
  documentByIdQuery,
  documentRemoveMutation,
  documentUpdateMutation,
} from "@/features/document/atom";
import { DocumentForm } from "@/features/document/components/document-form";
import {
  toCreateDocumentPayload,
  type DocumentFormValue,
} from "@/features/document/components/document-form";

export function DocumentEditPage({ documentId }: { documentId: string }) {
  const id = Document.DocumentId.make(documentId);

  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [pendingSave, setPendingSave] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState(false);

  const docResult = useAtomValue(documentByIdQuery(id));
  const frameworksResult = useAtomValue(frameworkListQuery(0));

  const updateDocument = useAtomSet(documentUpdateMutation, {
    mode: "promise",
  });
  const removeDocument = useAtomSet(documentRemoveMutation, {
    mode: "promise",
  });

  const frameworks =
    frameworksResult._tag === "Success" ? frameworksResult.value : [];

  const [form, setForm] = React.useState<DocumentFormValue>({
    name: "",
    type: "evidence",
    url: "",
    size: "",
    frameworkId: "",
    controlId: "",
  });

  React.useEffect(() => {
    if (docResult._tag !== "Success") return;
    const maybe = docResult.value;
    if (maybe._tag !== "Some") return;

    const doc = maybe.value;
    setForm({
      name: doc.name,
      type: doc.type,
      url: doc.url,
      size: doc.size !== undefined ? String(doc.size) : "",
      frameworkId: doc.frameworkId ?? "",
      controlId: doc.controlId ?? "",
    });
  }, [docResult]);

  const controlsResult = useAtomValue(controlListQuery(0));

  const controls =
    form.frameworkId && controlsResult._tag === "Success"
      ? controlsResult.value.filter((c) => c.frameworkId === form.frameworkId)
      : [];

  const onSave = async () => {
    if (pendingSave) return;
    setPendingSave(true);
    try {
      await updateDocument({
        payload: { id, data: toCreateDocumentPayload(form) },
        reactivityKeys: {
          list: ["document:list", 0],
          detail: ["document:detail", id],
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
      await removeDocument({
        payload: { id },
        reactivityKeys: {
          list: ["document:list", 0],
          detail: ["document:detail", id],
        },
      });
      navigate({ to: "/org/$slug/document", params: { slug: "-" } });
    } finally {
      setPendingDelete(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Document"
        description={documentId}
        right={
          <Button asChild variant="outline">
            <Link to="/org/$slug/document" params={{ slug: "-" }}>
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
            <ResultView result={docResult}>
              {(maybe) =>
                maybe._tag === "Some" ? (
                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold">
                        {maybe.value.name}
                      </div>
                      <Badge variant="secondary">{maybe.value.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>ID: {maybe.value.id}</div>
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
            <DocumentForm
              value={form}
              onChange={setForm}
              frameworks={frameworks.map((fw) => ({
                id: fw.id,
                name: fw.name,
              }))}
              controls={controls.map((c) => ({ id: c.id, name: c.name }))}
            />

            <Separator className="my-6" />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                    <AlertDialogTitle>Delete document?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This marks the document as deleted.
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Link preview</CardTitle>
            <CardDescription>
              Quickly validate what this points to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div>
                Framework:{" "}
                <span className="font-mono">{form.frameworkId || "-"}</span>
              </div>
              <div>
                Control:{" "}
                <span className="font-mono">{form.controlId || "-"}</span>
              </div>
              <div>
                URL: <span className="font-mono">{form.url || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
