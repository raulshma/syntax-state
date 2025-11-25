import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Users, Activity, Terminal, MoreHorizontal, Search, FileText, Filter, Cpu, Zap, Clock, Database } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getAdminStats, getAILogs, getSearchToolStatus, getAIUsageByAction, getModelConfig } from "@/lib/actions/admin"
import { SearchToolToggle } from "@/components/admin/search-tool-toggle"
import { AILogViewer } from "@/components/admin/ai-log-viewer"
import { ModelSelector } from "@/components/admin/model-selector"

// Mock users data - in production this would come from the database
const users = [
  { id: "1", name: "Alex Chen", email: "alex@example.com", plan: "Pro", preps: 12, lastActive: "2h ago" },
  { id: "2", name: "Sarah Kim", email: "sarah@example.com", plan: "Free", preps: 3, lastActive: "1d ago" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", plan: "Max", preps: 45, lastActive: "5m ago" },
  { id: "4", name: "Emma Wilson", email: "emma@example.com", plan: "Pro", preps: 8, lastActive: "3h ago" },
]

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default async function AdminPage() {
  // Fetch real data from the database
  const [stats, aiLogs, searchStatus, usageByAction, modelConfig] = await Promise.all([
    getAdminStats(),
    getAILogs({ limit: 50 }),
    getSearchToolStatus(),
    getAIUsageByAction(),
    getModelConfig(),
  ]);

  const statsCards = [
    { label: "Total Users", value: formatNumber(stats.totalUsers), icon: Users },
    { label: "Active This Week", value: formatNumber(stats.activeThisWeek), icon: Activity },
    { label: "Total Interviews", value: formatNumber(stats.totalInterviews), icon: FileText },
    { label: "AI Requests", value: formatNumber(stats.totalAIRequests), icon: Cpu },
  ];

  const aiStatsCards = [
    { label: "Input Tokens", value: formatNumber(stats.totalInputTokens), icon: Database, color: "text-green-500" },
    { label: "Output Tokens", value: formatNumber(stats.totalOutputTokens), icon: Zap, color: "text-blue-500" },
    { label: "Avg Latency", value: `${stats.avgLatencyMs}ms`, icon: Clock, color: "text-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-mono text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage users, AI monitoring, and system settings</p>
          </div>
          <Badge>Admin</Badge>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-mono text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="ai-monitoring" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ai-monitoring">
              <Cpu className="w-4 h-4 mr-2" />
              AI Monitoring
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="models">
              <Settings className="w-4 h-4 mr-2" />
              Model Config
            </TabsTrigger>
            <TabsTrigger value="prompts">
              <Terminal className="w-4 h-4 mr-2" />
              System Prompts
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* AI Monitoring Tab - Requirements: 9.1, 9.3, 9.4 */}
          <TabsContent value="ai-monitoring">
            <div className="space-y-6">
              {/* AI Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                {aiStatsCards.map((stat) => (
                  <Card key={stat.label} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <p className={`text-2xl font-mono ${stat.color}`}>{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Usage by Action Type */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-mono">Usage by Action Type</CardTitle>
                  <CardDescription>AI generation requests breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {usageByAction.length > 0 ? (
                      usageByAction.map((item) => {
                        const maxCount = Math.max(...usageByAction.map(u => u.count));
                        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={item.action} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono text-xs min-w-[140px]">
                                {item.action.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                avg {item.avgLatency}ms
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-muted rounded">
                                <div 
                                  className="h-full bg-foreground rounded" 
                                  style={{ width: `${percentage}%` }} 
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-12 text-right">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No AI requests recorded yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Logs Table - Requirements: 9.4 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-mono">AI Request Logs</CardTitle>
                      <CardDescription>Full trace of all AI generation requests</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Actions</SelectItem>
                          <SelectItem value="GENERATE_BRIEF">Generate Brief</SelectItem>
                          <SelectItem value="GENERATE_TOPICS">Generate Topics</SelectItem>
                          <SelectItem value="GENERATE_MCQ">Generate MCQ</SelectItem>
                          <SelectItem value="GENERATE_RAPID_FIRE">Generate Rapid Fire</SelectItem>
                          <SelectItem value="REGENERATE_ANALOGY">Regenerate Analogy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {aiLogs.length > 0 ? (
                    <AILogViewer logs={aiLogs} />
                  ) : (
                    <div className="text-center py-8">
                      <Cpu className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">No AI logs recorded yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI request logs will appear here once users start generating content
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="users">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-mono">User Management</CardTitle>
                    <CardDescription>View and manage all users</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-10 w-64" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Preps</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-mono text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.plan === "Max" ? "default" : "secondary"}>{user.plan}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{user.preps}</TableCell>
                        <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              <DropdownMenuItem>Impersonate</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models">
            <div className="space-y-6">
              {/* Model Selector Component */}
              <ModelSelector initialConfig={modelConfig} />

              {/* Tool Configuration with Search Toggle - Requirements: 9.3 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-mono">Tool Configuration</CardTitle>
                  <CardDescription>Enable or disable AI tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="text-sm text-foreground">Web Search Tool</p>
                        <p className="text-xs text-muted-foreground">
                          Enable AI to search the web for up-to-date information via SearXNG
                        </p>
                      </div>
                      <SearchToolToggle initialEnabled={searchStatus.enabled} />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-50">
                      <div>
                        <p className="text-sm text-foreground">Code Execution</p>
                        <p className="text-xs text-muted-foreground">Allow AI to run code snippets in sandbox</p>
                      </div>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-50">
                      <div>
                        <p className="text-sm text-foreground">Citation Generation</p>
                        <p className="text-xs text-muted-foreground">Automatically cite sources in responses</p>
                      </div>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="prompts">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono">System Prompts</CardTitle>
                <CardDescription>Edit the AI system prompts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Main System Prompt</Label>
                  <Textarea
                    className="font-mono min-h-[200px]"
                    defaultValue="You are an expert technical interview coach specializing in software engineering roles. Your goal is to help candidates understand complex concepts through clear explanations and relatable analogies..."
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Analogy Generation Prompt</Label>
                  <Textarea
                    className="font-mono min-h-[120px]"
                    defaultValue="Generate an analogy for the following technical concept. The analogy should be relatable to everyday experiences and appropriate for the specified expertise level..."
                  />
                </div>
                <Button>Save Prompts</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-mono">Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-mono">Popular Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["React Hooks", "System Design", "TypeScript", "Algorithms", "Behavioral"].map((topic, i) => (
                      <div key={topic} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{topic}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded">
                            <div className="h-full bg-foreground rounded" style={{ width: `${100 - i * 15}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{100 - i * 15}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
