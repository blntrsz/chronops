import { LandingHeader } from "@/widgets/header/landing-header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <>
      <LandingHeader />
      <main>Hello from the root route!</main>
    </>
  );
}
