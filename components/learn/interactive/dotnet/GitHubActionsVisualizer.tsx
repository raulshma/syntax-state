'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Play, 
  CheckCircle2, 
  Clock, 
  Box, 
  Settings,
  Code,
  TestTube,
  Package,
  Rocket,
  Copy,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export interface GitHubActionsVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  showYaml?: boolean;
  interactive?: boolean;
}

interface WorkflowStep {
  id: string;
  name: string;
  uses?: string;
  run?: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: number;
}

interface WorkflowJob {
  id: string;
  name: string;
  runsOn: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'success' | 'failed';
  dependsOn?: string[];
}

const getBeginnerWorkflow = (): WorkflowJob[] => [
  {
    id: 'build',
    name: 'Build & Test',
    runsOn: 'ubuntu-latest',
    status: 'pending',
    steps: [
      { id: 'checkout', name: 'Checkout Code', uses: 'actions/checkout@v4', icon: <GitBranch className="w-4 h-4" />, status: 'pending' },
      { id: 'setup', name: 'Setup .NET', uses: 'actions/setup-dotnet@v4', icon: <Settings className="w-4 h-4" />, status: 'pending' },
      { id: 'restore', name: 'Restore Dependencies', run: 'dotnet restore', icon: <Package className="w-4 h-4" />, status: 'pending' },
      { id: 'build', name: 'Build Project', run: 'dotnet build --no-restore', icon: <Box className="w-4 h-4" />, status: 'pending' },
      { id: 'test', name: 'Run Tests', run: 'dotnet test --no-build', icon: <TestTube className="w-4 h-4" />, status: 'pending' },
    ]
  }
];

const getIntermediateWorkflow = (): WorkflowJob[] => [
  {
    id: 'build',
    name: 'Build',
    runsOn: 'ubuntu-latest',
    status: 'pending',
    steps: [
      { id: 'checkout', name: 'Checkout Code', uses: 'actions/checkout@v4', icon: <GitBranch className="w-4 h-4" />, status: 'pending' },
      { id: 'setup', name: 'Setup .NET 8', uses: 'actions/setup-dotnet@v4', icon: <Settings className="w-4 h-4" />, status: 'pending' },
      { id: 'cache', name: 'Cache NuGet', uses: 'actions/cache@v4', icon: <Package className="w-4 h-4" />, status: 'pending' },
      { id: 'restore', name: 'Restore', run: 'dotnet restore', icon: <Package className="w-4 h-4" />, status: 'pending' },
      { id: 'build', name: 'Build', run: 'dotnet build -c Release', icon: <Box className="w-4 h-4" />, status: 'pending' },
    ]
  },
  {
    id: 'test',
    name: 'Test',
    runsOn: 'ubuntu-latest',
    status: 'pending',
    dependsOn: ['build'],
    steps: [
      { id: 'checkout', name: 'Checkout', uses: 'actions/checkout@v4', icon: <GitBranch className="w-4 h-4" />, status: 'pending' },
      { id: 'test', name: 'Run Tests', run: 'dotnet test --collect:"XPlat Code Coverage"', icon: <TestTube className="w-4 h-4" />, status: 'pending' },
      { id: 'upload', name: 'Upload Coverage', uses: 'codecov/codecov-action@v4', icon: <Rocket className="w-4 h-4" />, status: 'pending' },
    ]
  },
  {
    id: 'publish',
    name: 'Publish Artifacts',
    runsOn: 'ubuntu-latest',
    status: 'pending',
    dependsOn: ['test'],
    steps: [
      { id: 'publish', name: 'Publish', run: 'dotnet publish -c Release -o ./publish', icon: <Package className="w-4 h-4" />, status: 'pending' },
      { id: 'upload', name: 'Upload Artifact', uses: 'actions/upload-artifact@v4', icon: <Rocket className="w-4 h-4" />, status: 'pending' },
    ]
  }
];

