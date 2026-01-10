import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/org/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/org/create"!</div>
}
