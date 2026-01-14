import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/org/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/org/$slug"!</div>
}
