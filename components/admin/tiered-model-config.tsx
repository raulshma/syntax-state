'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Check, DollarSign, Layers, Zap, Gauge, Feather, AlertTriangle, Trash2 } from 'lucide-react';
import { 
  getTieredModelConfig, 
  updateTierConfig,
  clearTieredModelConfig,
  getTaskTierMappings,
  type TaskTierInfo,
} from '@/lib/actions/admin';
import type { OpenRouterModel, GroupedModels } from '@/app/api/models/route';
import type { ModelTier, TierModelConfig, FullTieredModelConfig } from '@/lib/db/schemas/settings';

interface TieredModelConfigProps {
  initialConfig: FullTieredModelConfig;
}

const TIER_INFO: Record<ModelTier, { label: string; icon: typeof Zap; description: string; color: string }> = {
  high: {
    label: 'High Capability',
    icon: Zap,
    description: 'Complex reasoning, detailed content generation (topics, briefs, analogies)',
    color: 'text-amber-500',
  },
  medium: {
    label: 'Medium Capability', 
    icon: Gauge,
    description: 'Structured output, moderate complexity (MCQs, rapid-fire)',
    color: 'text-blue-500',
  },
  low: {
    label: 'Low Capability',
    icon: Feather,
    description: 'Simple parsing, extraction tasks (prompt parsing)',
    color: 'text-green-500',
  },
};

