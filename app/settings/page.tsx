import { Sidebar } from "@/components/dashboard/sidebar";
import { getUserProfile } from "@/lib/actions/user";
import { getUserSubscriptionStatus } from "@/lib/actions/stripe";
import { SettingsContent } from "./settings-content";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const [profileResult, subscriptionResult] = await Promise.all([
    getUserProfile(),
    getUserSubscriptionStatus(),
  ]);

  if (!profileResult.success) {
    redirect("/login");
  }

  const profile = profileResult.data;
  const subscription = subscriptionResult;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-mono text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Manage your account and preferences
          </p>

          <SettingsContent profile={profile} subscription={subscription} />
        </div>
      </main>
    </div>
  );
}
