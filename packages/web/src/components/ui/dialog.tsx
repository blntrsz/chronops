import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export function Dialog({
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

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

export function DialogTrigger({
  asChild,
  children,
}: {
  asChild?: boolean
  children: React.ReactElement
}) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('DialogTrigger must be inside Dialog')

  const child = children as React.ReactElement<any>
  const onClick = (event: React.MouseEvent) => {
    ;(child.props as any).onClick?.(event)
    if (!event.defaultPrevented) {
      ctx.setOpen(true)
    }
  }

  if (asChild) {
    return React.cloneElement(child as any, { onClick } as any)
  }

  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  )
}

export function DialogContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('DialogContent must be inside Dialog')
  if (!ctx.open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:items-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg',
          className,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={() => ctx.setOpen(false)}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5', className)} {...props} />
}

export function DialogFooter({
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

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}
