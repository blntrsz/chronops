import { useSetActiveDialog } from "@/atoms/dialog-atom";
import { Button } from "@/components/ui/button";
import { ListFrameworks } from "@/features/framework/list-frameworks";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/framework/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setActiveDialog = useSetActiveDialog();

  return (
    <div>
      <Button onClick={() => setActiveDialog("createFramework")}>Create framework</Button>
      <ListFrameworks />
    </div>
  );
}
