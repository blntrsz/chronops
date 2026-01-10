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
import { documentListQuery, pageSize } from "@/features/document/atom/document";
import { DocumentCreateDialog } from "@/features/document/components/document-create-dialog";

export function DocumentListPage() {
  const [page, setPage] = React.useState(0);
  const navigate = useNavigate();

  const list = useAtomValue(documentListQuery(page));

  const onCreated = (documentId: string) => {
    navigate({ to: "/org/$slug/document/$id", params: { slug: "-", id: documentId } });
  };

  return (
    <Page>
      <PageHeader
        title="Documents"
        description="Evidence and requirements. Link to controls."
        right={<DocumentCreateDialog onCreated={onCreated} />}
      />

      <div className="mt-6 grid gap-4">
        <Card>
          <CardContent className="pt-6">
            <ResultView result={list}>
              {(documents) => (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{doc.type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(doc.updatedAt)}
                          </TableCell>
                          <TableCell>
                            <Button asChild variant="outline" size="sm">
                              <Link
                                  to="/org/$slug/document/$id"
                                  params={{ slug: "-", id: doc.id }}
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
                        disabled={documents.length < pageSize}
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
