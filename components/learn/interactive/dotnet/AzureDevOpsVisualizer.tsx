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
  TestTube,
  Package,
  Rocket,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Server,
  Shield,
  Cloud,
  Users
} from 'lucide-react';

export interface AzureDevOpsVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  showYaml?: boolean;
  interactive?: boolean;
}

interface PipelineTask {
  id: string;
  name: string;
  task?: string;
  script?: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: number;
}

interface PipelineJob {
  id: string;
  name: string;
  pool: string;
  tasks: PipelineTask[];
  status: 'pending' | 'running' | 'success' | 'failed';
  dependsOn?: string[];
}

interface PipelineStage {
  id: string;
  name: string;
  jobs: PipelineJob[];
  status: 'pending' | 'running' | 'success' | 'failed';
  dependsOn?: string[];
  environment?: string;
}

const getBeginnerPipeline = (): PipelineStage[] => [
  {
    id: 'build',
    name: 'Build',
    status: 'pending',
    jobs: [
      {
        id: 'build-job',
        name: 'Build Job',
        pool: 'ubuntu-latest',
        status: 'pending',
        tasks: [
          { id: 'checkout', name: 'Checkout', task: 'Checkout@1', icon: <GitBranch className="w-4 h-4" />, status: 'pending' },
          { id: 'dotnet', name: 'Use .NET SDK', task: 'UseDotNet@2', icon: <Settings className="w-4 h-4" />, status: 'pending' },
          { id: 'restore', name: 'Restore', task: 'DotNetCoreCLI@2', icon: <Package className="w-4 h-4" />, status: 'pending' },
          { id: 'build', name: 'Build', task: 'DotNetCoreCLI@2', icon: <Box className="w-4 h-4" />, status: 'pending' },
          { id: 'test', name: 'Test', task: 'DotNetCoreCLI@2', icon: <TestTube className="w-4 h-4" />, status: 'pending' },
        ]
      }
    ]
  }
];

const getIntermediatePipeline = (): PipelineStage[] => [
  {
    id: 'build',
    name: 'Build',
    status: 'pending',
    jobs: [
      {
        id: 'build-job',
        name: 'Build & Test',
        pool: 'ubuntu-latest',
        status: 'pending',
        tasks: [
          { id: 'checkout', name: 'Checkout', task: 'Checkout@1', icon: <GitBranch className="w-4 h-4" />, status: 'pending' },
          { id: 'dotnet', name: 'Use .NET 8', task: 'UseDotNet@2', icon: <Settings className="w-4 h-4" />, status: 'pending' },
          { id: 'build', name: 'Build', task: 'DotNetCoreCLI@2', icon: <Box className="w-4 h-4" />, status: 'pending' },
          { id: 'test', name: 'Test', task: 'DotNetCoreCLI@2', icon: <TestTube className="w-4 h-4" />, status: 'pending' },
          { id: 'publish', name: 'Publish', task: 'DotNetCoreCLI@2', icon: <Package className="w-4 h-4" />, status: 'pending' },
        ]
      }
    ]
  },
  {
    id: 'deploy-staging',
    name: 'Deploy to Staging',
    status: 'pending',
    dependsOn: ['build'],
    environment: 'staging',
    jobs: [
      {
        id: 'deploy-staging-job',
        name: 'Deploy',
        pool: 'ubuntu-latest',
        status: 'pending',
        tasks: [
          { id: 'download', name: 'Download Artifact', task: 'DownloadPipelineArtifact@2', icon: <Package className="w-4 h-4" />, status: 'pending' },
          { id: 'deploy', name: 'Azure Web App Deploy', task: 'AzureWebApp@1', icon: <Cloud className="w-4 h-4" />, status: 'pending' },
        ]
      }
    ]
  },
  {
    id: 'deploy-prod',
    name: 'Deploy to Production',
    status: 'pending',
    dependsOn: ['deploy-staging'],
    environment: 'production',
    jobs: [
      {
        id: 'deploy-prod-job',
        name: 'Deploy',
        pool: 'ubuntu-latest',
        status: 'pending',
        tasks: [
          { id: 'download', name: 'Download Artifact', task: 'DownloadPipelineArtifact@2', icon: <Package className="w-4 h-4" />, status: 'pending' },
          { id: 'deploy', name: 'Azure Web App Deploy', task: 'AzureWebApp@1', icon: <Rocket className="w-4 h-4" />, status: 'pending' },
        ]
      }
    ]
  }
];

