import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  MoreHorizontal,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/org/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();

  const stats = [
    {
      title: "Compliance Score",
      value: "84%",
      description: "+2% from last month",
      icon: Activity,
      trend: "up",
      color: "text-green-500",
    },
    {
      title: "Active Frameworks",
      value: "3",
      description: "SOC 2, HIPAA, ISO 27001",
      icon: Shield,
      trend: "neutral",
      color: "text-blue-500",
    },
    {
      title: "Pending Controls",
      value: "12",
      description: "Requires attention",
      icon: AlertCircle,
      trend: "down",
      color: "text-orange-500",
    },
    {
      title: "Total Documents",
      value: "148",
      description: "Policy & evidence files",
      icon: FileText,
      trend: "up",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your organization's compliance posture.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity / Framework Status */}
        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Framework Progress</CardTitle>
            <CardDescription>Completion status across active frameworks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">SOC 2 Type II</span>
                </div>
                <span className="text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="font-medium">HIPAA</span>
                </div>
                <span className="text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">ISO 27001</span>
                </div>
                <span className="text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Action Items / Tasks */}
        <Card className="col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and required actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  action: "Policy Approved",
                  subject: "Access Control Policy",
                  time: "2h ago",
                  icon: CheckCircle2,
                  color: "text-green-500",
                },
                {
                  action: "Control Failed",
                  subject: "Backup Restoration Test",
                  time: "5h ago",
                  icon: AlertCircle,
                  color: "text-red-500",
                },
                {
                  action: "New Document",
                  subject: "Q1 Security Report",
                  time: "1d ago",
                  icon: FileText,
                  color: "text-blue-500",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className={`mt-1 rounded-full bg-muted p-1 ${item.color.replace("text", "bg")}/10`}
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.subject}</p>
                    <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full text-xs" asChild>
                <Link to={`/org/${slug}/control`}>
                  View All Activity <ArrowUpRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/org/${slug}/framework`} className="group">
            <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-background border border-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    Add Framework
                  </span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </CardContent>
            </Card>
          </Link>
          <Link to={`/org/${slug}/control`} className="group">
            <Card className="bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-background border">
                    <CheckCircle2 className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="font-medium">Review Controls</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </CardContent>
            </Card>
          </Link>
          <Link to={`/org/${slug}/document`} className="group">
            <Card className="bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-background border">
                    <FileText className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="font-medium">Upload Evidence</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
