import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/org/switcher')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/org/switcher"!</div>
}
