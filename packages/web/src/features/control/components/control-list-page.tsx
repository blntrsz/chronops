import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "@effect-atom/atom-react";

import { Page } from "@/components/page";
import { PageHeader } from "@/components/page-header";
import { ResultView } from "@/components/result-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDateTime } from "@/lib/format";
import { controlListQuery, pageSize } from "@/features/control/atom/control";
import { ControlCreateDialog } from "@/features/control/components/control-create-dialog";

export function ControlListPage() {
  const [page, setPage] = React.useState(0);
  const navigate = useNavigate();

  const list = useAtomValue(controlListQuery(page));

  const onCreated = (controlId: string) => {
    navigate({ to: "/controls/$controlId", params: { controlId } });
  };

  return (
    <Page>
      <PageHeader
        title="Controls"
        description="Track controls. Link them to a framework."
        right={<ControlCreateDialog onCreated={onCreated} />}
      />

      <div className="mt-6 grid gap-4">
        <Card>
          <CardContent className="pt-6">
            <ResultView result={list}>
              {(controls) => (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {controls.map((ctrl) => (
                        <TableRow key={ctrl.id}>
                          <TableCell>
                            <div className="font-medium">{ctrl.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {ctrl.id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{ctrl.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(ctrl.updatedAt)}
                          </TableCell>
                          <TableCell>
                            <Button asChild variant="outline" size="sm">
                              <Link
                                to="/controls/$controlId"
                                params={{ controlId: ctrl.id }}
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
                        disabled={controls.length < pageSize}
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
  );
}
