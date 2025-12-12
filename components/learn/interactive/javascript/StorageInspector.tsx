'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  RotateCcw,
  HardDrive,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types for storage inspection
export interface StorageItem {
  key: string;
  value: string;
  size: number;
}

export interface StorageQuota {
  used: number;
  total: number;
  percentage: number;
}

export type StorageType = 'localStorage' | 'sessionStorage';

export interface StorageInspectorProps {
  /** Initial storage type to display */
  storageType?: StorageType;
  /** Whether to allow editing storage values */
  allowEdit?: boolean;
  /** Whether to show storage quota information */
  showQuota?: boolean;
  /** Callback when storage changes */
  onStorageChange?: (items: StorageItem[]) => void;
}


/**
 * Get all items from a storage object
 */
export function getStorageItems(storage: Storage): StorageItem[] {
  const items: StorageItem[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key) || '';
      items.push({
        key,
        value,
        size: new Blob([key + value]).size,
      });
    }
  }
  return items.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Calculate storage quota usage
 */
export function calculateStorageQuota(storage: Storage): StorageQuota {
  let used = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key) || '';
      used += new Blob([key + value]).size;
    }
  }
  // Most browsers have ~5MB limit for localStorage/sessionStorage
  const total = 5 * 1024 * 1024; // 5MB in bytes
  return {
    used,
    total,
    percentage: (used / total) * 100,
  };
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Try to parse JSON and format it
 */
function tryFormatJson(value: string): { formatted: string; isJson: boolean } {
  try {
    const parsed = JSON.parse(value);
    return { formatted: JSON.stringify(parsed, null, 2), isJson: true };
  } catch {
    return { formatted: value, isJson: false };
  }
}

/**
 * StorageInspector Component
 * Interactive browser storage visualization with add/edit/delete capabilities
 * Requirements: 10.5
 */
