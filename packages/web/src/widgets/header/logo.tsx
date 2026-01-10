import { Link, type LinkProps } from "@tanstack/react-router";
import { History } from "lucide-react";

interface LogoProps {
  to?: LinkProps["to"];
  slug?: string;
}

export function Logo({ to = "/", slug }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <History className="mt-1 h-6 w-6 text-zinc-900" />
      <Link to={to} params={{ slug }}>
        <span className="text-2xl">chron</span>
        <span className="font-bold text-2xl">ops</span>
      </Link>
    </div>
  );
}
