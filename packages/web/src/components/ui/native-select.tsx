import type * as React from "react";

import { cn } from "@/lib/utils";

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