const getAdvancedPipeline = (): PipelineStage[] => [
  {
    id: 'build',
    name: 'Build & Validate',
    status: 'pending',
    jobs: [
      {
        id: 'build-job',
        name: 'Build',
        pool: 'ubuntu-latest',
        status: 'pending',
        tasks: [
          { id: 'checkout', name: 'Checkout', task: 'Checkout@1', icon: <GitBranch className="w-4 h-4" />, status: 'pending' },
          { id: 'cache', name: 'Cache NuGet', task: 'Cache@2', icon: <Package className="w-4 h-4" />, status: 'pending' },
          { id: 'build', name: 'Build', task: 'DotNetCoreCLI@2', icon: <Box className="w-4 h-4" />, status: 'pending' },
          { id: 'publish', name: 'Publish Artifact', task: 'PublishPipelineArtifact@1', icon: <Package className="w-4 h-4" />, status: 'pending' },
        ]
      },
      {
        id: 'test-job',
        name: 'Test',
        pool: 'ubuntu-latest',
        status: 'pending',
        dependsOn: ['build-job'],
        tasks: [
          { id: 'test', name: 'Run Tests', task: 'DotNetCoreCLI@2', icon: <TestTube className="w-4 h-4" />, status: 'pending' },
          { id: 'coverage', name: 'Publish Coverage', task: 'PublishCodeCoverageResults@2', icon: <CheckCircle2 className="w-4 h-4" />, status: 'pending' },
        ]
      }
    ]
  },
  {
    id: 'security',
    name: 'Security Scan',
    status: 'pending',
    dependsOn: ['build'],
    jobs: [
      {
        id: 'security-job',
        name: 'Security',
        pool: 'ubuntu-latest',
        status: 'pending',
        tasks: [
          { id: 'sast', name: 'SAST Scan', script: 'dotnet list package --vulnerable', icon: <Shield className="w-4 h-4" />, status: 'pending' },
          { id: 'analyzer', name: 'Security Analyzer', task: 'CredScan@3', icon: <Shield className="w-4 h-4" />, status: 'pending' },
        ]
      }
    ]
  },
  {
    id: 'deploy-staging',
    name: 'Staging',
    status: 'pending',
    dependsOn: ['security'],
    environment: 'staging',
    jobs: [
      {
        id: 'deploy-staging-job',
        name: 'Deploy',
        pool: 'ubuntu-latest',
        status: 'pending',
        tasks: [
          { id: 'download', name: 'Download', task: 'DownloadPipelineArtifact@2', icon: <Package className="w-4 h-4" />, status: 'pending' },
          { id: 'deploy', name: 'Deploy', task: 'AzureWebApp@1', icon: <Cloud className="w-4 h-4" />, status: 'pending' },
          { id: 'smoke', name: 'Smoke Tests', script: 'curl --fail https://staging.app', icon: <TestTube className="w-4 h-4" />, status: 'pending' },
        ]
      }
    ]
  },
  {
    id: 'deploy-prod',
    name: 'Production',
    status: 'pending',
    dependsOn: ['deploy-staging'],
    environment: 'production',
    jobs: [
      {
        id: 'approval',
        name: 'Approval Gate',
        pool: 'server',
        status: 'pending',
        tasks: [
          { id: 'wait', name: 'Manual Validation', task: 'ManualValidation@1', icon: <Users className="w-4 h-4" />, status: 'pending' },
        ]
      },
      {
        id: 'deploy-prod-job',
        name: 'Deploy',
        pool: 'ubuntu-latest',
        status: 'pending',
        dependsOn: ['approval'],
        tasks: [
          { id: 'deploy', name: 'Blue-Green Deploy', task: 'AzureWebApp@1', icon: <Rocket className="w-4 h-4" />, status: 'pending' },
          { id: 'swap', name: 'Swap Slots', task: 'AzureAppServiceManage@0', icon: <Server className="w-4 h-4" />, status: 'pending' },
        ]
      }
    ]
  }
];

const generateYaml = (stages: PipelineStage[], mode: string): string => {
  const trigger = mode === 'advanced' 
    ? `trigger:
  branches:
    include:
      - main
      - develop
  paths:
    exclude:
      - docs/*
      - README.md`
    : `trigger:
  - main`;

  const variables = mode !== 'beginner' 
    ? `
variables:
  buildConfiguration: 'Release'
  dotnetVersion: '8.0.x'
  azureSubscription: 'MyAzureConnection'`
    : `
variables:
  buildConfiguration: 'Release'`;

  const stagesYaml = stages.map(stage => {
    const dependsOn = stage.dependsOn?.length ? `\n  dependsOn: ${stage.dependsOn.join(', ')}` : '';
    const condition = stage.environment ? `\n  condition: succeeded()` : '';
    
    const jobsYaml = stage.jobs.map(job => {
      const jobDependsOn = job.dependsOn?.length ? `\n      dependsOn: ${job.dependsOn.join(', ')}` : '';
      const tasksYaml = job.tasks.map(task => {
        if (task.task) {
          return `        - task: ${task.task}
          displayName: '${task.name}'`;
        }
        return `        - script: ${task.script}
          displayName: '${task.name}'`;
      }).join('\n');

      return `    - job: ${job.id.replace(/-/g, '_')}
      displayName: '${job.name}'
      pool:
        vmImage: '${job.pool}'${jobDependsOn}
      steps:
${tasksYaml}`;
    }).join('\n');

    return `  - stage: ${stage.id.replace(/-/g, '_')}
    displayName: '${stage.name}'${dependsOn}${condition}
    jobs:
${jobsYaml}`;
  }).join('\n\n');

  return `# Azure DevOps Pipeline for .NET
${trigger}
${variables}

stages:
${stagesYaml}`;
};

