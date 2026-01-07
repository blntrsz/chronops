// @ts-nocheck
import { createFileRoute, redirect } from '@tanstack/react-router'

import { FrameworkListPage } from '@/features/framework/components/FrameworkListPage'
import { authClient } from '@/lib/auth'

export const Route = createFileRoute('/frameworks/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({ to: '/login' })
    }
    if (!session.data.session?.activeOrganizationId) {
      throw redirect({ to: '/org/switcher' })
    }
  },
  component: FrameworkListPage,
})