const getAdvancedWorkflow = (): WorkflowJob[] => [
  {
    id: 'build-matrix',
    name: 'Build (Matrix)',
    runsOn: 'ubuntu-latest',
    status: 'pending',
    steps: [
      { id: 'checkout', name: 'Checkout', uses: 'actions/checkout@v4', icon: <GitBranch className="w-4 h-4" />, status: 'pending' },
      { id: 'setup', name: 'Setup .NET ${{ matrix.dotnet }}', uses: 'actions/setup-dotnet@v4', icon: <Settings className="w-4 h-4" />, status: 'pending' },
      { id: 'build', name: 'Build & Test', run: 'dotnet build && dotnet test', icon: <Box className="w-4 h-4" />, status: 'pending' },
    ]
  },
  {
    id: 'security',
    name: 'Security Scan',
    runsOn: 'ubuntu-latest',
    status: 'pending',
    dependsOn: ['build-matrix'],
    steps: [
      { id: 'scan', name: 'CodeQL Analysis', uses: 'github/codeql-action/analyze@v3', icon: <TestTube className="w-4 h-4" />, status: 'pending' },
      { id: 'deps', name: 'Dependency Review', uses: 'actions/dependency-review-action@v4', icon: <Package className="w-4 h-4" />, status: 'pending' },
    ]
  },
  {
    id: 'deploy-staging',
    name: 'Deploy to Staging',
    runsOn: 'ubuntu-latest',
    status: 'pending',
    dependsOn: ['security'],
    steps: [
      { id: 'login', name: 'Azure Login', uses: 'azure/login@v2', icon: <Settings className="w-4 h-4" />, status: 'pending' },
      { id: 'deploy', name: 'Deploy to App Service', uses: 'azure/webapps-deploy@v3', icon: <Rocket className="w-4 h-4" />, status: 'pending' },
    ]
  },
  {
    id: 'deploy-prod',
    name: 'Deploy to Production',
    runsOn: 'ubuntu-latest',
    status: 'pending',
    dependsOn: ['deploy-staging'],
    steps: [
      { id: 'approval', name: 'Manual Approval', run: '# Requires environment approval', icon: <CheckCircle2 className="w-4 h-4" />, status: 'pending' },
      { id: 'deploy', name: 'Deploy to Production', uses: 'azure/webapps-deploy@v3', icon: <Rocket className="w-4 h-4" />, status: 'pending' },
    ]
  }
];

const generateYaml = (jobs: WorkflowJob[], mode: string): string => {
  const trigger = mode === 'advanced' 
    ? `on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:`
    : `on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]`;

  const matrix = mode === 'advanced' 
    ? `
    strategy:
      matrix:
        dotnet: ['6.0.x', '7.0.x', '8.0.x']
        os: [ubuntu-latest, windows-latest]`
    : '';

  const jobsYaml = jobs.map(job => {
    const needs = job.dependsOn?.length ? `\n    needs: [${job.dependsOn.join(', ')}]` : '';
    const stepsYaml = job.steps.map(step => {
      if (step.uses) {
        return `      - name: ${step.name}
        uses: ${step.uses}`;
      }
      return `      - name: ${step.name}
        run: ${step.run}`;
    }).join('\n');

    return `  ${job.id}:
    name: ${job.name}
    runs-on: ${job.runsOn}${needs}${job.id === 'build-matrix' ? matrix : ''}
    steps:
${stepsYaml}`;
  }).join('\n\n');

  return `name: .NET CI/CD Pipeline

${trigger}

jobs:
${jobsYaml}`;
};

