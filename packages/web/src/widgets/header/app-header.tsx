import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { UserButton } from "./user-button";

type AppHeaderProps = {
  hasSidebar?: boolean;
};

export function AppHeader({ hasSidebar }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="flex h-16 items-center justify-between border-b-1 p-4">
        <div className="flex h-full items-center gap-4">
          {hasSidebar && (
            <>
              <SidebarTrigger className="h-8 w-8" />
              <Separator className="mr-4 h-full w-1" orientation="vertical" />
            </>
          )}
          <Logo to={"/org"} />
        </div>
        <UserButton />
      </div>
    </header>
  );
}
