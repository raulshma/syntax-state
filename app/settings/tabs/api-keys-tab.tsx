"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Trash2,
} from "lucide-react";
import { saveByokApiKey, removeByokApiKey } from "@/lib/actions/user";

interface ApiKeysTabProps {
  hasByokKey: boolean;
  plan: string;
}

export function ApiKeysTab({ hasByokKey, plan }: ApiKeysTabProps) {
  const router = useRouter();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(hasByokKey);
  const [error, setError] = useState<string | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await saveByokApiKey(apiKey.trim());
      if (result.success) {
        setIsSaved(true);
        setApiKey("");
        router.refresh();
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError("Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await removeByokApiKey();
      if (result.success) {
        setIsSaved(false);
        router.refresh();
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError("Failed to remove API key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-mono text-lg">
            Bring Your Own Key (BYOK)
          </CardTitle>
          <CardDescription>
            Use your own API key for unlimited usage
            {plan === "MAX" && (
              <Badge variant="default" className="ml-2">
                Max Plan
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              With BYOK, you get unlimited interview preps and AI interactions.
              Your API key is encrypted and stored securely.
            </p>
          </div>

          {isSaved ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 border border-green-500/30 bg-green-500/5">
                <Check className="w-4 h-4 text-green-500" />
                <p className="text-sm text-foreground">API key configured</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleRemoveApiKey}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Remove API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="apikey"
                  className="text-sm text-muted-foreground mb-2 block"
                >
                  OpenRouter API Key
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apikey"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-or-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get your key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    openrouter.ai
                  </a>
                </p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex items-start gap-3 p-4 border border-yellow-500/30 bg-yellow-500/5">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Your API usage will be billed directly by OpenRouter. We
                  recommend setting up usage limits in your provider dashboard.
                </p>
              </div>

              <Button onClick={handleSaveApiKey} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
