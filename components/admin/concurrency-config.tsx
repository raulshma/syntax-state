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
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="font-mono">AI Concurrency Limit</CardTitle>
        </div>
        <CardDescription>
          Control how many AI requests can run in parallel during interview prep
          generation. Lower values reduce API load, higher values speed up
          generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-[200px]">
            <Label className="text-sm text-muted-foreground mb-2 block">
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
              className="font-mono"
            />
          </div>
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
              "Save"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Default: 2 | Range: 1-10 | When generating interview prep, {limit}{" "}
          module{limit !== 1 ? "s" : ""} will be generated simultaneously.
        </p>
      </CardContent>
    </Card>
  );
}
