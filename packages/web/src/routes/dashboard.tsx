import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { BookOpen, FileText, ListChecks, Plus, Users } from 'lucide-react'
import { useAtomValue } from '@effect-atom/atom-react'
import { authClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Page } from '@/components/Page'
import { PageHeader } from '@/components/PageHeader'
import { frameworkCountQuery } from '@/features/framework/atom/framework'
import { controlCountQuery } from '@/features/control/atom/control'
import { documentCountQuery } from '@/features/document/atom/document'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({ to: '/login' })
    }
    if (!session.data.session?.activeOrganizationId) {
      throw redirect({ to: '/org/switcher' })
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const session = authClient.useSession()
  const activeOrg = authClient.useActiveOrganization()

  const frameworkCount = useAtomValue(frameworkCountQuery())
  const controlCount = useAtomValue(controlCountQuery())
  const documentCount = useAtomValue(documentCountQuery())

  const frameworks = frameworkCount.data ?? 0
  const controls = controlCount.data ?? 0
  const documents = documentCount.data ?? 0

  return (
    <Page>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title={`Welcome to ${activeOrg.data?.name}`}
          description="Manage your compliance framework, controls, and documents."
        />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
            <span className="text-lg font-semibold text-white">
              {session.data?.user?.name?.[0] || session.data?.user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">{session.data?.user?.name || 'User'}</p>
            <p className="text-slate-400">{session.data?.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Frameworks</CardTitle>
            <BookOpen className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{frameworks}</div>
            <p className="text-xs text-slate-400">Active frameworks</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Controls</CardTitle>
            <ListChecks className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{controls}</div>
            <p className="text-xs text-slate-400">Total controls</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Documents</CardTitle>
            <FileText className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{documents}</div>
            <p className="text-xs text-slate-400">Evidence documents</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Team Members</CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-slate-400">Team members</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700">
              <Link to="/frameworks">
                <Plus className="mr-2 h-4 w-4" />
                Create New Framework
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-slate-300">
              <Link to="/controls">
                <Plus className="mr-2 h-4 w-4" />
                Add New Control
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-slate-300">
              <Link to="/documents">
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Compliance Status</CardTitle>
            <CardDescription className="text-slate-400">
              Overview of your compliance posture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">SOC 2</span>
                  <span className="text-sm font-medium text-cyan-400">--%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: '0%' }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">ISO 27001</span>
                  <span className="text-sm font-medium text-cyan-400">--%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: '0%' }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">GDPR</span>
                  <span className="text-sm font-medium text-cyan-400">--%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Frameworks</CardTitle>
            <CardDescription className="text-slate-400">
              Manage compliance frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/frameworks">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Controls</CardTitle>
            <CardDescription className="text-slate-400">
              Track and monitor controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/controls">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Documents</CardTitle>
            <CardDescription className="text-slate-400">
              Evidence and requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/documents">View All</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}
