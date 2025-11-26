'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, HelpCircle, Loader2, Sparkles, CreditCard } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createCheckout } from '@/lib/actions/stripe';
import { toast } from 'sonner';
import { PRICING_TIERS, COMPARISON_FEATURES, formatPrice, type PricingTier } from '@/lib/pricing-data';
import { useSharedHeader } from '@/components/dashboard/shared-header-context';
import { getCurrentUser } from '@/lib/actions/user';

function UpgradeCard({ tier, index, userPlan }: { tier: PricingTier; index: number; userPlan: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Determine if this tier is the user's current plan
  // FREE tier has no plan property, PRO has 'PRO', MAX has 'MAX'
  const isCurrentPlan = tier.plan ? tier.plan === userPlan : userPlan === 'FREE';

  const handleSubscribe = async () => {
    if (isCurrentPlan) {
      toast.info(`You're already on the ${tier.name} plan`);
      return;
    }
    if (!isSignedIn) {
      router.push(`/login?redirect_url=/settings/upgrade`);
      return;
    }
    if (!tier.plan) {
      // Can't subscribe to free tier
      return;
    }
    setIsLoading(true);
    try {
      const result = await createCheckout(tier.plan);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Failed to create checkout session');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`bg-card p-6 flex flex-col relative border ${tier.featured ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {tier.badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {tier.badge}
        </Badge>
      )}
      <div className="mb-4">
        <h3 className="font-mono text-lg text-foreground mb-1">{tier.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{tier.shortDescription}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-mono text-foreground">{formatPrice(tier.price)}</span>
          <span className="text-muted-foreground text-sm">{tier.period}</span>
        </div>
      </div>
      <ul className="space-y-2 mb-6 flex-1">
        {tier.features.slice(0, 6).map((feature) => (
          <li key={feature.name} className="flex items-start gap-2">
            {feature.included ? <Check className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" /> : <X className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
            <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
              {feature.name}
              {feature.tooltip && (
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 inline ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{feature.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </span>
          </li>
        ))}
      </ul>
      <Button variant={tier.featured && !isCurrentPlan ? 'default' : 'outline'} className="w-full" onClick={handleSubscribe} disabled={isLoading || isCurrentPlan}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          tier.cta
        )}
      </Button>
    </motion.div>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-mono text-foreground">Feature</th>
            {PRICING_TIERS.map((tier) => (
              <th key={tier.id} className="text-center py-3 px-4 font-mono text-foreground">
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_FEATURES.map((feature, index) => (
            <tr key={feature.name} className={index < COMPARISON_FEATURES.length - 1 ? 'border-b border-border' : ''}>
              <td className="py-3 px-4 text-muted-foreground">{feature.name}</td>
              {(['free', 'pro', 'max'] as const).map((plan) => {
                const value = feature[plan];
                return (
                  <td key={plan} className="py-3 px-4 text-center">
                    {typeof value === 'boolean' ? (
                      value ? <Check className="w-4 h-4 mx-auto text-foreground" /> : <X className="w-4 h-4 mx-auto text-muted-foreground" />
                    ) : (
                      <span className="text-foreground">{value}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UpgradePageContent() {
  const { setHeader } = useSharedHeader();
  const [userPlan, setUserPlan] = useState<string>('FREE');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHeader({
      badge: 'Upgrade',
      badgeIcon: CreditCard,
      title: 'Upgrade Your Plan',
      description: 'Get more interviews, iterations, and features to supercharge your prep.',
    });
  }, [setHeader]);

  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const result = await getCurrentUser();
        if (result.success) {
          setUserPlan(result.data.plan);
        }
      } catch (error) {
        console.error('Failed to fetch user plan:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserPlan();
  }, []);

  return (
    <>
      <TooltipProvider>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {PRICING_TIERS.map((tier, index) => (
            <UpgradeCard key={tier.id} tier={tier} index={index} userPlan={userPlan} />
          ))}
        </div>
      </TooltipProvider>

      <motion.div className="bg-card border border-border p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-mono text-foreground mb-4">Plan Comparison</h2>
        <ComparisonTable />
      </motion.div>
    </>
  );
}
