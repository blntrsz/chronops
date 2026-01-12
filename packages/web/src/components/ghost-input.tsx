import { cn } from "@/lib/utils";

export function GhostInput({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      className={cn("border-0 bg-transparent outline-none", className)}
      {...props}
      type={type}
    />
  );
}

export function GhostTextArea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-18 resize-none border-0 bg-transparent outline-none",
        className,
      )}
      {...props}
    />
  );
}