export function AzureDevOpsVisualizer({ 
  mode = 'beginner',
  showYaml = true,
  interactive = true 
}: AzureDevOpsVisualizerProps) {
  const getInitialPipeline = useCallback(() => {
    switch (mode) {
      case 'intermediate': return getIntermediatePipeline();
      case 'advanced': return getAdvancedPipeline();
      default: return getBeginnerPipeline();
    }
  }, [mode]);

  const [pipeline, setPipeline] = useState<PipelineStage[]>(getInitialPipeline());
  const [isRunning, setIsRunning] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(pipeline.map(s => s.id)));
  const [copied, setCopied] = useState(false);

  const resetPipeline = useCallback(() => {
    setPipeline(getInitialPipeline());
    setIsRunning(false);
  }, [getInitialPipeline]);

  const runPipeline = async () => {
    if (isRunning) return;
    
    resetPipeline();
    setIsRunning(true);

    const newPipeline = getInitialPipeline();
    
    for (const stage of newPipeline) {
      // Check dependencies
      if (stage.dependsOn) {
        const depsComplete = stage.dependsOn.every((depId: string) => 
          newPipeline.find((s: PipelineStage) => s.id === depId)?.status === 'success'
        );
        if (!depsComplete) continue;
      }

      stage.status = 'running';
      setPipeline([...newPipeline]);

      for (const job of stage.jobs) {
        if (job.dependsOn) {
          const jobDepsComplete = job.dependsOn.every((depId: string) =>
            stage.jobs.find((j: PipelineJob) => j.id === depId)?.status === 'success'
          );
          if (!jobDepsComplete) continue;
        }

        job.status = 'running';
        setPipeline([...newPipeline]);

        for (const task of job.tasks) {
          task.status = 'running';
          setPipeline([...newPipeline]);
          await new Promise(r => setTimeout(r, 350 + Math.random() * 250));
          task.status = 'success';
          task.duration = Math.floor(Math.random() * 15) + 3;
          setPipeline([...newPipeline]);
        }

        job.status = 'success';
        setPipeline([...newPipeline]);
      }

      stage.status = 'success';
      setPipeline([...newPipeline]);
    }

    setIsRunning(false);
  };

  const copyYaml = () => {
    navigator.clipboard.writeText(generateYaml(pipeline, mode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Azure DevOps Pipeline</h3>
            <p className="text-xs text-blue-100">
              {mode === 'beginner' && 'Basic Build Pipeline'}
              {mode === 'intermediate' && 'Multi-Stage with Environments'}
              {mode === 'advanced' && 'Enterprise CI/CD Pipeline'}
            </p>
          </div>
        </div>
        {interactive && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRunning ? undefined : runPipeline}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              isRunning 
                ? 'bg-white/20 text-white cursor-not-allowed' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
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
                Run Pipeline
              </>
            )}
          </motion.button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 divide-x divide-border">
        {/* Pipeline Visualization */}
        <div className="p-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Stages & Jobs</h4>
          
          {pipeline.map((stage, stageIndex) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: stageIndex * 0.1 }}
              className={`rounded-lg border ${getStatusColor(stage.status)} overflow-hidden`}
            >
              {/* Stage Header */}
              <button
                onClick={() => toggleStage(stage.id)}
                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(stage.status)}
                  <div className="text-left">
                    <span className="font-medium">{stage.name}</span>
                    {stage.environment && (
                      <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        {stage.environment}
                      </span>
                    )}
                  </div>
                </div>
                {expandedStages.has(stage.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {/* Jobs */}
              <AnimatePresence>
                {expandedStages.has(stage.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/50 p-2 space-y-2"
                  >
                    {stage.jobs.map((job) => (
                      <div key={job.id} className={`rounded border ${getStatusColor(job.status)} p-2`}>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(job.status)}
                          <span className="text-sm font-medium">{job.name}</span>
                          <span className="text-xs text-muted-foreground">({job.pool})</span>
                        </div>
                        <div className="space-y-1 ml-6">
                          {job.tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-xs">
                              <div className={`p-1 rounded ${getStatusColor(task.status)}`}>
                                {task.status === 'running' ? (
                                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                    {task.icon}
                                  </motion.div>
                                ) : task.icon}
                              </div>
                              <span className="truncate flex-1">{task.name}</span>
                              {task.duration && <span className="text-muted-foreground">{task.duration}s</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* YAML Preview */}
        {showYaml && (
          <div className="p-4 bg-secondary/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Box className="w-4 h-4" />
                azure-pipelines.yml
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
              {generateYaml(pipeline, mode)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-secondary/30 px-4 py-3 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" /> Succeeded
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500" /> Queued
          </span>
        </div>
      </div>
    </div>
  );
}

export default AzureDevOpsVisualizer;
