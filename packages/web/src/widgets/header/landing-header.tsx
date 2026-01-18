import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/client";
import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { UserButton } from "./user-button";

export function LandingHeader() {
  const session = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="flex h-16 items-center justify-between border-b-1 p-4">
        <Logo />
        <div>
          {session.data ? (
            <div className="flex items-center gap-6">
              <Button asChild variant="ghost">
                <Link to="/org">dashboard</Link>
              </Button>
              <UserButton />
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
