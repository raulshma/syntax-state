import { Logo } from "@/components/ui/logo"
import { getIterationStatus } from "@/lib/actions/user"
import { SidebarNav } from "./sidebar-nav"
import { SidebarUsage } from "./sidebar-usage"
import { SidebarSignOut } from "./sidebar-signout"

export async function Sidebar() {
  const iterationResult = await getIterationStatus()
  
  const iterationData = iterationResult.success 
    ? iterationResult.data 
    : { count: 0, limit: 5, remaining: 5, resetDate: new Date(), plan: 'FREE', isByok: false }

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <Logo />
      </div>

      <SidebarNav />

      <div className="p-4 border-t border-border space-y-4">
        <SidebarUsage 
          count={iterationData.count}
          limit={iterationData.limit}
          plan={iterationData.plan}
          isByok={iterationData.isByok}
        />

        <SidebarSignOut />
      </div>
    </aside>
  )
}
