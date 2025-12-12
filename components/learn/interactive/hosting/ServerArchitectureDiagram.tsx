'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Server, 
  Globe, 
  Cloud,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type DiagramType = 'basic' | 'load-balanced' | 'cdn' | 'microservices';

interface ServerArchitectureDiagramProps {
  type?: DiagramType;
  autoPlay?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
}

const speedMultipliers: Record<string, number> = {
  slow: 2,
  normal: 1,
  fast: 0.5,
};

const diagramLabels: Record<DiagramType, string> = {
  basic: 'Basic Hosting: Domain → Server → Browser',
  'load-balanced': 'Load Balanced: Traffic distributed across servers',
  cdn: 'CDN: Content delivered from edge locations',
  microservices: 'Microservices: Distributed service architecture',
};

export function ServerArchitectureDiagram({ 
  type: initialType = 'basic',
  autoPlay = true,
  speed: initialSpeed = 'normal'
}: ServerArchitectureDiagramProps) {
  const [type, setType] = useState<DiagramType>(initialType);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>(initialSpeed);
  const multiplier = speedMultipliers[speed];

  const handleReset = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Diagram content */}
      <div className="relative p-6 min-h-[320px]">
        {type === 'basic' && (
          <BasicArchitectureDiagram isPlaying={isPlaying} multiplier={multiplier} />
        )}
        {type === 'load-balanced' && (
          <LoadBalancedDiagram isPlaying={isPlaying} multiplier={multiplier} />
        )}
        {type === 'cdn' && (
          <CDNDiagram isPlaying={isPlaying} multiplier={multiplier} />
        )}
        {type === 'microservices' && (
          <MicroservicesDiagram isPlaying={isPlaying} multiplier={multiplier} />
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-3 border-t border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground">
          {diagramLabels[type]}
        </span>
        
        <div className="flex items-center gap-2">
          {/* Diagram type selector */}
          <Select value={type} onValueChange={(v) => setType(v as DiagramType)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="load-balanced">Load Balanced</SelectItem>
              <SelectItem value="cdn">CDN</SelectItem>
              <SelectItem value="microservices">Microservices</SelectItem>
            </SelectContent>
          </Select>

          {/* Speed selector */}
          <Select value={speed} onValueChange={(v) => setSpeed(v as 'slow' | 'normal' | 'fast')}>
            <SelectTrigger className="w-[90px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slow">Slow</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="fast">Fast</SelectItem>
            </SelectContent>
          </Select>

          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          {/* Reset */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Basic Architecture: Domain → Hosting Server → Browser
function BasicArchitectureDiagram({ 
  isPlaying, 
  multiplier 
}: { 
  isPlaying: boolean; 
  multiplier: number;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 5);
    }, 1500 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier]);

  const steps = [
    'User types domain name',
    'DNS resolves to IP address',
    'Request sent to hosting server',
    'Server processes and responds',
    'Browser renders the page',
  ];

  return (
    <div className="space-y-6">
      {/* Visual diagram */}
      <div className="flex items-center justify-between">
        {/* User/Browser */}
        <div className="flex flex-col items-center gap-2">
          <motion.div 
            className={cn(
              'p-4 rounded-xl transition-colors',
              step === 0 || step === 4 
                ? 'bg-primary/20 border-2 border-primary' 
                : 'bg-primary/10 border border-primary/30'
            )}
            animate={{ scale: step === 0 || step === 4 ? 1.05 : 1 }}
          >
            <Monitor className="w-8 h-8 text-primary" />
          </motion.div>
          <span className="text-xs font-medium text-muted-foreground">Browser</span>
        </div>

        {/* Arrow 1: Browser to DNS */}
        <div className="flex-1 mx-2 relative">
          <div className="h-0.5 bg-border" />
          {isPlaying && step === 1 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 0.8 * multiplier, ease: 'linear' }}
            />
          )}
        </div>

        {/* DNS */}
        <div className="flex flex-col items-center gap-2">
          <motion.div 
            className={cn(
              'p-4 rounded-xl transition-colors',
              step === 1 
                ? 'bg-blue-500/20 border-2 border-blue-500' 
                : 'bg-blue-500/10 border border-blue-500/30'
            )}
            animate={{ scale: step === 1 ? 1.05 : 1 }}
          >
            <Globe className="w-8 h-8 text-blue-500" />
          </motion.div>
          <span className="text-xs font-medium text-muted-foreground">DNS</span>
        </div>

        {/* Arrow 2: DNS to Server */}
        <div className="flex-1 mx-2 relative">
          <div className="h-0.5 bg-border" />
          {isPlaying && step === 2 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 0.8 * multiplier, ease: 'linear' }}
            />
          )}
        </div>

        {/* Hosting Server */}
        <div className="flex flex-col items-center gap-2">
          <motion.div 
            className={cn(
              'p-4 rounded-xl transition-colors',
              step === 2 || step === 3 
                ? 'bg-green-500/20 border-2 border-green-500' 
                : 'bg-green-500/10 border border-green-500/30'
            )}
            animate={{ scale: step === 2 || step === 3 ? 1.05 : 1 }}
          >
            <Server className="w-8 h-8 text-green-500" />
          </motion.div>
          <span className="text-xs font-medium text-muted-foreground">Hosting Server</span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              step === i ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Current step description */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-3 rounded-lg bg-secondary/50"
      >
        <span className="text-sm font-medium">
          Step {step + 1}: {steps[step]}
        </span>
      </motion.div>
    </div>
  );
}

