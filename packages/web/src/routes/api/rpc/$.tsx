import { createFileRoute } from "@tanstack/react-router";
import { handler } from "@chronops/core/rpc";

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      POST: async ({ request }) => handler(request),
      GET: async ({ request }) => handler(request),
    },
  },
});
