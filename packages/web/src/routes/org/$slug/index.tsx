import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileText, ListChecks, Plus } from "lucide-react";
import { Result, useAtomValue } from "@effect-atom/atom-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Page } from "@/components/page";
import { PageHeader } from "@/components/page-header";
import { frameworkCountQuery } from "@/features/framework/atom";
import { controlCountQuery } from "@/features/control/atom";
import { documentCountQuery } from "@/features/document/atom";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/org/$slug/")({
  component: OrgDashboardPage,
});

function OrgDashboardPage() {
  const activeOrg = authClient.useActiveOrganization();

  const frameworkCount = useAtomValue(frameworkCountQuery());
  const controlCount = useAtomValue(controlCountQuery());
  const documentCount = useAtomValue(documentCountQuery());

  const frameworks = Result.getOrElse(frameworkCount, () => 0);
  const controls = Result.getOrElse(controlCount, () => 0);
  const documents = Result.getOrElse(documentCount, () => 0);

  const { slug } = Route.useParams();

  return (
    <Page>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title={`Welcome to ${activeOrg.data?.name}`}
          description="Manage your compliance framework, controls, and documents."
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Frameworks
            </CardTitle>
            <BookOpen className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{frameworks}</div>
            <p className="text-xs text-slate-400">Active frameworks</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Controls
            </CardTitle>
            <ListChecks className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{controls}</div>
            <p className="text-xs text-slate-400">Total controls</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{documents}</div>
            <p className="text-xs text-slate-400">Evidence documents</p>
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
            <Button
              asChild
              className="w-full justify-start bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            >
              <Link to="/org/$slug/framework" params={{ slug }}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Framework
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start text-slate-300"
            >
              <Link to="/org/$slug/control" params={{ slug }}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Control
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start text-slate-300"
            >
              <Link to="/org/$slug/document" params={{ slug }}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
