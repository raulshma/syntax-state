'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  CheckCircle2, 
  Box, 
  TestTube,
  Package,
  Rocket,
  Server,
  ArrowRight,
  ArrowDown,
  RefreshCw,
  Zap,
  Shield,
  Eye,
  Settings,
  AlertCircle
} from 'lucide-react';

export interface CICDPipelineBuilderProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  interactive?: boolean;
}

interface PipelineStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  steps: string[];
  isActive: boolean;
  isComplete: boolean;
}

const getBeginnerStages = (): PipelineStage[] => [
  {
    id: 'code',
    name: 'Code',
    description: 'Developer writes and commits code',
    icon: <GitBranch className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    steps: ['Write code', 'Commit changes', 'Push to repository'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'build',
    name: 'Build',
    description: 'Compile and package the application',
    icon: <Box className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    steps: ['Restore dependencies', 'Compile code', 'Create artifacts'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'test',
    name: 'Test',
    description: 'Run automated tests',
    icon: <TestTube className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
    steps: ['Unit tests', 'Integration tests', 'Code coverage'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'deploy',
    name: 'Deploy',
    description: 'Release to production',
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    steps: ['Deploy to server', 'Verify deployment', 'Notify team'],
    isActive: false,
    isComplete: false,
  },
];

const getIntermediateStages = (): PipelineStage[] => [
  {
    id: 'code',
    name: 'Source Control',
    description: 'Code changes trigger pipeline',
    icon: <GitBranch className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    steps: ['Git push', 'Pull request', 'Code review', 'Merge to main'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'build',
    name: 'Build & Package',
    description: 'Compile, test, and create artifacts',
    icon: <Box className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    steps: ['Restore NuGet', 'Build Release', 'Run tests', 'Create Docker image'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'staging',
    name: 'Staging',
    description: 'Deploy to staging environment',
    icon: <Server className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
    steps: ['Deploy to staging', 'Smoke tests', 'Performance tests'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'approval',
    name: 'Approval Gate',
    description: 'Manual approval for production',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'from-pink-500 to-pink-600',
    steps: ['Review changes', 'QA signoff', 'Manager approval'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Deploy to production',
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    steps: ['Blue-green deploy', 'Health checks', 'Rollback if needed'],
    isActive: false,
    isComplete: false,
  },
];

const getAdvancedStages = (): PipelineStage[] => [
  {
    id: 'code',
    name: 'Source',
    description: 'Code changes with branch strategy',
    icon: <GitBranch className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    steps: ['Feature branch', 'PR review', 'Merge checks', 'Main branch'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'build',
    name: 'Build',
    description: 'Multi-platform build',
    icon: <Box className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    steps: ['Matrix build', 'Docker build', 'Push to registry', 'Sign artifacts'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Security scanning',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-red-500 to-red-600',
    steps: ['SAST scan', 'Dependency audit', 'Container scan', 'License check'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'staging',
    name: 'Staging',
    description: 'Staging with IaC',
    icon: <Server className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
    steps: ['Terraform apply', 'K8s deploy', 'Integration tests', 'Load tests'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'canary',
    name: 'Canary',
    description: 'Gradual rollout',
    icon: <Eye className="w-6 h-6" />,
    color: 'from-cyan-500 to-cyan-600',
    steps: ['5% traffic', 'Monitor errors', '25% traffic', 'Full rollout'],
    isActive: false,
    isComplete: false,
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Full deployment',
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    steps: ['Deploy all pods', 'DNS update', 'Cache warm', 'Alert setup'],
    isActive: false,
    isComplete: false,
  },
];

const deploymentStrategies = [
  {
    id: 'rolling',
    name: 'Rolling Update',
    description: 'Gradually replace old instances with new ones',
    icon: <RefreshCw className="w-5 h-5" />,
    pros: ['Zero downtime', 'Easy rollback', 'Resource efficient'],
    cons: ['Multiple versions running', 'Slow for large deployments'],
  },
  {
    id: 'blue-green',
    name: 'Blue-Green',
    description: 'Run two identical environments, switch traffic instantly',
    icon: <Server className="w-5 h-5" />,
    pros: ['Instant rollback', 'Full testing before switch', 'No mixed versions'],
    cons: ['Double infrastructure cost', 'Complex database handling'],
  },
  {
    id: 'canary',
    name: 'Canary',
    description: 'Route small percentage of traffic to new version',
    icon: <Eye className="w-5 h-5" />,
    pros: ['Real user testing', 'Gradual risk', 'Early problem detection'],
    cons: ['Requires traffic routing', 'Complex monitoring', 'Longer deployment'],
  },
];

export function CICDPipelineBuilder({ 
  mode = 'beginner',
  interactive = true 
}: CICDPipelineBuilderProps) {
  const getInitialStages = () => {
    switch (mode) {
      case 'intermediate': return getIntermediateStages();
      case 'advanced': return getAdvancedStages();
      default: return getBeginnerStages();
    }
  };

  const [stages, setStages] = useState<PipelineStage[]>(getInitialStages());
  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [selectedStrategy, setSelectedStrategy] = useState('rolling');
  const [showStrategies, setShowStrategies] = useState(false);

  const runPipeline = async () => {
    if (isRunning) return;
    
    // Reset
    const newStages = getInitialStages();
    setStages(newStages);
    setIsRunning(true);
    setCurrentStageIndex(0);

    for (let i = 0; i < newStages.length; i++) {
      setCurrentStageIndex(i);
      newStages[i].isActive = true;
      setStages([...newStages]);
      
      // Simulate processing time
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
      
      newStages[i].isActive = false;
      newStages[i].isComplete = true;
      setStages([...newStages]);
    }

    setCurrentStageIndex(-1);
    setIsRunning(false);
  };

  const resetPipeline = () => {
    setStages(getInitialStages());
    setCurrentStageIndex(-1);
    setIsRunning(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">CI/CD Pipeline Builder</h3>
              <p className="text-xs text-white/80">
                {mode === 'beginner' && 'Simple Continuous Integration & Deployment'}
                {mode === 'intermediate' && 'Multi-Environment Pipeline'}
                {mode === 'advanced' && 'Enterprise-Grade Pipeline with Advanced Strategies'}
              </p>
            </div>
          </div>
          {interactive && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetPipeline}
                className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runPipeline}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  isRunning 
                    ? 'bg-white/20 text-white cursor-not-allowed' 
                    : 'bg-white text-purple-600 hover:bg-purple-50'
                }`}
              >
                {isRunning ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Settings className="w-4 h-4" />
                    </motion.div>
                    Running...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Run Pipeline
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="p-6">
        {/* Horizontal Pipeline for larger screens */}
        <div className="hidden md:flex items-center justify-center gap-2 overflow-x-auto pb-4">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex-shrink-0 w-40 p-4 rounded-xl border-2 transition-all ${
                  stage.isComplete 
                    ? 'border-green-500 bg-green-500/10' 
                    : stage.isActive 
                    ? 'border-yellow-500 bg-yellow-500/10' 
                    : 'border-border bg-secondary/30'
                }`}
              >
                {/* Animated background for active stage */}
                {stage.isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stage.color} flex items-center justify-center text-white mb-3 mx-auto`}>
                    {stage.isComplete ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : stage.isActive ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                        {stage.icon}
                      </motion.div>
                    ) : (
                      stage.icon
                    )}
                  </div>
                  <h4 className="font-medium text-center text-sm">{stage.name}</h4>
                  <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                    {stage.description}
                  </p>
                </div>

                {/* Steps tooltip on hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 hover:opacity-100 transition-opacity z-10">
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg min-w-[160px]">
                    <p className="text-xs font-medium mb-2">Steps:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {stage.steps.map((step, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Arrow between stages */}
              {index < stages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.05 }}
                  className={`flex-shrink-0 ${
                    stages[index].isComplete ? 'text-green-500' : 'text-muted-foreground'
                  }`}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Vertical Pipeline for mobile */}
        <div className="md:hidden space-y-3">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  stage.isComplete 
                    ? 'border-green-500 bg-green-500/10' 
                    : stage.isActive 
                    ? 'border-yellow-500 bg-yellow-500/10' 
                    : 'border-border bg-secondary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stage.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {stage.isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : stage.isActive ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                        {stage.icon}
                      </motion.div>
                    ) : (
                      stage.icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{stage.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{stage.description}</p>
                  </div>
                </div>
              </motion.div>

              {index < stages.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className={`w-5 h-5 ${stages[index].isComplete ? 'text-green-500' : 'text-muted-foreground'}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Deployment Strategies (Advanced mode) */}
      {mode === 'advanced' && (
        <div className="border-t border-border p-4">
          <button
            onClick={() => setShowStrategies(!showStrategies)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            Deployment Strategies
            <motion.span animate={{ rotate: showStrategies ? 180 : 0 }}>
              <ArrowDown className="w-4 h-4" />
            </motion.span>
          </button>

          <AnimatePresence>
            {showStrategies && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  {deploymentStrategies.map((strategy) => (
                    <motion.button
                      key={strategy.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedStrategy === strategy.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${selectedStrategy === strategy.id ? 'bg-primary/10 text-primary' : 'bg-secondary'}`}>
                          {strategy.icon}
                        </div>
                        <span className="font-medium text-sm">{strategy.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{strategy.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Pros
                          </p>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            {strategy.pros.map((pro, i) => (
                              <li key={i}>• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Cons
                          </p>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            {strategy.cons.map((con, i) => (
                              <li key={i}>• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer with CI/CD Concepts */}
      <div className="bg-secondary/30 px-4 py-3 border-t border-border">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">CI</span>
            <span className="text-muted-foreground">= Continuous Integration (Build + Test)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">CD</span>
            <span className="text-muted-foreground">= Continuous Delivery/Deployment</span>
          </div>
          {mode !== 'beginner' && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">IaC</span>
              <span className="text-muted-foreground">= Infrastructure as Code</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CICDPipelineBuilder;
