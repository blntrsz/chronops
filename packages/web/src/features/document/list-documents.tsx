import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { countDocuments, listDocuments } from "@/features/document/_atom";
import { CreateDocument } from "@/features/document/create-document";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link, useParams } from "@tanstack/react-router";
import React from "react";

const pageSize = 50;

function DocumentCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
    </Card>
  );
}

export function ListDocuments({ className, ...props }: React.ComponentProps<"div">) {
  const [page, setPage] = React.useState(1);
  const { slug } = useParams({ from: "/org/$slug/document/" });

  const list = useAtomValue(listDocuments(page));
  const count = useAtomValue(countDocuments());

  const total = Result.getOrElse(count, () => 0);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  function prev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function next() {
    setPage((p) => Math.min(pages, p + 1));
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-row justify-end gap-2">
        <CreateDocument />
      </div>

      <FieldGroup>
        {list._tag === "Initial" || count._tag === "Initial" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <DocumentCardSkeleton key={idx} />
            ))}
          </div>
        ) : Result.isFailure(list) || Result.isFailure(count) ? (
          <FieldDescription>Failed loading documents</FieldDescription>
        ) : (Result.getOrElse(list, () => []).length ?? 0) === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No documents</EmptyTitle>
              <EmptyDescription>Create first document / upload evidence.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {Result.getOrElse(list, () => []).map((doc) => (
                <Link
                  key={doc.id}
                  to="/org/$slug/document/$id"
                  params={{ slug, id: doc.id }}
                  className="block"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{doc.name}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <div className="line-clamp-1">{doc.type}</div>
                          {doc.size ? (
                            <div className="line-clamp-1">{doc.size.toLocaleString()} bytes</div>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {doc.frameworkId ? (
                            <div className="line-clamp-1">fwk {doc.frameworkId}</div>
                          ) : null}
                          {doc.controlId ? (
                            <div className="line-clamp-1">ctrl {doc.controlId}</div>
                          ) : null}
                        </div>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            {pages > 1 ? (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        prev();
                      }}
                    />
                  </PaginationItem>

                  {Array.from({ length: pages })
                    .slice(0, 7)
                    .map((_, idx) => {
                      const p = idx + 1;
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        next();
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </>
        )}
      </FieldGroup>
    </div>
  );
}
