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
import { Search, Check, DollarSign, Sparkles, Cpu, Layers } from 'lucide-react';
import { updateModelConfig, type ModelConfig } from '@/lib/actions/admin';
import type { OpenRouterModel, GroupedModels } from '@/app/api/models/route';

interface ModelSelectorProps {
  initialConfig: ModelConfig;
}

export function ModelSelector({ initialConfig }: ModelSelectorProps) {
  const [config, setConfig] = useState(initialConfig);
  const [models, setModels] = useState<GroupedModels | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchModels();
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

  const handleSelectModel = (modelId: string, type: 'primary' | 'fallback') => {
    if (type === 'primary') {
      setConfig((prev) => ({ ...prev, defaultModel: modelId }));
    } else {
      setConfig((prev) => ({ ...prev, fallbackModel: modelId }));
    }
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateModelConfig(config);
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
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-foreground/50 ${
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
      
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant="outline" className="text-xs">
          <Layers className="w-3 h-3 mr-1" />
          {(model.context_length / 1000).toFixed(0)}K ctx
        </Badge>
        <Badge variant="outline" className="text-xs">
          <DollarSign className="w-3 h-3 mr-1" />
          {formatPrice(model.pricing.prompt)}
        </Badge>
        {model.architecture?.modality && (
          <Badge variant="secondary" className="text-xs">
            {model.architecture.modality}
          </Badge>
        )}
      </div>

      {model.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {model.description}
        </p>
      )}
    </div>
  );

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
        <CardTitle className="font-mono">Model Configuration</CardTitle>
        <CardDescription>
          Select the default AI model for all generations. Models are fetched from OpenRouter.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Selection */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <Label className="text-xs text-muted-foreground">Primary Model</Label>
            <p className="font-mono text-sm text-foreground truncate">{config.defaultModel}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fallback Model</Label>
            <p className="font-mono text-sm text-foreground truncate">{config.fallbackModel}</p>
          </div>
        </div>

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

        {/* Model Selection Tabs */}
        <Tabs defaultValue="primary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="primary">
              <Cpu className="w-4 h-4 mr-2" />
              Primary Model
            </TabsTrigger>
            <TabsTrigger value="fallback">
              <Sparkles className="w-4 h-4 mr-2" />
              Fallback Model
            </TabsTrigger>
          </TabsList>

          {['primary', 'fallback'].map((tabType) => (
            <TabsContent key={tabType} value={tabType} className="space-y-4">
              <Tabs defaultValue="paid">
                <TabsList>
                  <TabsTrigger value="paid" className="gap-2">
                    <DollarSign className="w-3 h-3" />
                    Paid ({models?.paid.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="free" className="gap-2">
                    <Sparkles className="w-3 h-3" />
                    Free ({models?.free.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paid">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-3">
                      {filterModels(models?.paid || []).map((model) => (
                        <ModelCard
                          key={model.id}
                          model={model}
                          isSelected={
                            tabType === 'primary'
                              ? config.defaultModel === model.id
                              : config.fallbackModel === model.id
                          }
                          onSelect={() =>
                            handleSelectModel(model.id, tabType as 'primary' | 'fallback')
                          }
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="free">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-3">
                      {filterModels(models?.free || []).map((model) => (
                        <ModelCard
                          key={model.id}
                          model={model}
                          isSelected={
                            tabType === 'primary'
                              ? config.defaultModel === model.id
                              : config.fallbackModel === model.id
                          }
                          onSelect={() =>
                            handleSelectModel(model.id, tabType as 'primary' | 'fallback')
                          }
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>

        {/* Additional Settings */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Temperature</Label>
            <Input
              type="number"
              value={config.temperature}
              onChange={(e) => {
                setConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }));
                setSaved(false);
              }}
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
              value={config.maxTokens}
              onChange={(e) => {
                setConfig((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || 0 }));
                setSaved(false);
              }}
              className="font-mono"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isPending}>
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
              'Save Configuration'
            )}
          </Button>
          {saved && (
            <span className="text-sm text-green-500">Configuration saved successfully</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
