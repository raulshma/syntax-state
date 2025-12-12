'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Server,
  Globe,
  Database,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DnsResolutionStep {
  id: string;
  name: string;
  server: string;
  query: string;
  response: string;
  timing: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const createDnsResolutionSteps = (domain: string): DnsResolutionStep[] => {
  const parts = domain.split('.');
  const tld = parts[parts.length - 1] || 'com';

  return [
    {
      id: 'browser-cache',
      name: 'Browser Cache',
      server: 'Local Browser',
      query: `Looking up ${domain} in browser cache`,
      response: 'Cache miss - not found',
      timing: 1,
      description: 'First, the browser checks its own cache to see if it recently looked up this domain.',
      icon: <Monitor className="w-5 h-5" />,
      color: 'blue',
    },
    {
      id: 'os-cache',
      name: 'OS Cache',
      server: 'Operating System',
      query: `Checking OS DNS cache for ${domain}`,
      response: 'Cache miss - not found',
      timing: 2,
      description: 'Next, the operating system checks its DNS cache (including the hosts file).',
      icon: <Database className="w-5 h-5" />,
      color: 'indigo',
    },
    {
      id: 'resolver',
      name: 'DNS Resolver',
      server: 'ISP/Configured Resolver (e.g., 8.8.8.8)',
      query: `Recursive query for ${domain}`,
      response: 'Starting recursive resolution...',
      timing: 10,
      description: 'The resolver (usually your ISP or a public DNS like Google/Cloudflare) begins the lookup process.',
      icon: <Server className="w-5 h-5" />,
      color: 'green',
    },
    {
      id: 'root',
      name: 'Root Server',
      server: 'Root DNS Server (a.root-servers.net)',
      query: `Where is .${tld}?`,
      response: `Refer to .${tld} TLD servers`,
      timing: 25,
      description: 'The resolver asks a root server. Root servers know where to find TLD (Top-Level Domain) servers.',
      icon: <Globe className="w-5 h-5" />,
      color: 'orange',
    },
    {
      id: 'tld',
      name: 'TLD Server',
      server: `.${tld} TLD Server`,
      query: `Where is ${domain}?`,
      response: `Refer to authoritative nameserver for ${domain}`,
      timing: 30,
      description: `The TLD server for .${tld} knows which nameservers are authoritative for ${domain}.`,
      icon: <Server className="w-5 h-5" />,
      color: 'purple',
    },
    {
      id: 'authoritative',
      name: 'Authoritative Server',
      server: `ns1.${domain}`,
      query: `What is the IP for ${domain}?`,
      response: `A record: 93.184.216.34`,
      timing: 15,
      description: 'The authoritative nameserver has the actual DNS records and returns the IP address.',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'cyan',
    },
  ];
};

// Default steps for export
export const dnsResolutionSteps = createDnsResolutionSteps('example.com');

interface DnsResolutionSimulatorProps {
  domain?: string;
  showTiming?: boolean;
  interactive?: boolean;
}

export function DnsResolutionSimulator({
  domain: initialDomain = 'example.com',
  showTiming = true,
  interactive = true,
}: DnsResolutionSimulatorProps) {
  const [domain, setDomain] = useState(initialDomain);
  const [steps, setSteps] = useState(() => createDnsResolutionSteps(initialDomain));
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const speedMultipliers: Record<string, number> = {
    slow: 2,
    normal: 1,
    fast: 0.5,
  };

  const multiplier = speedMultipliers[speed];

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-500' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500', text: 'text-indigo-500' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-500' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-500' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-500' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500', text: 'text-cyan-500' },
  };

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setCompletedSteps(new Set());
  }, []);

  const handleDomainChange = (newDomain: string) => {
    setDomain(newDomain);
    setSteps(createDnsResolutionSteps(newDomain));
    handleReset();
  };

  const handleNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCompletedSteps((prev) => new Set([...prev, steps[nextStep].id]));
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, steps]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= steps.length - 1) {
      // Use setTimeout to avoid synchronous setState in effect
      const stopTimer = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(stopTimer);
    }

    const timeout = setTimeout(() => {
      handleNextStep();
    }, 1500 * multiplier);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentStep, multiplier, steps.length, handleNextStep]);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      handleReset();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(true);
      if (currentStep === -1) {
        handleNextStep();
      }
    }
  };

  const totalTime = steps.reduce((acc, step) => acc + step.timing, 0);
  const elapsedTime = steps
    .filter((step) => completedSteps.has(step.id))
    .reduce((acc, step) => acc + step.timing, 0);

  const currentStepData = currentStep >= 0 ? steps[currentStep] : null;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          DNS Resolution Simulator
        </h3>

        {/* Domain input */}
        <div className="flex items-center gap-2">
          <Input
            value={domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            placeholder="Enter domain..."
            className="w-[180px] h-9"
          />
        </div>
      </div>

      {/* Visual flow diagram */}
      <div className="relative p-6 rounded-xl border border-border bg-card overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color];
            const isActive = currentStep === index;
            const isCompleted = completedSteps.has(step.id);
            const isPending = !isCompleted && currentStep < index;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step node */}
                <motion.div
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer',
                    isActive && `${colors.bg} border-2 ${colors.border}`,
                    isCompleted && !isActive && `${colors.bg} border border-${step.color}-500/30`,
                    isPending && 'opacity-50'
                  )}
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  onClick={() => interactive && setCurrentStep(index)}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isActive || isCompleted ? colors.text : 'text-muted-foreground',
                      isActive ? colors.bg : 'bg-secondary'
                    )}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium text-center max-w-[80px]">
                    {step.name}
                  </span>
                  {showTiming && isCompleted && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.timing}ms
                    </span>
                  )}
                </motion.div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="relative mx-1 w-8">
                    <div className="h-0.5 bg-border" />
                    {isCompleted && currentStep > index && (
                      <motion.div
                        className={cn('absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full', colors.text.replace('text-', 'bg-'))}
                        initial={{ left: '0%' }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current step details */}
      <AnimatePresence mode="wait">
        {currentStepData && (
          <motion.div
            key={currentStepData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  colorClasses[currentStepData.color].bg,
                  colorClasses[currentStepData.color].text
                )}
              >
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold">
                  Step {currentStep + 1}: {currentStepData.name}
                </h4>
                <p className="text-sm text-muted-foreground">{currentStepData.server}</p>
              </div>
              {showTiming && (
                <div className="text-right">
                  <span className="text-sm font-medium text-primary">
                    +{currentStepData.timing}ms
                  </span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground mb-4">{currentStepData.description}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  Query
                </span>
                <code className="text-sm">{currentStepData.query}</code>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  Response
                </span>
                <code className="text-sm">{currentStepData.response}</code>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt when not started */}
      {currentStep === -1 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>👆 Press Play to see how DNS resolution works step by step</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/30">
        {/* Timing info */}
        {showTiming && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Total time: <span className="font-medium text-foreground">{elapsedTime}ms</span> / {totalTime}ms
            </span>
            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(elapsedTime / totalTime) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Control buttons */}
        <div className="flex items-center gap-2">
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
            onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          {/* Next step (manual) */}
          {interactive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextStep}
              disabled={currentStep >= steps.length - 1}
              className="h-8 w-8 p-0"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          )}

          {/* Reset */}
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
