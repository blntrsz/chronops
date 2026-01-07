import type * as React from 'react'

import { cn } from '@/lib/utils'

export function Page({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <main className={cn('mx-auto w-full max-w-6xl p-6', className)}>{children}</main>
}
