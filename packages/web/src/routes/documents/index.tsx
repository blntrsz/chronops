// @ts-nocheck
import { createFileRoute, redirect } from '@tanstack/react-router'

import { DocumentListPage } from '@/features/document/components/DocumentListPage'
import { authClient } from '@/lib/auth'

export const Route = createFileRoute('/documents/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({ to: '/login' })
    }
    if (!session.data.session?.activeOrganizationId) {
      throw redirect({ to: '/org/switcher' })
    }
  },
  component: DocumentListPage,
})