export function GitHubActionsVisualizer({ 
  mode = 'beginner',
  showYaml = true,
  interactive = true 
}: GitHubActionsVisualizerProps) {
  const getInitialWorkflow = useCallback(() => {
    switch (mode) {
      case 'intermediate': return getIntermediateWorkflow();
      case 'advanced': return getAdvancedWorkflow();
      default: return getBeginnerWorkflow();
    }
  }, [mode]);

  const [workflow, setWorkflow] = useState<WorkflowJob[]>(getInitialWorkflow());
  const [isRunning, setIsRunning] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set(workflow.map(j => j.id)));
  const [copied, setCopied] = useState(false);

  const resetWorkflow = useCallback(() => {
    setWorkflow(getInitialWorkflow());
    setIsRunning(false);
  }, [getInitialWorkflow]);

  const runWorkflow = async () => {
    if (isRunning) return;
    
    resetWorkflow();
    setIsRunning(true);

    const newWorkflow = getInitialWorkflow();
    
    for (const job of newWorkflow) {
      // Check dependencies
      if (job.dependsOn) {
        const depsComplete = job.dependsOn.every(depId => 
          newWorkflow.find(j => j.id === depId)?.status === 'success'
        );
        if (!depsComplete) continue;
      }

      job.status = 'running';
      setWorkflow([...newWorkflow]);
      
      for (const step of job.steps) {
        step.status = 'running';
        setWorkflow([...newWorkflow]);
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
        step.status = 'success';
        step.duration = Math.floor(Math.random() * 10) + 2;
        setWorkflow([...newWorkflow]);
      }

      job.status = 'success';
      setWorkflow([...newWorkflow]);
    }

    setIsRunning(false);
  };

  const copyYaml = () => {
    navigator.clipboard.writeText(generateYaml(workflow, mode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleJob = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'success': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-muted-foreground bg-secondary/50 border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Clock className="w-4 h-4" /></motion.div>;
      case 'success': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">GitHub Actions Workflow</h3>
            <p className="text-xs text-gray-400">
              {mode === 'beginner' && 'Simple Build & Test'}
              {mode === 'intermediate' && 'Multi-Job Pipeline'}
              {mode === 'advanced' && 'Full CI/CD with Deployment'}
            </p>
          </div>
        </div>
        {interactive && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRunning ? undefined : runWorkflow}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              isRunning 
                ? 'bg-yellow-500/20 text-yellow-400 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isRunning ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Clock className="w-4 h-4" />
                </motion.div>
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Workflow
              </>
            )}
          </motion.button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 divide-x divide-border">
        {/* Workflow Visualization */}
        <div className="p-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Pipeline Execution</h4>
          
          {workflow.map((job, jobIndex) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: jobIndex * 0.1 }}
              className={`rounded-lg border ${getStatusColor(job.status)} overflow-hidden`}
            >
              {/* Job Header */}
              <button
                onClick={() => toggleJob(job.id)}
                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div className="text-left">
                    <span className="font-medium">{job.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({job.runsOn})</span>
                  </div>
                </div>
                {expandedJobs.has(job.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {/* Steps */}
              <AnimatePresence>
                {expandedJobs.has(job.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/50"
                  >
                    {job.steps.map((step, stepIndex) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 px-4 py-2 ${
                          stepIndex !== job.steps.length - 1 ? 'border-b border-border/30' : ''
                        }`}
                      >
                        <div className={`p-1.5 rounded ${getStatusColor(step.status)}`}>
                          {step.status === 'running' ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                              {step.icon}
                            </motion.div>
                          ) : step.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{step.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {step.uses || step.run}
                          </p>
                        </div>
                        {step.duration && (
                          <span className="text-xs text-muted-foreground">{step.duration}s</span>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Dependency Arrows for Multi-Job */}
          {mode !== 'beginner' && (
            <div className="text-xs text-center text-muted-foreground pt-2">
              Jobs run sequentially based on dependencies
            </div>
          )}
        </div>

        {/* YAML Preview */}
        {showYaml && (
          <div className="p-4 bg-secondary/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Code className="w-4 h-4" />
                Workflow YAML
              </h4>
              <button
                onClick={copyYaml}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                title="Copy YAML"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="text-xs font-mono bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[400px] overflow-y-auto">
              {generateYaml(workflow, mode)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-secondary/30 px-4 py-3 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" /> Success
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" /> Running
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500" /> Pending
          </span>
        </div>
      </div>
    </div>
  );
}

export default GitHubActionsVisualizer;
