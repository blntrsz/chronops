// @ts-nocheck
import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAtomValue } from '@effect-atom/atom-react'

import { Page } from '@/components/Page'
import { PageHeader } from '@/components/PageHeader'
import { ResultView } from '@/components/ResultView'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { formatDateTime } from '@/lib/format'
import { frameworkListQuery, pageSize } from '@/features/framework/atom/framework'
import { FrameworkCreateDialog } from '@/features/framework/components/FrameworkCreateDialog'

export function FrameworkListPage() {
  const [page, setPage] = React.useState(0)
  const navigate = useNavigate()

  const list = useAtomValue(frameworkListQuery(page))

  const onCreated = (frameworkId: string) => {
    navigate({ to: '/frameworks/$frameworkId', params: { frameworkId } })
  }

  return (
    <Page>
      <PageHeader
        title="Frameworks"
        description="Your compliance frameworks. Create one, then add controls."
        right={<FrameworkCreateDialog onCreated={onCreated} />}
      />

      <div className="mt-6 grid gap-4">
        <Card>
          <CardContent className="pt-6">
            <ResultView result={list}>
              {(frameworks) => (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {frameworks.map((fw) => (
                        <TableRow key={fw.id}>
                          <TableCell>
                            <div className="font-medium">{fw.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {fw.id}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(fw.updatedAt)}
                          </TableCell>
                          <TableCell>
                            <Button asChild variant="outline" size="sm">
                              <Link
                                to="/frameworks/$frameworkId"
                                params={{ frameworkId: fw.id }}
                              >
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {page + 1}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        Prev
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={frameworks.length < pageSize}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </ResultView>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}
