"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Download, Trash2 } from "lucide-react";

interface ProfileTabProps {
  profile: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "";

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-mono text-lg">
            Profile Information
          </CardTitle>
          <CardDescription>
            Your account details from your login provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm text-muted-foreground mb-2 block"
              >
                Name
              </Label>
              <Input
                id="name"
                value={fullName}
                disabled
                className="font-mono bg-muted"
              />
            </div>
            <div>
              <Label
                htmlFor="email"
                className="text-sm text-muted-foreground mb-2 block"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                disabled
                className="font-mono bg-muted"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Profile information is managed through your login provider.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-mono text-lg">Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Email notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive updates about your interviews
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Marketing emails</p>
              <p className="text-xs text-muted-foreground">
                Receive tips and product updates
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-mono text-lg">Data Management</CardTitle>
          <CardDescription>Export or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-foreground">Export all data</p>
              <p className="text-xs text-muted-foreground">
                Download all your preps and settings
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border pt-4">
            <div>
              <p className="text-sm text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
