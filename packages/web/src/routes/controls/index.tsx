// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'

import { ControlListPage } from '@/features/control/components/ControlListPage'

export const Route = createFileRoute('/controls')({
  component: ControlListPage,
})
