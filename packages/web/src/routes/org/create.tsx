// @ts-nocheck
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { Building2, Shield } from 'lucide-react'
import { useState } from 'react'

import { authClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Route = createFileRoute('/org/create')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) throw redirect({ to: '/login' })
    if (session.data.session?.activeOrganizationId) throw redirect({ to: '/dashboard' })
  },
  component: OrgCreatePage,
})

function OrgCreatePage() {
  const navigate = useNavigate({ from: '/org/create' })
  const session = authClient.useSession()

  const [orgName, setOrgName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setMessage(null)

    try {
      const res = await authClient.organization.create({
        name: orgName,
        slug: orgName.toLowerCase().trim().replace(/\s+/g, '-'),
      })

      const createdOrgId = res?.data?.id
      if (createdOrgId) await authClient.organization.setActive({ organizationId: createdOrgId })
      await navigate({ to: '/dashboard' })
    } catch {
      setMessage({ type: 'error', text: 'Org create failed. Retry.' })
    } finally {
      setIsCreating(false)
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
          <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
            <Link to="/org/switcher">Back</Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <Card className="ds-glass">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-600/10">
                <Building2 className="h-6 w-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">Create org</CardTitle>
              <CardDescription className="text-slate-400">Name your workspace to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label htmlFor="orgName" className="mb-2 block text-sm font-medium text-slate-300">
                    Organization name
                  </label>
                  <Input
                    id="orgName"
                    placeholder="Acme Inc."
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-cyan-500"
                  />
                </div>

                {message ? (
                  <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating…' : 'Create'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