export function TieredModelConfig({ initialConfig }: TieredModelConfigProps) {
  const [config, setConfig] = useState<FullTieredModelConfig>(initialConfig);
  const [models, setModels] = useState<GroupedModels | null>(null);
  const [taskMappings, setTaskMappings] = useState<TaskTierInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTier, setActiveTier] = useState<ModelTier>('high');
  const [selectingFor, setSelectingFor] = useState<'primary' | 'fallback'>('primary');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);


  // Check which tiers are missing configuration
  const missingTiers = (['high', 'medium', 'low'] as ModelTier[]).filter(
    tier => !config[tier].primaryModel
  );

  useEffect(() => {
    fetchModels();
    getTaskTierMappings().then(setTaskMappings);
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const filterModels = (modelList: OpenRouterModel[]) => {
    if (!searchQuery) return modelList;
    const query = searchQuery.toLowerCase();
    return modelList.filter(
      (m) =>
        m.id.toLowerCase().includes(query) ||
        m.name.toLowerCase().includes(query)
    );
  };

  const handleSelectModel = (modelId: string, tier: ModelTier, type: 'primary' | 'fallback') => {
    setConfig((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [type === 'primary' ? 'primaryModel' : 'fallbackModel']: modelId,
      },
    }));
    setSaved(false);
  };

  const handleUpdateSettings = (tier: ModelTier, field: 'temperature' | 'maxTokens', value: number) => {
    setConfig((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value,
      },
    }));
    setSaved(false);
  };

  const handleSaveTier = (tier: ModelTier) => {
    startTransition(async () => {
      await updateTierConfig(tier, config[tier]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleClearAll = () => {
    if (!confirm('Are you sure you want to clear all tier configurations? AI features will be disabled until reconfigured.')) {
      return;
    }
    startTransition(async () => {
      await clearTieredModelConfig();
      setConfig({
        high: { primaryModel: null, fallbackModel: null, temperature: 0.7, maxTokens: 4096 },
        medium: { primaryModel: null, fallbackModel: null, temperature: 0.7, maxTokens: 4096 },
        low: { primaryModel: null, fallbackModel: null, temperature: 0.7, maxTokens: 4096 },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num === 0) return 'Free';
    return `$${(num * 1000000).toFixed(2)}/M`;
  };

  const ModelCard = ({
    model,
    isSelected,
    onSelect,
  }: {
    model: OpenRouterModel;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <div
      onClick={onSelect}
      className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-foreground/50 ${
        isSelected ? 'border-foreground bg-muted/50' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm text-foreground truncate">{model.name}</p>
            {isSelected && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">{model.id}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Badge variant="outline" className="text-xs">
          <Layers className="w-3 h-3 mr-1" />
          {(model.context_length / 1000).toFixed(0)}K
        </Badge>
        <Badge variant="outline" className="text-xs">
          <DollarSign className="w-3 h-3 mr-1" />
          {formatPrice(model.pricing.prompt)}
        </Badge>
      </div>
    </div>
  );

  const TierBadge = ({ tier }: { tier: ModelTier }) => {
    const info = TIER_INFO[tier];
    const Icon = info.icon;
    return (
      <Badge variant="outline" className={`${info.color} border-current`}>
        <Icon className="w-3 h-3 mr-1" />
        {info.label}
      </Badge>
    );
  };

  const TierStatus = ({ tier }: { tier: ModelTier }) => {
    const tierConfig = config[tier];
    const isConfigured = !!tierConfig.primaryModel;
    return (
      <Badge variant={isConfigured ? 'default' : 'destructive'} className="text-xs">
        {isConfigured ? 'Configured' : 'Not Set'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Spinner className="w-6 h-6" />
          <span className="ml-2 text-muted-foreground">Loading models...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchModels} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-mono">Tiered Model Configuration</CardTitle>
        <CardDescription>
          Configure different models for different task complexities. Each tier requires a primary model.
          AI features are disabled for tiers without configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning for unconfigured tiers */}
        {missingTiers.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The following tiers are not configured: {missingTiers.join(', ')}. 
              AI features using these tiers will fail until configured.
            </AlertDescription>
          </Alert>
        )}

        {/* Tier Selection Cards */}
        <div className="grid grid-cols-3 gap-3">
          {(['high', 'medium', 'low'] as ModelTier[]).map((tier) => {
            const info = TIER_INFO[tier];
            const Icon = info.icon;
            const tierConfig = config[tier];
            return (
              <div 
                key={tier} 
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeTier === tier ? 'border-foreground bg-muted/50' : 'border-border hover:border-foreground/50'
                }`}
                onClick={() => setActiveTier(tier)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${info.color}`} />
                    <span className="text-sm font-medium">{info.label}</span>
                  </div>
                  <TierStatus tier={tier} />
                </div>
                <p className="font-mono text-xs text-muted-foreground truncate">
                  {tierConfig.primaryModel || 'Not configured'}
                </p>
                {tierConfig.fallbackModel && (
                  <p className="font-mono text-xs text-muted-foreground/60 truncate">
                    Fallback: {tierConfig.fallbackModel}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Task Mappings */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium mb-3 block">Task → Tier Mappings</Label>
          <div className="grid grid-cols-2 gap-2">
            {taskMappings.map((mapping) => (
              <div key={mapping.task} className="flex items-center justify-between text-sm p-2 rounded bg-background/50">
                <span className="text-muted-foreground truncate">{mapping.description}</span>
                <TierBadge tier={mapping.tier} />
              </div>
            ))}
          </div>
        </div>

        {/* Active Tier Configuration */}
        <div className="space-y-4 p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TierBadge tier={activeTier} />
              <span className="text-sm text-muted-foreground">{TIER_INFO[activeTier].description}</span>
            </div>
          </div>

          {/* Model Selection Type */}
          <Tabs value={selectingFor} onValueChange={(v) => setSelectingFor(v as 'primary' | 'fallback')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="primary">
                Primary Model {!config[activeTier].primaryModel && <AlertTriangle className="w-3 h-3 ml-1 text-destructive" />}
              </TabsTrigger>
              <TabsTrigger value="fallback">
                Fallback Model
              </TabsTrigger>
            </TabsList>

            <TabsContent value="primary" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Required. The main model used for this tier's tasks.
              </p>
              {config[activeTier].primaryModel && (
                <div className="p-2 bg-muted/50 rounded font-mono text-sm">
                  {config[activeTier].primaryModel}
                </div>
              )}
            </TabsContent>

            <TabsContent value="fallback" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Optional. Used when the primary model fails or is unavailable.
              </p>
              {config[activeTier].fallbackModel && (
                <div className="p-2 bg-muted/50 rounded font-mono text-sm">
                  {config[activeTier].fallbackModel}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Model List */}
          <Tabs defaultValue="paid">
            <TabsList>
              <TabsTrigger value="paid" className="gap-2">
                <DollarSign className="w-3 h-3" />
                Paid ({models?.paid.length || 0})
              </TabsTrigger>
              <TabsTrigger value="free" className="gap-2">
                Free ({models?.free.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paid">
              <ScrollArea className="h-[250px] pr-4">
                <div className="grid gap-2">
                  {filterModels(models?.paid || []).map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={
                        selectingFor === 'primary' 
                          ? config[activeTier].primaryModel === model.id
                          : config[activeTier].fallbackModel === model.id
                      }
                      onSelect={() => handleSelectModel(model.id, activeTier, selectingFor)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="free">
              <ScrollArea className="h-[250px] pr-4">
                <div className="grid gap-2">
                  {filterModels(models?.free || []).map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={
                        selectingFor === 'primary' 
                          ? config[activeTier].primaryModel === model.id
                          : config[activeTier].fallbackModel === model.id
                      }
                      onSelect={() => handleSelectModel(model.id, activeTier, selectingFor)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Temperature and Max Tokens */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Temperature</Label>
              <Input
                type="number"
                value={config[activeTier].temperature}
                onChange={(e) => handleUpdateSettings(activeTier, 'temperature', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                max="2"
                className="font-mono"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Max Tokens</Label>
              <Input
                type="number"
                value={config[activeTier].maxTokens}
                onChange={(e) => handleUpdateSettings(activeTier, 'maxTokens', parseInt(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
          </div>

          {/* Save Tier Button */}
          <Button onClick={() => handleSaveTier(activeTier)} disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              `Save ${TIER_INFO[activeTier].label} Configuration`
            )}
          </Button>
        </div>

        {/* Clear All Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="destructive" onClick={handleClearAll} disabled={isPending}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Configurations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