export function StorageInspector({
  storageType: initialStorageType = 'localStorage',
  allowEdit = true,
  showQuota = true,
  onStorageChange,
}: StorageInspectorProps) {
  const [storageType, setStorageType] = useState<StorageType>(initialStorageType);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Track version to trigger re-renders
  const [version, setVersion] = useState(0);
  const onStorageChangeRef = useRef(onStorageChange);
  onStorageChangeRef.current = onStorageChange;

  // Get the current storage object
  const storage = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
  }, [storageType]);

  // Compute items and quota from storage (re-computed when version changes)
  const computedData = useMemo(() => {
    if (!storage) return { items: [], quota: { used: 0, total: 5 * 1024 * 1024, percentage: 0 } };
    return {
      items: getStorageItems(storage),
      quota: calculateStorageQuota(storage),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage, version]);

  // Sync computed data to state for animations
  const currentItems = computedData.items;
  const currentQuota = computedData.quota;

  // Refresh storage items
  const refreshItems = useCallback(() => {
    setVersion((v) => v + 1);
    if (storage) {
      onStorageChangeRef.current?.(getStorageItems(storage));
    }
  }, [storage]);

  // Storage event listener for cross-tab updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        (storageType === 'localStorage' && e.storageArea === window.localStorage) ||
        (storageType === 'sessionStorage' && e.storageArea === window.sessionStorage)
      ) {
        setVersion((v) => v + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageType]);

  // Show temporary message
  const showMessage = useCallback((type: 'error' | 'success', message: string) => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(null), 3000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 2000);
    }
  }, []);

  // Add new item
  const handleAdd = useCallback(() => {
    if (!storage || !newKey.trim()) {
      showMessage('error', 'Key cannot be empty');
      return;
    }
    try {
      storage.setItem(newKey.trim(), newValue);
      refreshItems();
      setIsAdding(false);
      setNewKey('');
      setNewValue('');
      showMessage('success', `Added "${newKey.trim()}"`);
    } catch (e) {
      showMessage('error', e instanceof Error ? e.message : 'Failed to add item');
    }
  }, [storage, newKey, newValue, refreshItems, showMessage]);

  // Update existing item
  const handleUpdate = useCallback((key: string) => {
    if (!storage) return;
    try {
      storage.setItem(key, editValue);
      refreshItems();
      setEditingKey(null);
      setEditValue('');
      showMessage('success', `Updated "${key}"`);
    } catch (e) {
      showMessage('error', e instanceof Error ? e.message : 'Failed to update item');
    }
  }, [storage, editValue, refreshItems, showMessage]);

  // Delete item
  const handleDelete = useCallback((key: string) => {
    if (!storage) return;
    storage.removeItem(key);
    refreshItems();
    showMessage('success', `Deleted "${key}"`);
  }, [storage, refreshItems, showMessage]);

  // Clear all storage
  const handleClearAll = useCallback(() => {
    if (!storage) return;
    storage.clear();
    refreshItems();
    showMessage('success', 'Cleared all items');
  }, [storage, refreshItems, showMessage]);

  // Start editing
  const startEditing = useCallback((key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingKey(null);
    setEditValue('');
  }, []);

  // Copy value to clipboard
  const handleCopy = useCallback(async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Storage Inspector</h3>
          </div>
          <div className="flex items-center gap-2">
            <Select value={storageType} onValueChange={(v) => setStorageType(v as StorageType)}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="localStorage">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3 h-3" />
                    localStorage
                  </div>
                </SelectItem>
                <SelectItem value="sessionStorage">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    sessionStorage
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshItems}
              className="h-8 w-8 p-0"
              aria-label="Refresh"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>


      {/* Quota Display */}
      {showQuota && (
        <div className="px-6 py-3 border-b border-border bg-secondary/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="font-mono">
              {formatBytes(currentQuota.used)} / {formatBytes(currentQuota.total)}
            </span>
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                currentQuota.percentage > 80 ? 'bg-red-500' : currentQuota.percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(currentQuota.percentage, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground text-right">
            {currentQuota.percentage.toFixed(2)}% used
          </div>
        </div>
      )}

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-3 bg-red-500/10 border-b border-red-500/30"
          >
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-3 bg-green-500/10 border-b border-green-500/30"
          >
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {allowEdit && (
        <div className="px-6 py-3 border-b border-border flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Item
          </Button>
          {currentItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Add New Item Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 border-b border-border bg-primary/5"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Key</label>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Enter key name..."
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Value</label>
                <Textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter value (can be JSON)..."
                  className="font-mono min-h-[80px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAdd} className="gap-1">
                  <Save className="w-3 h-3" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewKey('');
                    setNewValue('');
                  }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Storage Items */}
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {currentItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No items in {storageType}</p>
            {allowEdit && (
              <p className="text-xs mt-1">Click &quot;Add Item&quot; to create one</p>
            )}
          </div>
        ) : (
          currentItems.map((item) => {
            const { formatted, isJson } = tryFormatJson(item.value);
            const isEditing = editingKey === item.key;

            return (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-medium text-primary truncate">
                        {item.key}
                      </span>
                      {isJson && (
                        <Badge variant="secondary" className="text-xs">
                          JSON
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(item.size)}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="font-mono text-sm min-h-[100px]"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(item.key)}
                            className="gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEditing}>
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <pre className="font-mono text-xs text-muted-foreground bg-secondary/30 p-2 rounded overflow-x-auto max-h-[150px]">
                        {formatted}
                      </pre>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(item.key, item.value)}
                              className="h-8 w-8 p-0"
                            >
                              {copied === item.key ? (
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy value</TooltipContent>
                        </Tooltip>

                        {allowEdit && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(item.key, item.value)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item.key)}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-border bg-secondary/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentItems.length} item{currentItems.length !== 1 ? 's' : ''}</span>
          <span>
            {storageType === 'localStorage' ? 'Persists until cleared' : 'Cleared when tab closes'}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default StorageInspector;
