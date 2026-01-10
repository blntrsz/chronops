import type * as React from 'react'

import { Result } from '@effect-atom/atom-react'

import { Spinner } from '@/components/ui/spinner'

export function ResultView<A, E>({
  result,
  children,
}: {
  result: Result.Result<A, E>
  children: (value: A) => React.ReactNode
}) {
  if (Result.isWaiting(result) || Result.isInitial(result)) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Loading
      </div>
    )
  }

  if (Result.isFailure(result)) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
        Failed
      </div>
    )
  }

  return <>{children(result.value)}</>
}
