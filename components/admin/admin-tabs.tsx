"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Settings,
  Users,
  Activity,
  Terminal,
  Search,
  Cpu,
  BarChart3,
  Layers,
  Wrench,
} from "lucide-react";
import { SearchToolToggle } from "@/components/admin/search-tool-toggle";
import { AIMonitoringDashboard } from "@/components/admin/ai-monitoring-dashboard";
import { TieredModelConfig } from "@/components/admin/tiered-model-config";
import { ConcurrencyConfig } from "@/components/admin/concurrency-config";
import { UserActions } from "@/components/admin/user-management";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import type {
  AdminStats,
  AdminUser,
  AILogWithDetails,
  FullTieredModelConfig,
  UsageTrendData,
  PopularTopicData,
  PlanDistribution,
  TokenUsageTrend,
} from "@/lib/actions/admin";

interface AdminTabsProps {
  stats: AdminStats;
  aiLogs: AILogWithDetails[];
  aiLogsCount: number;
  searchStatus: { enabled: boolean };
  usageByAction: Array<{ action: string; count: number; avgLatency: number }>;
  users: AdminUser[];
  usageTrends: UsageTrendData[];
  popularTopics: PopularTopicData[];
  planDistribution: PlanDistribution[];
  tokenUsageTrends: TokenUsageTrend[];
  topCompanies: PopularTopicData[];
  modelUsage: Array<{ model: string; count: number; percentage: number }>;
  concurrencyLimit: number;
  tieredModelConfig: FullTieredModelConfig;
}

export function AdminTabs({
  stats,
  aiLogs,
  aiLogsCount,
  searchStatus,
  usageByAction,
  users,
  usageTrends,
  popularTopics,
  planDistribution,
  tokenUsageTrends,
  topCompanies,
  modelUsage,
  concurrencyLimit,
  tieredModelConfig,
}: AdminTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Tabs defaultValue="users" className="space-y-6">
        <div className="bg-card/50 backdrop-blur-sm border border-border p-2 inline-block">
          <TabsList className="bg-transparent gap-1">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-primary/10 gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai-monitoring"
              className="data-[state=active]:bg-primary/10 gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">AI Monitoring</span>
            </TabsTrigger>
            <TabsTrigger
              value="models"
              className="data-[state=active]:bg-primary/10 gap-2"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Models</span>
            </TabsTrigger>
            <TabsTrigger
              value="prompts"
              className="data-[state=active]:bg-primary/10 gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-primary/10 gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Users Tab */}
        <TabsContent value="users">
          <UsersTab users={users} />
        </TabsContent>

        {/* AI Monitoring Tab */}
        <TabsContent value="ai-monitoring">
          <AIMonitoringDashboard
            initialLogs={aiLogs}
            initialStats={stats}
            initialLogsCount={aiLogsCount}
            usageByAction={usageByAction}
          />
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models">
          <ModelsTab
            tieredModelConfig={tieredModelConfig}
            concurrencyLimit={concurrencyLimit}
            searchStatus={searchStatus}
          />
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts">
          <PromptsTab />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsDashboard
            usageTrends={usageTrends}
            popularTopics={popularTopics}
            planDistribution={planDistribution}
            tokenUsageTrends={tokenUsageTrends}
            topCompanies={topCompanies}
            modelUsage={modelUsage}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function UsersTab({ users }: { users: AdminUser[] }) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border overflow-hidden">
      <CardHeader className="border-b border-border bg-gradient-to-r from-secondary/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-mono flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage all platform users
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-64 bg-background/50"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-mono">User</TableHead>
              <TableHead className="font-mono">Plan</TableHead>
              <TableHead className="font-mono">Status</TableHead>
              <TableHead className="font-mono">Interviews</TableHead>
              <TableHead className="font-mono">Last Active</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`border-border hover:bg-secondary/30 transition-colors ${
                    user.suspended ? "opacity-60" : ""
                  }`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center font-mono text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-mono text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.plan === "MAX" ? "default" : "secondary"}
                      className="font-mono"
                    >
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.suspended ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      <Badge
                        variant={user.suspended ? "destructive" : "outline"}
                      >
                        {user.suspended ? "Suspended" : "Active"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {user.interviewCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.lastActive}
                  </TableCell>
                  <TableCell>
                    <UserActions user={user} />
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-secondary flex items-center justify-center">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No users found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ModelsTab({
  tieredModelConfig,
  concurrencyLimit,
  searchStatus,
}: {
  tieredModelConfig: FullTieredModelConfig;
  concurrencyLimit: number;
  searchStatus: { enabled: boolean };
}) {
  return (
    <div className="space-y-6">
      {/* Tiered Model Configuration */}
      <TieredModelConfig initialConfig={tieredModelConfig} />

      {/* AI Concurrency Configuration */}
      <ConcurrencyConfig initialLimit={concurrencyLimit} />

      {/* Tool Configuration */}
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="border-b border-border bg-gradient-to-r from-secondary/30 to-transparent">
          <CardTitle className="font-mono flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Tool Configuration
          </CardTitle>
          <CardDescription>
            Enable or disable AI tools and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <ToolConfigItem
              title="Web Search Tool"
              description="Enable AI to search the web for up-to-date information via SearXNG"
              enabled={searchStatus.enabled}
              toggle={
                <SearchToolToggle initialEnabled={searchStatus.enabled} />
              }
            />
            <ToolConfigItem
              title="Code Execution"
              description="Allow AI to run code snippets in sandbox"
              comingSoon
            />
            <ToolConfigItem
              title="Citation Generation"
              description="Automatically cite sources in responses"
              comingSoon
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToolConfigItem({
  title,
  description,
  enabled,
  toggle,
  comingSoon,
}: {
  title: string;
  description: string;
  enabled?: boolean;
  toggle?: React.ReactNode;
  comingSoon?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 border border-border bg-background/50 hover:bg-secondary/20 transition-colors ${
        comingSoon ? "opacity-50" : ""
      }`}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {comingSoon ? (
        <Badge variant="outline" className="font-mono">
          Coming Soon
        </Badge>
      ) : (
        toggle
      )}
    </div>
  );
}

function PromptsTab() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="border-b border-border bg-gradient-to-r from-secondary/30 to-transparent">
        <CardTitle className="font-mono flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          System Prompts
        </CardTitle>
        <CardDescription>
          Configure AI system prompts and behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Main System Prompt
          </Label>
          <Textarea
            className="font-mono min-h-[200px] bg-background/50 border-border focus:border-primary/50"
            defaultValue="You are an expert technical interview coach specializing in software engineering roles. Your goal is to help candidates understand complex concepts through clear explanations and relatable analogies..."
          />
        </div>
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Analogy Generation Prompt
          </Label>
          <Textarea
            className="font-mono min-h-[120px] bg-background/50 border-border focus:border-primary/50"
            defaultValue="Generate an analogy for the following technical concept. The analogy should be relatable to everyday experiences and appropriate for the specified expertise level..."
          />
        </div>
        <div className="flex justify-end">
          <Button className="font-mono">Save Prompts</Button>
        </div>
      </CardContent>
    </Card>
  );
}
