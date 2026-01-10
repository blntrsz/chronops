import { handler } from "@chronops/core/rpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      GET: async ({ request }) => handler(request),
      POST: async ({ request }) => handler(request),
    },
  },
});
