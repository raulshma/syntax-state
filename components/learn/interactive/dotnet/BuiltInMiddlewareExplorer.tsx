'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  FileText,
  Route,
  Globe,
  UserCheck,
  Key,
  Zap,
  Archive,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Code,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface BuiltInMiddlewareExplorerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

interface MiddlewareInfo {
  id: string;
  name: string;
  method: string;
  category: 'security' | 'performance' | 'routing' | 'processing';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  shortDescription: string;
  fullDescription: string;
  useCase: string;
  codeExample: string;
  order: number;
  isRecommendedOrder: boolean;
}

const builtInMiddleware: MiddlewareInfo[] = [
  {
    id: 'exception-handler',
    name: 'Exception Handler',
    method: 'UseExceptionHandler()',
    category: 'processing',
    icon: Shield,
    color: 'bg-red-500',
    shortDescription: 'Catches unhandled exceptions globally',
    fullDescription: 'The Exception Handler middleware catches any unhandled exceptions that occur during the processing of a request. It should be placed early in the pipeline to catch exceptions from all subsequent middleware.',
    useCase: 'Display friendly error pages to users instead of ugly stack traces in production.',
    codeExample: `app.UseExceptionHandler("/Error");
// Or with a lambda:
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("An error occurred");
    });
});`,
    order: 1,
    isRecommendedOrder: true,
  },
  {
    id: 'hsts',
    name: 'HSTS',
    method: 'UseHsts()',
    category: 'security',
    icon: Lock,
    color: 'bg-yellow-500',
    shortDescription: 'Adds HTTP Strict Transport Security header',
    fullDescription: 'HSTS (HTTP Strict Transport Security) middleware tells browsers to only access your site over HTTPS. This prevents man-in-the-middle attacks and protocol downgrade attempts.',
    useCase: 'Enforce HTTPS-only connections for production environments.',
    codeExample: `if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}`,
    order: 2,
    isRecommendedOrder: true,
  },
  {
    id: 'https-redirection',
    name: 'HTTPS Redirection',
    method: 'UseHttpsRedirection()',
    category: 'security',
    icon: Lock,
    color: 'bg-yellow-600',
    shortDescription: 'Redirects HTTP requests to HTTPS',
    fullDescription: 'Automatically redirects any HTTP requests to their HTTPS equivalent. This ensures all traffic is encrypted.',
    useCase: 'Ensure all visitors use secure connections.',
    codeExample: `app.UseHttpsRedirection();`,
    order: 3,
    isRecommendedOrder: true,
  },
  {
    id: 'static-files',
    name: 'Static Files',
    method: 'UseStaticFiles()',
    category: 'processing',
    icon: FileText,
    color: 'bg-green-500',
    shortDescription: 'Serves static files (CSS, JS, images)',
    fullDescription: 'Serves static files from the wwwroot folder (or a configured folder) without requiring any controller action. Requests for static files are short-circuited here.',
    useCase: 'Serve CSS, JavaScript, images, and other static assets efficiently.',
    codeExample: `app.UseStaticFiles();
// With custom options:
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "MyStaticFiles")),
    RequestPath = "/static"
});`,
    order: 4,
    isRecommendedOrder: true,
  },
  {
    id: 'routing',
    name: 'Routing',
    method: 'UseRouting()',
    category: 'routing',
    icon: Route,
    color: 'bg-blue-500',
    shortDescription: 'Matches request URL to endpoints',
    fullDescription: 'Marks the position in the middleware pipeline where a routing decision is made. It matches the incoming URL to registered endpoints but does not execute them yet.',
    useCase: 'Enable URL-based request routing to controllers or minimal APIs.',
    codeExample: `app.UseRouting();
// Endpoints are defined with:
app.MapControllers();
app.MapGet("/hello", () => "Hello World!");`,
    order: 5,
    isRecommendedOrder: true,
  },
  {
    id: 'cors',
    name: 'CORS',
    method: 'UseCors()',
    category: 'security',
    icon: Globe,
    color: 'bg-purple-500',
    shortDescription: 'Configures Cross-Origin Resource Sharing',
    fullDescription: 'CORS middleware allows you to control which origins (domains) can access your API. This is essential when your frontend and backend are on different domains.',
    useCase: 'Allow your React/Angular frontend on localhost:3000 to call your API on localhost:5000.',
    codeExample: `// In Program.cs:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("https://myapp.com")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Then in pipeline:
app.UseCors("AllowFrontend");`,
    order: 6,
    isRecommendedOrder: true,
  },
  {
    id: 'authentication',
    name: 'Authentication',
    method: 'UseAuthentication()',
    category: 'security',
    icon: UserCheck,
    color: 'bg-indigo-500',
    shortDescription: 'Validates user identity (who are you?)',
    fullDescription: 'Authentication middleware reads and validates identity information from the request (like JWT tokens or cookies). It sets the User property on HttpContext.',
    useCase: 'Identify who is making the request before checking what they can do.',
    codeExample: `app.UseAuthentication();
// Must come BEFORE UseAuthorization()`,
    order: 7,
    isRecommendedOrder: true,
  },
  {
    id: 'authorization',
    name: 'Authorization',
    method: 'UseAuthorization()',
    category: 'security',
    icon: Key,
    color: 'bg-pink-500',
    shortDescription: 'Checks user permissions (can you do this?)',
    fullDescription: 'Authorization middleware checks if the authenticated user has permission to access the requested resource. Works with [Authorize] attributes and policies.',
    useCase: 'Ensure only admins can access admin endpoints, or only owners can edit their resources.',
    codeExample: `app.UseAuthorization();
// Must come AFTER UseAuthentication()`,
    order: 8,
    isRecommendedOrder: true,
  },
  {
    id: 'response-compression',
    name: 'Response Compression',
    method: 'UseResponseCompression()',
    category: 'performance',
    icon: Zap,
    color: 'bg-orange-500',
    shortDescription: 'Compresses responses (gzip, brotli)',
    fullDescription: 'Compresses response bodies using gzip or brotli compression before sending to the client. Reduces bandwidth and improves load times for text-based responses.',
    useCase: 'Speed up API responses and reduce bandwidth costs.',
    codeExample: `// In Program.cs:
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

// In pipeline (early):
app.UseResponseCompression();`,
    order: 0,
    isRecommendedOrder: false,
  },
  {
    id: 'response-caching',
    name: 'Response Caching',
    method: 'UseResponseCaching()',
    category: 'performance',
    icon: Archive,
    color: 'bg-cyan-500',
    shortDescription: 'Caches responses for identical requests',
    fullDescription: 'Stores responses in memory and serves cached versions for identical subsequent requests. Respects HTTP caching headers like Cache-Control.',
    useCase: 'Reduce database load by caching GET responses that rarely change.',
    codeExample: `builder.Services.AddResponseCaching();

app.UseResponseCaching();

// On a controller action:
[ResponseCache(Duration = 60)]
public IActionResult GetData() => Ok(data);`,
    order: 0,
    isRecommendedOrder: false,
  },
  {
    id: 'session',
    name: 'Session',
    method: 'UseSession()',
    category: 'processing',
    icon: Clock,
    color: 'bg-teal-500',
    shortDescription: 'Enables session state storage',
    fullDescription: 'Session middleware enables server-side session storage. It uses cookies to track session IDs and stores session data in memory or a distributed cache.',
    useCase: 'Store user preferences or shopping cart data across requests.',
    codeExample: `// In Program.cs:
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// In pipeline (after routing):
app.UseSession();`,
    order: 0,
    isRecommendedOrder: false,
  },
];