// Load Balanced Architecture
function LoadBalancedDiagram({ 
  isPlaying, 
  multiplier 
}: { 
  isPlaying: boolean; 
  multiplier: number;
}) {
  const [activeServer, setActiveServer] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveServer((s) => (s + 1) % 3);
    }, 1200 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Users */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">Users</span>
        </div>

        {/* Arrow to Load Balancer */}
        <div className="flex-1 mx-4 relative">
          <div className="h-0.5 bg-border" />
          {isPlaying && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 1 * multiplier, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>

        {/* Load Balancer */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <Cloud className="w-6 h-6 text-yellow-500" />
          </div>
          <span className="text-xs text-muted-foreground">Load Balancer</span>
        </div>

        {/* Arrows to Servers */}
        <div className="flex-1 mx-4 flex flex-col gap-4 relative">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative h-0.5 bg-border">
              {isPlaying && activeServer === i && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 0.6 * multiplier, ease: 'linear' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Server Pool */}
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'p-2 rounded-lg transition-colors',
                activeServer === i
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : 'bg-green-500/10 border border-green-500/30'
              )}
              animate={{ scale: activeServer === i ? 1.1 : 1 }}
            >
              <Server className="w-5 h-5 text-green-500" />
            </motion.div>
          ))}
          <span className="text-xs text-muted-foreground text-center">Servers</span>
        </div>
      </div>

      <div className="text-center p-3 rounded-lg bg-secondary/50">
        <span className="text-sm text-muted-foreground">
          Load balancer distributes traffic across multiple servers for better performance and reliability
        </span>
      </div>
    </div>
  );
}

// CDN Architecture
function CDNDiagram({ 
  isPlaying, 
  multiplier 
}: { 
  isPlaying: boolean; 
  multiplier: number;
}) {
  const [activeEdge, setActiveEdge] = useState(0);
  const edges = ['US West', 'US East', 'Europe', 'Asia'];

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveEdge((s) => (s + 1) % edges.length);
    }, 1500 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier, edges.length]);

  return (
    <div className="space-y-4">
      {/* Origin server in center */}
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <Server className="w-8 h-8 text-green-500" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Origin Server</span>
        </div>
      </div>

      {/* Edge locations */}
      <div className="grid grid-cols-4 gap-4">
        {edges.map((edge, i) => (
          <motion.div
            key={edge}
            className="flex flex-col items-center gap-2"
            animate={{ scale: activeEdge === i ? 1.05 : 1 }}
          >
            <div className={cn(
              'p-3 rounded-xl transition-colors',
              activeEdge === i
                ? 'bg-blue-500/20 border-2 border-blue-500'
                : 'bg-blue-500/10 border border-blue-500/30'
            )}>
              <Cloud className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs text-muted-foreground">{edge}</span>
            {activeEdge === i && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-green-500 font-medium"
              >
                Serving user
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="text-center p-3 rounded-lg bg-secondary/50">
        <span className="text-sm text-muted-foreground">
          CDN caches content at edge locations worldwide, serving users from the nearest location
        </span>
      </div>
    </div>
  );
}

// Microservices Architecture
function MicroservicesDiagram({ 
  isPlaying, 
  multiplier 
}: { 
  isPlaying: boolean; 
  multiplier: number;
}) {
  const [activeService, setActiveService] = useState(0);
  const services = [
    { name: 'Auth', color: 'blue' },
    { name: 'Users', color: 'green' },
    { name: 'Products', color: 'purple' },
    { name: 'Orders', color: 'orange' },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveService((s) => (s + 1) % services.length);
    }, 1200 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier, services.length]);

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-500' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-500' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-500' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-500' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* API Gateway */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">API Gateway</span>
        </div>

        {/* Connection lines */}
        <div className="flex-1 mx-4 flex flex-col gap-2">
          {services.map((_, i) => (
            <div key={i} className="h-0.5 bg-border relative">
              {isPlaying && activeService === i && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 0.5 * multiplier, ease: 'linear' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Microservices */}
        <div className="flex flex-col gap-2">
          {services.map((service, i) => {
            const colors = colorClasses[service.color];
            return (
              <motion.div
                key={service.name}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg transition-colors',
                  colors.bg,
                  activeService === i ? `border-2 ${colors.border}` : 'border border-border/50'
                )}
                animate={{ scale: activeService === i ? 1.05 : 1 }}
              >
                <Server className={cn('w-4 h-4', colors.text)} />
                <span className="text-xs font-medium">{service.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-center p-3 rounded-lg bg-secondary/50">
        <span className="text-sm text-muted-foreground">
          Microservices architecture splits functionality into independent services that communicate via APIs
        </span>
      </div>
    </div>
  );
}
