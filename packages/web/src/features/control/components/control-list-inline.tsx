import { Link } from '@tanstack/react-router'
import { Result } from '@effect-atom/atom-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'

import type { Control } from '@chronops/domain'

export function ControlListInline({
  title,
  description,
  listResult,
}: {
  title: string
  description?: string
  listResult: Result.Result<ReadonlyArray<Control.Control>, unknown>
}) {
  if (Result.isWaiting(listResult) || Result.isInitial(listResult)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Loading
          </div>
        </CardContent>
      </Card>
    )
  }

  if (Result.isFailure(listResult)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            Failed
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listResult.value.map((ctrl) => (
              <TableRow key={ctrl.id}>
                <TableCell>
                  <div className="font-medium">{ctrl.name}</div>
                  <div className="text-xs text-muted-foreground">{ctrl.id}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {ctrl.status}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/controls/$controlId" params={{ controlId: ctrl.id }}>
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
