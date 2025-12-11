'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronDown, ChevronUp, Eye, Search, Clock, Cpu,
  AlertTriangle, CheckCircle, DollarSign, Code, FileText,
  ChevronLeft, ChevronRight, Activity, Zap
} from 'lucide-react';
import { StaticMarkdown } from '@/components/streaming/markdown-renderer';
import type { AILogWithDetails } from '@/lib/actions/admin';
import { getAILogById } from '@/lib/actions/admin';
import type { AILog } from '@/lib/db/schemas/ai-log';
import { formatLatency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface AILogViewerProps {
  logs: AILogWithDetails[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

function getActionBadgeVariant(action: string): 'default' | 'secondary' | 'outline' {
  switch (action) {
    case 'GENERATE_BRIEF':
      return 'default';
    case 'GENERATE_TOPICS':
      return 'secondary';
    case 'GENERATE_MCQ':
    case 'GENERATE_RAPID_FIRE':
      return 'outline';
    default:
      return 'outline';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'success':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium w-fit">
          <CheckCircle className="w-3.5 h-3.5" />
          Success
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium w-fit">
          <AlertTriangle className="w-3.5 h-3.5" />
          Error
        </div>
      );
    case 'timeout':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium w-fit">
          <Clock className="w-3.5 h-3.5" />
          Timeout
        </div>
      );
    case 'rate_limited':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-medium w-fit">
          <Activity className="w-3.5 h-3.5" />
          Rate Limit
        </div>
      );
    default:
      return <Badge variant="outline" className="rounded-full">{status}</Badge>;
  }
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCost(cost?: number): string {
  if (!cost) return '-';
  if (cost < 0.0001) return '<$0.0001';
  return `$${cost.toFixed(4)}`;
}

function isJsonResponse(response: string): boolean {
  const trimmed = response.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

function formatJsonResponse(response: string): string {
  try {
    const parsed = JSON.parse(response);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return response;
  }
}

export function AILogViewer({ logs, totalCount, currentPage, pageSize, onPageChange, isLoading }: AILogViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<AILog | null>(null);
  const [isLoadingExpanded, startExpandTransition] = useTransition();

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
    } else {
      setExpandedId(id);
      setExpandedData(null);
      // Load full data on expand
      startExpandTransition(async () => {
        const fullLog = await getAILogById(id);
        if (fullLog && 'success' in fullLog && fullLog.success === false) return;
        setExpandedData(fullLog as AILog | null);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/50 bg-background/50  overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[50px] pl-6"></TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tokens</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Latency</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tools</TableHead>
                <TableHead className="w-[80px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="border-border/50">
                    <TableCell className="pl-6"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-8 rounded-full" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : (
                logs.map((log) => (
                  <LogTableRows
                    key={log._id}
                    log={log}
                    isExpanded={expandedId === log._id}
                    expandedData={expandedId === log._id ? expandedData : null}
                    isLoadingExpanded={expandedId === log._id && isLoadingExpanded}
                    onToggleExpand={() => toggleExpand(log._id)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground font-medium">
          Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="h-9 rounded-full px-4 text-xs font-medium hover:bg-secondary/80"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1.5" />
            Previous
          </Button>
          <span className="text-sm font-medium min-w-[3rem] text-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="h-9 rounded-full px-4 text-xs font-medium hover:bg-secondary/80"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface LogTableRowsProps {
  log: AILogWithDetails;
  isExpanded: boolean;
  expandedData: AILog | null;
  isLoadingExpanded: boolean;
  onToggleExpand: () => void;
}

function LogTableRows({ log, isExpanded, expandedData, isLoadingExpanded, onToggleExpand }: LogTableRowsProps) {
  return (
    <>
      <TableRow
        className={`group cursor-pointer transition-colors border-border/50 ${isExpanded ? 'bg-secondary/30' : 'hover:bg-secondary/20'
          }`}
        onClick={onToggleExpand}
      >
        <TableCell className="pl-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground group-hover:text-foreground group-hover:bg-secondary/50"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground font-medium">
          {log.formattedTimestamp}
        </TableCell>
        <TableCell>
          {getStatusBadge(log.status)}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="font-medium text-xs rounded-lg bg-secondary/50 text-foreground border-0">
            {formatAction(log.action)}
          </Badge>
        </TableCell>
        <TableCell>
          {log.provider ? (
            <Badge variant="outline" className={`text-xs rounded-lg px-2 py-0.5 ${
              log.provider === 'google' 
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }`}>
              {log.provider === 'google' ? '🔷 Google' : '🌐 OpenRouter'}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">{log.model}</TableCell>
        <TableCell className="font-mono text-xs">
          <span className="text-cyan-600 dark:text-cyan-400 font-medium">{log.tokenUsage.input}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-pink-600 dark:text-pink-400 font-medium">{log.tokenUsage.output}</span>
        </TableCell>
        <TableCell className="font-mono text-xs font-medium text-green-600 dark:text-green-400">
          {formatCost(log.estimatedCost)}
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className={`font-mono text-xs font-medium ${log.latencyMs > 5000 ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground'
              }`}>
              {formatLatency(log.latencyMs)}
            </span>
            {log.timeToFirstToken && (
              <span className="text-[10px] text-muted-foreground">TTFT: {formatLatency(log.timeToFirstToken)}</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          {log.toolsUsed.length > 0 ? (
            <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 h-5 gap-1">
              <Search className="w-3 h-3" />
              {log.toolsUsed.length}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs pl-2">-</span>
          )}
        </TableCell>
        <TableCell className="pr-6" onClick={(e) => e.stopPropagation()}>
          <LogDetailDialog logId={log._id} logSummary={log} />
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="hover:bg-transparent border-border/50">
          <TableCell colSpan={11} className="p-0 bg-secondary/10">
            <div className="p-6">
              {isLoadingExpanded ? (
                <ExpandedLogSkeleton />
              ) : expandedData ? (
                <ExpandedLogContent log={{ ...expandedData, formattedTimestamp: log.formattedTimestamp }} />
              ) : (
                <ExpandedLogSkeleton />
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ExpandedLogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm bg-background/50">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-sm bg-background/50">
        <CardContent className="p-4">
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}


function ExpandedLogContent({ log }: { log: AILogWithDetails }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-background/80 ">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Cpu className="w-4 h-4" />
              </div>
              Request Details
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Interview ID</span>
                <span className="font-mono font-medium truncate max-w-[120px]" title={log.interviewId}>{log.interviewId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono font-medium truncate max-w-[120px]" title={log.userId}>{log.userId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{log.provider === 'google' ? '🔷 Google' : log.provider === 'openrouter' ? '🌐 OpenRouter' : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono font-medium">{log.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{log.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-background/80 ">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Clock className="w-4 h-4" />
              </div>
              Performance
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Latency</span>
                <span className="font-mono font-medium">{formatLatency(log.latencyMs)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">TTFT</span>
                <span className="font-mono font-medium">{log.timeToFirstToken ? formatLatency(log.timeToFirstToken) : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Input Tokens</span>
                <span className="font-mono font-medium text-cyan-600 dark:text-cyan-400">{log.tokenUsage.input}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Output Tokens</span>
                <span className="font-mono font-medium text-pink-600 dark:text-pink-400">{log.tokenUsage.output}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-background/80 ">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                <DollarSign className="w-4 h-4" />
              </div>
              Cost & Metadata
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estimated Cost</span>
                <span className="font-mono font-bold text-green-600 dark:text-green-400">{formatCost(log.estimatedCost)}</span>
              </div>
              {log.metadata?.streaming !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Streaming</span>
                  <span className="font-medium">{log.metadata.streaming ? 'Yes' : 'No'}</span>
                </div>
              )}
              {log.metadata?.stopReason && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Stop Reason</span>
                  <span className="font-mono">{log.metadata.stopReason}</span>
                </div>
              )}
              {log.metadata?.byokUsed && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">BYOK</span>
                  <span className="font-medium">Yes</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {log.status === 'error' && (log.errorMessage || log.errorCode) && (
        <Card className="border-0 shadow-sm bg-red-500/5 border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Error Details
            </h4>
            <div className="space-y-1 text-xs font-mono text-red-600/90 dark:text-red-400/90">
              {log.errorCode && <p><span className="opacity-70">Code:</span> {log.errorCode}</p>}
              {log.errorMessage && <p><span className="opacity-70">Message:</span> {log.errorMessage}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {log.searchQueries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Search className="w-4 h-4" />
            Search Queries
          </h4>
          <div className="flex flex-wrap gap-2">
            {log.searchQueries.map((query, i) => (
              <Badge key={i} variant="secondary" className="rounded-lg px-3 py-1 bg-secondary/50 text-xs font-normal">
                {query}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Zap className="w-4 h-4" />
          Prompt Preview
        </h4>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 font-mono text-xs overflow-x-auto max-h-32 text-muted-foreground">
          {log.prompt.slice(0, 500)}{log.prompt.length > 500 ? '...' : ''}
        </div>
      </div>
    </div>
  );
}


function LogDetailDialog({ logId, logSummary }: { logId: string; logSummary: AILogWithDetails }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fullLog, setFullLog] = useState<AILog | null>(null);
  const [isLoading, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !fullLog) {
      startTransition(async () => {
        const data = await getAILogById(logId);
        if (data && 'success' in data && data.success === false) return;
        setFullLog(data as AILog | null);
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary/80">
          <Eye className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-card">
        <DialogHeader className="p-6 border-b border-border/50 bg-secondary/10">
          <DialogTitle className="flex items-center gap-3 text-xl">
            AI Log Details
            {getStatusBadge(logSummary.status)}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="rounded-lg font-mono font-normal text-xs bg-background/50">
              {formatAction(logSummary.action)}
            </Badge>
            <span>•</span>
            <span className="font-mono text-xs">{logSummary.formattedTimestamp}</span>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[calc(85vh-100px)]">
          {isLoading || !fullLog ? (
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
              <Separator />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : (
            <LogDetailContent log={fullLog} formattedTimestamp={logSummary.formattedTimestamp} />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function LogDetailContent({ log, formattedTimestamp }: { log: AILog; formattedTimestamp: string }) {
  return (
    <div className="space-y-8 p-6 md:p-8">
      {log.status === 'error' && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            Error Details
          </h4>
          <div className="space-y-1 text-sm">
            {log.errorCode && <p><span className="text-muted-foreground">Code:</span> <code className="bg-red-500/10 px-1.5 py-0.5 rounded text-red-600 dark:text-red-400 font-mono text-xs">{log.errorCode}</code></p>}
            {log.errorMessage && <p><span className="text-muted-foreground">Message:</span> {log.errorMessage}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</p>
          <p className="font-mono text-sm">{formattedTimestamp}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</p>
          <p className="font-mono text-sm">{log.provider === 'google' ? '🔷 Google' : log.provider === 'openrouter' ? '🌐 OpenRouter' : '-'}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</p>
          <p className="font-mono text-sm truncate" title={log.model}>{log.model}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Latency</p>
          <p className="font-mono text-sm">{formatLatency(log.latencyMs)}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">TTFT</p>
          <p className="font-mono text-sm">{log.timeToFirstToken ? formatLatency(log.timeToFirstToken) : '-'}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Input Tokens</p>
          <p className="font-mono text-sm text-cyan-600 dark:text-cyan-400 font-medium">{log.tokenUsage.input}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Output Tokens</p>
          <p className="font-mono text-sm text-pink-600 dark:text-pink-400 font-medium">{log.tokenUsage.output}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. Cost</p>
          <p className="font-mono text-sm text-green-600 dark:text-green-400 font-bold">{formatCost(log.estimatedCost)}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tools</p>
          <p className="font-mono text-sm">{log.toolsUsed.length > 0 ? log.toolsUsed.join(', ') : '-'}</p>
        </div>
      </div>

      {log.metadata && (
        <>
          <Separator className="bg-border/50" />
          <div>
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Request Metadata
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              {log.metadata.streaming !== undefined && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Streaming</p>
                  <p className="font-mono">{log.metadata.streaming ? 'Yes' : 'No'}</p>
                </div>
              )}
              {log.metadata.byokUsed && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">BYOK</p>
                  <p className="font-mono">Yes</p>
                </div>
              )}
              {log.metadata.stopReason && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Stop Reason</p>
                  <p className="font-mono">{log.metadata.stopReason}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Separator className="bg-border/50" />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Interview ID</p>
          <p className="font-mono text-xs text-muted-foreground/80">{log.interviewId}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">User ID</p>
          <p className="font-mono text-xs text-muted-foreground/80">{log.userId}</p>
        </div>
      </div>

      {log.searchQueries.length > 0 && (
        <>
          <Separator className="bg-border/50" />
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Search Queries
            </h4>
            <div className="flex flex-wrap gap-2">
              {log.searchQueries.map((query, i) => (
                <Badge key={i} variant="secondary" className="rounded-lg px-3 py-1.5 bg-secondary/50 font-normal">
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator className="bg-border/50" />

      <Tabs defaultValue="response" className="w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-secondary/50  p-1 rounded-full inline-flex">
            <TabsList className="bg-transparent gap-1 h-auto p-0">
              <TabsTrigger
                value="response"
                className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Response
              </TabsTrigger>
              <TabsTrigger
                value="prompt"
                className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                Prompt
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="response" className="mt-0">
          {log.response ? (
            <div className="bg-muted/30 border border-border/50 p-6 rounded-2xl max-h-[500px] overflow-auto">
              {isJsonResponse(log.response) ? (
                <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/90">
                  {formatJsonResponse(log.response)}
                </pre>
              ) : (
                <StaticMarkdown content={log.response} className="text-sm prose dark:prose-invert max-w-none" />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border/50">
              <FileText className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No response recorded</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="prompt" className="mt-0">
          <div className="bg-muted/30 border border-border/50 p-6 rounded-2xl overflow-x-auto max-h-[500px]">
            <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/90">
              {log.prompt}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
