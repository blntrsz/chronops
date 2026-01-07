// @ts-nocheck
import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAtomSet, useAtomValue } from '@effect-atom/atom-react'
import { Framework } from '@chronops/domain'

import { Page } from '@/components/Page'
import { PageHeader } from '@/components/PageHeader'
import { ResultView } from '@/components/ResultView'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'

import { formatDateTime } from '@/lib/format'
import { controlsByFrameworkQuery } from '@/features/control/atom/control'
import { ControlListInline } from '@/features/control/components/ControlListInline'
import {
  frameworkByIdQuery,
  frameworkRemoveMutation,
  frameworkUpdateMutation,
} from '@/features/framework/atom/framework'
import {
  FrameworkForm,
  toCreateFrameworkPayload,
  type FrameworkFormValue,
} from '@/features/framework/components/FrameworkForm'

export function FrameworkEditPage({ frameworkId }: { frameworkId: string }) {
  const id = Framework.FrameworkId.make(frameworkId)

  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [pendingSave, setPendingSave] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState(false)

  const frameworkResult = useAtomValue(frameworkByIdQuery(id))
  const controlsResult = useAtomValue(controlsByFrameworkQuery(id))

  const updateFramework = useAtomSet(frameworkUpdateMutation, { mode: 'promise' })
  const removeFramework = useAtomSet(frameworkRemoveMutation, { mode: 'promise' })

  const [form, setForm] = React.useState<FrameworkFormValue>({
    name: '',
    description: '',
    version: '',
    sourceUrl: '',
  })

  React.useEffect(() => {
    if (frameworkResult._tag !== 'Success') return
    const fw = frameworkResult.value
    if (fw._tag !== 'Some') return

    setForm({
      name: fw.value.name,
      description: fw.value.description ?? '',
      version: fw.value.version ?? '',
      sourceUrl: fw.value.sourceUrl ?? '',
    })
  }, [frameworkResult])

  const onSave = async () => {
    if (pendingSave) return
    setPendingSave(true)
    try {
      await updateFramework({
        payload: { id, data: toCreateFrameworkPayload(form) },
        reactivityKeys: {
          list: ['framework:list', 0],
          detail: ['framework:detail', id],
        },
      })
    } finally {
      setPendingSave(false)
    }
  }

  const onDelete = async () => {
    if (pendingDelete) return
    setPendingDelete(true)
    try {
      await removeFramework({
        payload: id,
        reactivityKeys: {
          list: ['framework:list', 0],
          detail: ['framework:detail', id],
        },
      })
      navigate({ to: '/frameworks' })
    } finally {
      setPendingDelete(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Page>
      <PageHeader
        title="Framework"
        description={frameworkId}
        right={
          <Button asChild variant="outline">
            <Link to="/frameworks">Back</Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Review base fields and identity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResultView result={frameworkResult}>
              {(maybe) =>
                maybe._tag === 'Some' ? (
                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold">{maybe.value.name}</div>
                      <Badge variant="secondary">framework</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>ID: {maybe.value.id}</div>
                      <div>Workflow: {maybe.value.workflowId}</div>
                      <div>Updated: {formatDateTime(maybe.value.updatedAt)}</div>
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
            <FrameworkForm value={form} onChange={setForm} />

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" onClick={onSave} disabled={pendingSave}>
                {pendingSave ? (
                  <>
                    <Spinner />
                    Saving
                  </>
                ) : (
                  'Save changes'
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
                    <AlertDialogTitle>Delete framework?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This marks the framework as deleted. Controls stay but lose linkage.
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
                        'Delete'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <ControlListInline
          title="Controls"
          description="Controls linked to this framework."
          listResult={controlsResult}
        />
      </div>
    </Page>
  )
}
