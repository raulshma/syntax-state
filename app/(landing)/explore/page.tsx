'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Map, Clock, TrendingUp, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { getPublicJourneys } from '@/lib/actions/public-journeys';
import type { PublicJourney } from '@/lib/db/schemas/visibility';

/**
 * Public Journeys Listing Page
 * 
 * Displays publicly visible journeys in a grid for unauthenticated visitors.
 * No authentication required.
 */

function PublicJourneyCard({ journey, index }: { journey: PublicJourney; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/explore/${journey.slug}`}>
        <article className="group relative flex flex-col h-full bg-card hover:bg-linear-to-br hover:from-card hover:to-accent/5 rounded-3xl border border-border/60 hover:border-primary/20 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
          {/* Decorative gradient blob */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="p-6 flex-1 flex flex-col relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="p-3 rounded-2xl bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                <Map className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-secondary/50 uppercase text-[10px] tracking-wider font-bold text-muted-foreground/80">
                {journey.category}
              </Badge>
            </div>
            
            {/* Title & Description */}
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-1">
              {journey.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed flex-1">
              {journey.description}
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-5 text-xs font-medium text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>{journey.nodes.length} topics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{journey.estimatedHours}h</span>
              </div>
            </div>
            
            {/* Progress placeholder */}
            <div className="mt-auto">
              <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary/20 w-0 group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 bg-secondary/20 border-t border-border/50 group-hover:bg-secondary/30 transition-colors">
            <Button 
              variant="ghost" 
              className="w-full justify-between hover:bg-background hover:text-foreground text-muted-foreground group/btn"
            >
              <span className="font-semibold">Preview Journey</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}


export default function PublicJourneysPage() {
  const [journeys, setJourneys] = useState<PublicJourney[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadJourneys() {
      try {
        const data = await getPublicJourneys();
        setJourneys(data);
      } catch (error) {
        console.error('Failed to load public journeys:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadJourneys();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-8 md:pt-32 md:pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Explore Learning Paths
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Learning Journeys
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Structured paths to master new skills. Preview our curated journeys and start learning today.
            </motion.p>
          </div>
        </section>

        {/* Journeys Grid */}
        <section className="py-12 md:py-20 px-6">
          <div className="max-w-[1400px] mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : journeys.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 bg-card/50 rounded-3xl border border-dashed border-border"
              >
                <div className="w-20 h-20 rounded-3xl bg-secondary/30 flex items-center justify-center mx-auto mb-6">
                  <Map className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No public journeys available</h2>
                <p className="text-muted-foreground mb-6">Check back soon for new learning paths!</p>
                <Link href="/onboarding">
                  <Button className="rounded-full">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {journeys.map((journey, index) => (
                  <PublicJourneyCard key={journey.slug} journey={journey} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Ready to start learning?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Sign up for free to track your progress, unlock AI assistance, and access the full learning experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="h-14 px-10 text-base font-medium rounded-2xl bg-foreground text-background hover:opacity-90 w-full sm:w-auto">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="h-14 px-10 text-base font-medium rounded-2xl w-full sm:w-auto">
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
