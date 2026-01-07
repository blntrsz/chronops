// @ts-nocheck
import { createFileRoute, Link } from '@tanstack/react-router'

import { Page } from '@/components/Page'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <Page>
      <PageHeader
        title="Compliance workspace"
        description="Create frameworks, map controls, attach evidence."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Frameworks</CardTitle>
            <CardDescription>Start here. Organize controls.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/frameworks">Open frameworks</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Track status, frequency, ownership.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/controls">Open controls</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Evidence + requirements, link to controls.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/documents">Open documents</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}
