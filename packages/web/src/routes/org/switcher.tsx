// @ts-nocheck
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Building2, ChevronRight, Plus, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'

import { authClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Route = createFileRoute('/org/switcher')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) throw redirect({ to: '/login' })
    if (session.data.session?.activeOrganizationId) throw redirect({ to: '/dashboard' })
  },
  component: OrgSwitcherPage,
})

function OrgSwitcherPage() {
  const session = authClient.useSession()
  const organizations = authClient.useListOrganizations()

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (organizations.isLoading) return
    if (Array.isArray(organizations.data) && organizations.data.length === 0) {
      window.location.href = '/org/create'
    }
  }, [organizations.data, organizations.isLoading])

  const handleSetActive = async (orgId: string) => {
    setMessage(null)
    try {
      await authClient.organization.setActive({ organizationId: orgId })
      window.location.href = '/dashboard'
    } catch {
      setMessage({ type: 'error', text: 'Org switch failed.' })
    }
  }

  return (
    <>
      <nav className="ds-topbar">
        <div className="flex items-center gap-2">
          <div className="ds-icon-tile">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Chronops</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">{session.data?.user?.email}</span>
          <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700">
            <Link to="/org/create">
              <Plus className="mr-2 h-4 w-4" />
              New org
            </Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Choose org</h1>
          <p className="mt-2 text-slate-400">Pick an organization to continue.</p>
        </div>

        {message ? (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.data?.map((org: { id: string; name: string; slug: string }) => (
            <Card
              key={org.id}
              className="cursor-pointer border-slate-700/50 bg-slate-800/50 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800/80"
              onClick={() => handleSetActive(org.id)}
            >
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-600/10">
                  <Building2 className="h-6 w-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">{org.name}</CardTitle>
                <CardDescription className="text-slate-400">{org.slug}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between text-cyan-400 hover:text-cyan-300">
                  Enter
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
