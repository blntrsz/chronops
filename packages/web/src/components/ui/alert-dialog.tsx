import * as React from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type AlertDialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null)

export function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  const value = React.useMemo(
    () => ({ open, setOpen: onOpenChange }),
    [open, onOpenChange],
  )

  return (
    <AlertDialogContext.Provider value={value}>
      {children}
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogTrigger({ children }: { children: React.ReactElement }) {
  const ctx = React.useContext(AlertDialogContext)
  if (!ctx) throw new Error('AlertDialogTrigger must be inside AlertDialog')

  const child = children as React.ReactElement<any>
  const onClick = (event: React.MouseEvent) => {
    ;(child.props as any).onClick?.(event)
    if (!event.defaultPrevented) {
      ctx.setOpen(true)
    }
  }

  return React.cloneElement(child as any, { onClick } as any)
}

export function AlertDialogContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(AlertDialogContext)
  if (!ctx) throw new Error('AlertDialogContent must be inside AlertDialog')
  if (!ctx.open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:items-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2', className)} {...props} />
}

export function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

export function AlertDialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-lg font-semibold', className)} {...props} />
  )
}

export function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function AlertDialogCancel(props: React.ComponentProps<typeof Button>) {
  const ctx = React.useContext(AlertDialogContext)
  if (!ctx) throw new Error('AlertDialogCancel must be inside AlertDialog')

  return (
    <Button
      type="button"
      variant="outline"
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) {
          ctx.setOpen(false)
        }
      }}
    />
  )
}

export function AlertDialogAction(props: React.ComponentProps<typeof Button>) {
  return <Button type="button" {...props} />
}
