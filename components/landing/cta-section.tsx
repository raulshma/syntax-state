"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="relative rounded-[2.5rem] overflow-hidden bg-foreground text-background px-6 py-24 md:px-20 md:py-32 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-secondary/20 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl md:leading-[1.1] font-semibold tracking-tight mb-8">
              Ready to ace your next interview?
            </h2>

            <p className="text-xl md:text-2xl text-background/80 mb-12 font-medium">
              Join thousands of engineers who've transformed their career
              trajectory.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="rounded-full h-14 px-8 text-lg font-medium bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-all"
                >
                  Start Preparing Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full h-14 px-8 text-lg font-medium border-background/20 text-background hover:bg-background/10 bg-transparent"
                >
                  View Plans
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm text-background/60">
              No credit card required for free tier.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
