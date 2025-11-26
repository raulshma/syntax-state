'use client';

import { useState } from 'react';
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
import { 
  ChevronDown, ChevronUp, Eye, Search, Clock, Cpu, 
  AlertTriangle, CheckCircle, DollarSign, Code, FileText
} from 'lucide-react';
import { StaticMarkdown } from '@/components/streaming/markdown-renderer';
import type { AILogWithDetails } from '@/lib/actions/admin';

interface AILogViewerProps {
  logs: AILogWithDetails[];
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
      return <Badge variant="outline" className="text-green-500 border-green-500/50"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
    case 'error':
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
    case 'timeout':
      return <Badge variant="secondary" className="text-yellow-500"><Clock className="w-3 h-3 mr-1" />Timeout</Badge>;
    case 'rate_limited':
      return <Badge variant="secondary" className="text-orange-500">Rate Limited</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
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

export function AILogViewer({ logs }: AILogViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Tokens</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Latency</TableHead>
          <TableHead>Tools</TableHead>
          <TableHead className="w-[80px]">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <>
            <TableRow key={log._id} className={`cursor-pointer hover:bg-muted/50 ${log.status === 'error' ? 'bg-red-500/5' : ''}`}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleExpand(log._id)}
                >
                  {expandedId === log._id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {log.formattedTimestamp}
              </TableCell>
              <TableCell>
                {getStatusBadge(log.status)}
              </TableCell>
              <TableCell>
                <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-xs">
                  {formatAction(log.action)}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{log.model}</TableCell>
              <TableCell className="font-mono text-xs">
                <span className="text-green-500">{log.tokenUsage.input}</span>
                {' / '}
                <span className="text-blue-500">{log.tokenUsage.output}</span>
              </TableCell>
              <TableCell className="font-mono text-xs text-green-500">
                {formatCost(log.estimatedCost)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                <div className="flex flex-col">
                  <span>{log.latencyMs}ms</span>
                  {log.timeToFirstToken && (
                    <span className="text-[10px] text-muted-foreground">TTFT: {log.timeToFirstToken}ms</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {log.toolsUsed.length > 0 ? (
                  <Badge variant="outline" className="text-xs">
                    <Search className="w-3 h-3 mr-1" />
                    {log.toolsUsed.length}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell>
                <LogDetailDialog log={log} />
              </TableCell>
            </TableRow>
            {expandedId === log._id && (
              <TableRow key={`${log._id}-expanded`}>
                <TableCell colSpan={10} className="bg-muted/30 p-4">
                  <ExpandedLogContent log={log} />
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
}


function ExpandedLogContent({ log }: { log: AILogWithDetails }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Request Details
          </h4>
          <div className="space-y-1 text-xs">
            <p><span className="text-muted-foreground">Interview ID:</span> {log.interviewId}</p>
            <p><span className="text-muted-foreground">User ID:</span> {log.userId}</p>
            <p><span className="text-muted-foreground">Model:</span> {log.model}</p>
            <p><span className="text-muted-foreground">Status:</span> {log.status}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Performance
          </h4>
          <div className="space-y-1 text-xs">
            <p><span className="text-muted-foreground">Latency:</span> {log.latencyMs}ms</p>
            <p><span className="text-muted-foreground">Time to First Token:</span> {log.timeToFirstToken ?? '-'}ms</p>
            <p><span className="text-muted-foreground">Input Tokens:</span> {log.tokenUsage.input}</p>
            <p><span className="text-muted-foreground">Output Tokens:</span> {log.tokenUsage.output}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cost & Metadata
          </h4>
          <div className="space-y-1 text-xs">
            <p><span className="text-muted-foreground">Estimated Cost:</span> <span className="text-green-500">{formatCost(log.estimatedCost)}</span></p>
            {log.metadata?.streaming !== undefined && (
              <p><span className="text-muted-foreground">Streaming:</span> {log.metadata.streaming ? 'Yes' : 'No'}</p>
            )}
            {log.metadata?.stopReason && (
              <p><span className="text-muted-foreground">Stop Reason:</span> {log.metadata.stopReason}</p>
            )}
            {log.metadata?.byokUsed && (
              <p><span className="text-muted-foreground">BYOK:</span> Yes</p>
            )}
          </div>
        </div>
      </div>

      {log.status === 'error' && (log.errorMessage || log.errorCode) && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-4 h-4" />
            Error Details
          </h4>
          <div className="space-y-1 text-xs">
            {log.errorCode && <p><span className="text-muted-foreground">Code:</span> {log.errorCode}</p>}
            {log.errorMessage && <p><span className="text-muted-foreground">Message:</span> {log.errorMessage}</p>}
          </div>
        </div>
      )}
      
      {log.searchQueries.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Queries
          </h4>
          <div className="flex flex-wrap gap-2">
            {log.searchQueries.map((query, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {query}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h4 className="text-sm font-medium mb-2">Prompt Preview</h4>
        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-32">
          {log.prompt.slice(0, 500)}{log.prompt.length > 500 ? '...' : ''}
        </pre>
      </div>
    </div>
  );
}


function LogDetailDialog({ log }: { log: AILogWithDetails }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            AI Log: {formatAction(log.action)}
            {getStatusBadge(log.status)}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-6 p-4">
            {log.status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  Error Details
                </h4>
                <div className="space-y-1 text-sm">
                  {log.errorCode && <p><span className="text-muted-foreground">Code:</span> <code className="bg-red-500/20 px-1 rounded">{log.errorCode}</code></p>}
                  {log.errorMessage && <p><span className="text-muted-foreground">Message:</span> {log.errorMessage}</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Timestamp</p>
                <p className="font-mono text-sm">{log.formattedTimestamp}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="font-mono text-sm">{log.model}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Latency</p>
                <p className="font-mono text-sm">{log.latencyMs}ms</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Time to First Token</p>
                <p className="font-mono text-sm">{log.timeToFirstToken ?? '-'}ms</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Input Tokens</p>
                <p className="font-mono text-sm text-green-500">{log.tokenUsage.input}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Output Tokens</p>
                <p className="font-mono text-sm text-blue-500">{log.tokenUsage.output}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estimated Cost</p>
                <p className="font-mono text-sm text-green-500">{formatCost(log.estimatedCost)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tools Used</p>
                <p className="font-mono text-sm">{log.toolsUsed.join(', ') || 'None'}</p>
              </div>
            </div>

            {log.metadata && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Request Metadata</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
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
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Interview ID</p>
                <p className="font-mono text-xs">{log.interviewId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{log.userId}</p>
              </div>
            </div>

            {log.searchQueries.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Search Queries</h4>
                  <div className="flex flex-wrap gap-2">
                    {log.searchQueries.map((query, i) => (
                      <Badge key={i} variant="secondary">
                        {query}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <Tabs defaultValue="response" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="response" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Response
                </TabsTrigger>
                <TabsTrigger value="prompt" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Prompt
                </TabsTrigger>
              </TabsList>
              <TabsContent value="response" className="mt-4">
                {log.response ? (
                  <div className="bg-muted p-4 rounded-lg max-h-80 overflow-auto">
                    {isJsonResponse(log.response) ? (
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {formatJsonResponse(log.response)}
                      </pre>
                    ) : (
                      <StaticMarkdown content={log.response} className="text-sm" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No response recorded</p>
                )}
              </TabsContent>
              <TabsContent value="prompt" className="mt-4">
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-80">
                  {log.prompt}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