const categoryColors: Record<string, string> = {
  security: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  performance: 'bg-green-500/20 text-green-400 border-green-500/30',
  routing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const categoryLabels: Record<string, string> = {
  security: '🔒 Security',
  performance: '⚡ Performance',
  routing: '🛤️ Routing',
  processing: '⚙️ Processing',
};

export function BuiltInMiddlewareExplorer({
  mode = 'beginner',
  title = 'Built-in ASP.NET Core Middleware',
}: BuiltInMiddlewareExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [enabledMiddleware, setEnabledMiddleware] = useState<Set<string>>(
    new Set(['exception-handler', 'https-redirection', 'static-files', 'routing', 'authentication', 'authorization'])
  );

  const categories = ['security', 'performance', 'routing', 'processing'];
  
  const filteredMiddleware = selectedCategory
    ? builtInMiddleware.filter(m => m.category === selectedCategory)
    : builtInMiddleware;

  // Sort by recommended order
  const sortedMiddleware = [...filteredMiddleware].sort((a, b) => {
    if (a.isRecommendedOrder && b.isRecommendedOrder) return a.order - b.order;
    if (a.isRecommendedOrder) return -1;
    if (b.isRecommendedOrder) return 1;
    return 0;
  });

  const toggleMiddleware = (id: string) => {
    setEnabledMiddleware(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-200 mb-2">🧰 Think of Middleware like a Toolbox</h4>
            <p className="text-sm text-gray-400">
              ASP.NET Core comes with pre-built tools for common tasks. 
              Instead of building everything from scratch, you can just pick the tools you need!
            </p>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={cn('text-xs', selectedCategory === cat && categoryColors[cat])}
            >
              {categoryLabels[cat]}
            </Button>
          ))}
        </div>

        {/* Middleware Grid */}
        <div className="space-y-2">
          {sortedMiddleware.map((mw, index) => {
            const Icon = mw.icon;
            const isExpanded = expandedId === mw.id;
            const isEnabled = enabledMiddleware.has(mw.id);

            return (
              <motion.div
                key={mw.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={cn(
                    'rounded-lg border transition-all duration-200',
                    isEnabled ? 'border-gray-700 bg-gray-900/50' : 'border-gray-800 bg-gray-950 opacity-60'
                  )}
                >
                  {/* Header */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800/50"
                    onClick={() => setExpandedId(isExpanded ? null : mw.id)}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', mw.color)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{mw.name}</span>
                        <Badge variant="outline" className={cn('text-xs', categoryColors[mw.category])}>
                          {mw.category}
                        </Badge>
                        {mw.isRecommendedOrder && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            #{mw.order}
                          </Badge>
                        )}
                      </div>
                      <code className="text-xs text-cyan-400">{mw.method}</code>
                    </div>

                    {mode !== 'beginner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMiddleware(mw.id);
                        }}
                        className={cn(
                          'h-7 px-2',
                          isEnabled ? 'text-green-400' : 'text-gray-500'
                        )}
                      >
                        <CheckCircle2 className={cn('h-4 w-4', isEnabled && 'fill-green-400/20')} />
                      </Button>
                    )}

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-3 border-t border-gray-800 pt-3">
                          {/* Short Description */}
                          <p className="text-sm text-gray-300">
                            {mode === 'beginner' ? mw.shortDescription : mw.fullDescription}
                          </p>

                          {/* Use Case */}
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Info className="h-3 w-3 text-blue-400" />
                              <span className="text-xs font-medium text-blue-400">Use Case</span>
                            </div>
                            <p className="text-xs text-gray-400">{mw.useCase}</p>
                          </div>

                          {/* Code Example (not for beginner) */}
                          {mode !== 'beginner' && (
                            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-3 w-3 text-green-400" />
                                <span className="text-xs font-medium text-green-400">Code Example</span>
                              </div>
                              <pre className="text-gray-300 whitespace-pre-wrap overflow-x-auto">
                                {mw.codeExample}
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pipeline Preview for Intermediate/Advanced */}
        {mode !== 'beginner' && (
          <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-200 mb-3 flex items-center gap-2">
              <Route className="h-4 w-4 text-blue-400" />
              Your Enabled Middleware Pipeline
            </h4>
            <div className="flex flex-wrap gap-2">
              {builtInMiddleware
                .filter(m => enabledMiddleware.has(m.id))
                .sort((a, b) => {
                  if (a.isRecommendedOrder && b.isRecommendedOrder) return a.order - b.order;
                  if (a.isRecommendedOrder) return -1;
                  if (b.isRecommendedOrder) return 1;
                  return 0;
                })
                .map((mw, index, arr) => (
                  <div key={mw.id} className="flex items-center gap-1">
                    <Badge className={cn('text-xs', mw.color, 'text-white')}>
                      {mw.method.replace('()', '')}
                    </Badge>
                    {index < arr.length - 1 && (
                      <span className="text-gray-500">→</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BuiltInMiddlewareExplorer;
