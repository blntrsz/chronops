import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { cn } from "@/lib/utils";
import { countFrameworks, listFrameworks } from "@/features/framework/_atom";
import React from "react";

const pageSize = 50;

function FrameworkCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
    </Card>
  );
}

export function ListFrameworks({ className, ...props }: React.ComponentProps<"div">) {
  const [page, setPage] = React.useState(1);

  const list = listFrameworks(page);
  const count = countFrameworks();

  const total = count.data ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  function prev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function next() {
    setPage((p) => Math.min(pages, p + 1));
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        {list.isPending || count.isPending ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <FrameworkCardSkeleton key={idx} />
            ))}
          </div>
        ) : list.error || count.error ? (
          <FieldDescription>Failed loading frameworks</FieldDescription>
        ) : (list.data?.length ?? 0) === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No frameworks</EmptyTitle>
              <EmptyDescription>Create first framework to start</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {list.data!.map((fwk) => (
                <Card key={fwk.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{fwk.name}</CardTitle>
                    <CardDescription className="space-y-1">
                      {fwk.version ? (
                        <div className="line-clamp-1">v{fwk.version}</div>
                      ) : null}
                      {fwk.description ? (
                        <div className="line-clamp-2">{fwk.description}</div>
                      ) : null}
                    </CardDescription>
                  </CardHeader>
                </Card>
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

                  {Array.from({ length: pages }).slice(0, 7).map((_, idx) => {
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
