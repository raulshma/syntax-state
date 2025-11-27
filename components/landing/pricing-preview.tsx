"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PRICING_TIERS, formatPrice } from "@/lib/pricing-data";

export function PricingPreview() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
            Simple, transparent pricing.
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you're ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              className={`relative rounded-[2rem] p-8 flex flex-col transition-all duration-300 ${
                tier.featured
                  ? "bg-foreground text-background shadow-2xl scale-105 z-10 ring-1 ring-white/10"
                  : "bg-secondary/30 border border-border/50 hover:bg-secondary/50"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mb-8">
                <h3
                  className={`text-xl font-medium mb-2 ${
                    tier.featured ? "text-background" : "text-foreground"
                  }`}
                >
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span
                    className={`text-5xl font-semibold tracking-tight ${
                      tier.featured ? "text-background" : "text-foreground"
                    }`}
                  >
                    {formatPrice(tier.price)}
                  </span>
                  <span
                    className={`text-sm ${
                      tier.featured
                        ? "text-background/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tier.period}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    tier.featured
                      ? "text-background/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {tier.shortDescription}
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {tier.previewFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      className={`w-5 h-5 shrink-0 ${
                        tier.featured ? "text-background" : "text-primary"
                      }`}
                    />
                    <span
                      className={
                        tier.featured
                          ? "text-background/90"
                          : "text-muted-foreground"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href || `/pricing?plan=${tier.id}`}
                className="w-full"
              >
                <Button
                  size="lg"
                  className={`w-full rounded-full h-12 text-base font-medium transition-all ${
                    tier.featured
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/pricing"
            className="text-sm font-medium text-primary hover:text-foreground transition-colors"
          >
            Compare all features &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
