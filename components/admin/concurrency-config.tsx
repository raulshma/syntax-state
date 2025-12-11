"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Check, Layers } from "lucide-react";
import { setAIConcurrencyLimit } from "@/lib/actions/admin";

interface ConcurrencyConfigProps {
  initialLimit: number;
}

export function ConcurrencyConfig({ initialLimit }: ConcurrencyConfigProps) {
  const [limit, setLimit] = useState(initialLimit);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const result = await setAIConcurrencyLimit(limit);
      if (result.success) {
        setLimit(result.limit);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <Card className="border-0 shadow-xl shadow-black/5 dark:shadow-black/20 bg-card/80  rounded-3xl overflow-hidden">
      <CardHeader className="p-6 md:p-8 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">AI Concurrency Limit</CardTitle>
            <CardDescription className="mt-1">
              Control how many AI requests can run in parallel during interview prep generation.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 sm:max-w-[200px]">
            <Label className="text-sm font-medium mb-2 block">
              Max Concurrent Requests
            </Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setLimit(Math.max(1, Math.min(10, val)));
                setSaved(false);
              }}
              min={1}
              max={10}
              className="font-mono h-12 rounded-xl bg-secondary/30 border-transparent focus:bg-background"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full sm:w-auto h-12 px-8 rounded-xl font-medium shadow-lg shadow-primary/20"
          >
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
              "Save Limit"
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-4 rounded-2xl">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <p>
            Default: 2 | Range: 1-10 | When generating interview prep, <span className="font-mono font-medium text-foreground">{limit}</span> module{limit !== 1 ? "s" : ""} will be generated simultaneously.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
