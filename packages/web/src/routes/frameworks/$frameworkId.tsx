// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'

import { FrameworkEditPage } from '@/features/framework/components/FrameworkEditPage'

export const Route = createFileRoute('/frameworks/$frameworkId')({
  component: FrameworkEditRoute,
})

function FrameworkEditRoute() {
  const { frameworkId } = Route.useParams()
  return <FrameworkEditPage frameworkId={frameworkId} />
}
