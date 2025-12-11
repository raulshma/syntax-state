"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronDown,
  Search,
  Check,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpenRouterModel, GroupedModels } from "@/app/api/models/route";
import { PROVIDER_INFO } from "@/lib/ai/types";
import type { AIProviderType } from "@/lib/ai/types";
import type { SelectedModel } from "@/lib/ai/multi-model-types";
import { MAX_MODELS_SELECTION } from "@/lib/ai/multi-model-types";

const MULTI_MODEL_STORAGE_KEY = "ai-chat-multi-models";

interface VirtualizedModelListProps {
  models: OpenRouterModel[];
  selectedModels: SelectedModel[];
  onToggleModel: (model: OpenRouterModel) => void;
  isModelSelected: (model: OpenRouterModel) => boolean;
}

function VirtualizedModelList({
  models,
  selectedModels,
  onToggleModel,
  isModelSelected,
}: VirtualizedModelListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: models.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      className="h-[250px] overflow-auto"
      style={{ contain: "strict", WebkitOverflowScrolling: "touch" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const model = models[virtualRow.index];
          const selected = isModelSelected(model);
          const atLimit = selectedModels.length >= MAX_MODELS_SELECTION && !selected;

          return (
            <div
              key={`${model.provider}-${model.id}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <button
                type="button"
                onClick={() => onToggleModel(model)}
                disabled={atLimit}
                className={cn(
                  "w-full px-2 py-1.5 text-left transition-all border-b border-border/20",
                  selected ? "bg-primary/10" : atLimit ? "opacity-40" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs shrink-0">
                    {model.provider === "google" ? "🔷" : "🌐"}
                  </span>
                  <span className="text-xs font-medium truncate flex-1">{model.name}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MultiModelSelectorProps {
  selectedModels: SelectedModel[];
  onModelsChange: (models: SelectedModel[]) => void;
  disabled?: boolean;
}

export function MultiModelSelector({
  selectedModels,
  onModelsChange,
  disabled,
}: MultiModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [allModelsCache, setAllModelsCache] = useState<{
    openrouter: GroupedModels;
    google: GroupedModels;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProvider, setActiveProvider] = useState<AIProviderType | "all">("all");

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const [openRouterRes, googleRes] = await Promise.all([
        fetch("/api/models?provider=openrouter"),
        fetch("/api/models?provider=google"),
      ]);

      const openRouterData: GroupedModels = openRouterRes.ok
        ? await openRouterRes.json()
        : { free: [], paid: [] };
      const googleData: GroupedModels = googleRes.ok
        ? await googleRes.json()
        : { free: [], paid: [] };

      setAllModelsCache({ openrouter: openRouterData, google: googleData });

      const saved = localStorage.getItem(MULTI_MODEL_STORAGE_KEY);
      if (saved && selectedModels.length === 0) {
        try {
          const savedModels = JSON.parse(saved) as SelectedModel[];
          if (savedModels.length > 0) {
            onModelsChange(savedModels);
          }
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.error("Failed to load models:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupedModels = useMemo(() => {
    if (!allModelsCache) return { free: [], paid: [] };

    let freeModels: OpenRouterModel[] = [];
    let paidModels: OpenRouterModel[] = [];

    if (activeProvider === "all" || activeProvider === "openrouter") {
      freeModels = [...freeModels, ...allModelsCache.openrouter.free];
      paidModels = [...paidModels, ...allModelsCache.openrouter.paid];
    }
    if (activeProvider === "all" || activeProvider === "google") {
      freeModels = [...freeModels, ...allModelsCache.google.free];
      paidModels = [...paidModels, ...allModelsCache.google.paid];
    }

    return {
      free: freeModels.sort((a, b) => a.name.localeCompare(b.name)),
      paid: paidModels.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [allModelsCache, activeProvider]);

  const filterModels = (models: OpenRouterModel[]) => {
    if (!searchQuery) return models;
    const query = searchQuery.toLowerCase();
    return models.filter(
      (m) => m.id.toLowerCase().includes(query) || m.name.toLowerCase().includes(query)
    );
  };

  const modelSupportsImages = (model: OpenRouterModel): boolean => {
    const modality = model.architecture?.modality?.toLowerCase() || "";
    return modality.includes("image") || modality.includes("multimodal") || modality.includes("vision");
  };

  const isModelSelected = (model: OpenRouterModel) => {
    const modelKey = model.provider === "google" ? `google:${model.id}` : model.id;
    return selectedModels.some((m) => {
      const selectedKey = m.provider === "google" ? `google:${m.id}` : m.id;
      return selectedKey === modelKey;
    });
  };

  const handleToggleModel = (model: OpenRouterModel) => {
    const provider: AIProviderType = model.provider === "google" ? "google" : "openrouter";
    const newModel: SelectedModel = {
      id: model.id,
      name: model.name,
      provider,
      supportsImages: modelSupportsImages(model),
    };

    let newModels: SelectedModel[];
    if (isModelSelected(model)) {
      newModels = selectedModels.filter((m) => !(m.id === model.id && m.provider === provider));
    } else {
      if (selectedModels.length >= MAX_MODELS_SELECTION) return;
      newModels = [...selectedModels, newModel];
    }

    onModelsChange(newModels);
    localStorage.setItem(MULTI_MODEL_STORAGE_KEY, JSON.stringify(newModels));
  };

  const handleRemoveModel = (model: SelectedModel) => {
    const newModels = selectedModels.filter(
      (m) => !(m.id === model.id && m.provider === model.provider)
    );
    onModelsChange(newModels);
    localStorage.setItem(MULTI_MODEL_STORAGE_KEY, JSON.stringify(newModels));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Compact selected model chips */}
      {selectedModels.map((model) => (
        <div
          key={`${model.provider}:${model.id}`}
          className="flex items-center gap-1 h-6 px-2 rounded-full bg-muted/60 border border-border/40 text-xs"
        >
          <span className="text-[10px]">{PROVIDER_INFO[model.provider]?.icon}</span>
          <span className="max-w-[80px] truncate">{model.name}</span>
          <button
            type="button"
            onClick={() => handleRemoveModel(model)}
            className="h-4 w-4 rounded-full hover:bg-background/80 flex items-center justify-center -mr-0.5"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}

      {/* Add button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled || selectedModels.length >= MAX_MODELS_SELECTION}
            className={cn(
              "flex items-center gap-1 h-6 px-2 rounded-full text-xs transition-colors",
              selectedModels.length === 0
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-600"
                : "bg-muted/40 hover:bg-muted/60 border border-border/40"
            )}
          >
            <Plus className="h-3 w-3" />
            <span>{selectedModels.length === 0 ? "Add models" : selectedModels.length + "/4"}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 rounded-xl" align="start">
          <div className="p-2 border-b border-border/40 space-y-2">
            {/* Provider filter - compact */}
            <div className="flex gap-1">
              {(["all", "openrouter", "google"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setActiveProvider(p)}
                  className={cn(
                    "h-6 px-2 rounded-full text-[10px] transition-colors",
                    activeProvider === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  {p === "all" ? "All" : `${PROVIDER_INFO[p]?.icon} ${PROVIDER_INFO[p]?.name}`}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-7 text-xs rounded-lg bg-muted/30 border-transparent"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="paid" className="w-full">
            <div className="px-2 pt-1.5">
              <TabsList className="w-full h-7 bg-muted/30 rounded-md p-0.5">
                <TabsTrigger value="paid" className="flex-1 h-6 text-[10px] rounded">
                  Paid ({groupedModels.paid.length})
                </TabsTrigger>
                <TabsTrigger value="free" className="flex-1 h-6 text-[10px] rounded">
                  Free ({groupedModels.free.length})
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="paid" className="mt-0">
              <VirtualizedModelList
                models={filterModels(groupedModels.paid)}
                selectedModels={selectedModels}
                onToggleModel={handleToggleModel}
                isModelSelected={isModelSelected}
              />
            </TabsContent>
            <TabsContent value="free" className="mt-0">
              <VirtualizedModelList
                models={filterModels(groupedModels.free)}
                selectedModels={selectedModels}
                onToggleModel={handleToggleModel}
                isModelSelected={isModelSelected}
              />
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
