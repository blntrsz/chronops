// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'

import { FrameworkListPage } from '@/features/framework/components/FrameworkListPage'

export const Route = createFileRoute('/frameworks')({
  component: FrameworkListPage,
})
