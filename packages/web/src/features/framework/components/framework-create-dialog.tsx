import * as React from 'react'
import { useAtomSet } from '@effect-atom/atom-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

import { frameworkCreateMutation } from '@/features/framework/atom/framework'
import {
  FrameworkForm,
  toCreateFrameworkPayload,
  type FrameworkFormValue,
} from '@/features/framework/components/framework-form'

export function FrameworkCreateDialog({
  onCreated,
}: {
  onCreated: (frameworkId: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<FrameworkFormValue>({
    name: '',
    description: '',
    version: '',
    sourceUrl: '',
  })
  const [pending, setPending] = React.useState(false)

  const createFramework = useAtomSet(frameworkCreateMutation, { mode: 'promise' })

  const canSubmit = form.name.trim().length > 0

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit || pending) return

    setPending(true)
    try {
      const created = await createFramework({
        payload: toCreateFrameworkPayload(form),
        reactivityKeys: { list: ['framework:list', 0] },
      })
      setOpen(false)
      setForm({ name: '', description: '', version: '', sourceUrl: '' })
      onCreated(created.id)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" onClick={() => setOpen(true)}>
        New framework
      </Button>

      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Create framework</DialogTitle>
            <DialogDescription>
              Add a framework, then attach controls and evidence.
            </DialogDescription>
          </DialogHeader>

          <FrameworkForm value={form} onChange={setForm} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || pending}>
              {pending ? (
                <>
                  <Spinner />
                  Creating
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
