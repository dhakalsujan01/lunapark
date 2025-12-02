import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardStats from "@/components/admin/dashboard-stats"
import RecentOrders from "@/components/admin/recent-orders"
import AnalyticsCharts from "@/components/admin/analytics-charts"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
      </div>

      <DashboardStats />

      <AnalyticsCharts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Export Reports</h4>
              <p className="text-sm text-muted-foreground">Download detailed analytics</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">View Logs</h4>
              <p className="text-sm text-muted-foreground">Security & activity logs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
