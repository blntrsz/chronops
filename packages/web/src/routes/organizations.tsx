// @ts-nocheck
import { createFileRoute, redirect } from '@tanstack/react-router'

import { authClient } from '@/lib/auth'

export const Route = createFileRoute('/organizations')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) throw redirect({ to: '/login' })
    throw redirect({ to: '/org/switcher' })
  },
  component: () => null,
})
