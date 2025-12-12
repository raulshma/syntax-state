'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Cloud, 
  Building2, 
  Users, 
  Zap,
  Check,
  X,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type HostingType = 'shared' | 'vps' | 'dedicated' | 'cloud' | 'serverless';

export interface HostingTypeInfo {
  type: HostingType;
  name: string;
  analogy: string;
  description: string;
  pros: string[];
  cons: string[];
  useCases: string[];
  priceRange: string;
  icon: React.ReactNode;
}

const hostingTypes: HostingTypeInfo[] = [
  {
    type: 'shared',
    name: 'Shared Hosting',
    analogy: 'Like sharing an apartment with roommates',
    description: 'Multiple websites share the same server resources (CPU, RAM, storage). The hosting provider manages everything.',
    pros: [
      'Most affordable option',
      'Easy to set up, no technical knowledge needed',
      'Maintenance handled by provider',
      'Good for beginners and small sites',
    ],
    cons: [
      'Limited resources and performance',
      'Other sites can affect your performance',
      'Less control over server settings',
      'Security risks from neighboring sites',
    ],
    useCases: [
      'Personal blogs',
      'Small business websites',
      'Portfolio sites',
      'Low-traffic websites',
    ],
    priceRange: '$3 - $15/month',
    icon: <Users className="w-6 h-6" />,
  },
  {
    type: 'vps',
    name: 'VPS (Virtual Private Server)',
    analogy: 'Like having your own condo in a building',
    description: 'A physical server is divided into virtual compartments. You get dedicated resources within a shared physical machine.',
    pros: [
      'Dedicated resources guaranteed',
      'More control than shared hosting',
      'Scalable - upgrade as you grow',
      'Better security isolation',
    ],
    cons: [
      'Requires some technical knowledge',
      'More expensive than shared',
      'You manage your virtual server',
      'Physical hardware still shared',
    ],
    useCases: [
      'Growing businesses',
      'E-commerce sites',
      'Web applications',
      'Development environments',
    ],
    priceRange: '$20 - $100/month',
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    type: 'dedicated',
    name: 'Dedicated Server',
    analogy: 'Like owning your own house',
    description: 'An entire physical server exclusively for your use. Full control over hardware and software configuration.',
    pros: [
      'Maximum performance and resources',
      'Complete control over server',
      'Highest security level',
      'No resource sharing',
    ],
    cons: [
      'Most expensive option',
      'Requires technical expertise',
      'You handle all maintenance',
      'Hardware failures are your problem',
    ],
    useCases: [
      'Large enterprises',
      'High-traffic websites',
      'Resource-intensive applications',
      'Compliance-sensitive data',
    ],
    priceRange: '$100 - $500+/month',
    icon: <Server className="w-6 h-6" />,
  },
  {
    type: 'cloud',
    name: 'Cloud Hosting',
    analogy: 'Like a hotel chain with rooms everywhere',
    description: 'Your website runs on a network of connected servers. Resources are distributed and can scale automatically.',
    pros: [
      'Highly scalable on demand',
      'Pay only for what you use',
      'High availability and uptime',
      'Global distribution possible',
    ],
    cons: [
      'Costs can be unpredictable',
      'Can be complex to configure',
      'Potential vendor lock-in',
      'Requires monitoring usage',
    ],
    useCases: [
      'Startups expecting growth',
      'Applications with variable traffic',
      'Global applications',
      'Microservices architecture',
    ],
    priceRange: '$5 - $1000+/month (usage-based)',
    icon: <Cloud className="w-6 h-6" />,
  },
  {
    type: 'serverless',
    name: 'Serverless / Functions',
    analogy: 'Like ordering food delivery instead of cooking',
    description: 'No server management at all. Your code runs in response to events, and you only pay when it executes.',
    pros: [
      'Zero server management',
      'Automatic scaling',
      'Pay per execution only',
      'Focus purely on code',
    ],
    cons: [
      'Cold start latency',
      'Execution time limits',
      'Vendor lock-in risk',
      'Not suitable for all apps',
    ],
    useCases: [
      'API backends',
      'Event-driven processing',
      'Scheduled tasks',
      'Microservices',
    ],
    priceRange: '$0 - varies (per execution)',
    icon: <Zap className="w-6 h-6" />,
  },
];

interface HostingTypeSelectorProps {
  onSelect?: (type: HostingType) => void;
  showComparison?: boolean;
}

export function HostingTypeSelector({ 
  onSelect, 
  showComparison: initialShowComparison = false 
}: HostingTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<HostingType | null>(null);
  const [showComparison, setShowComparison] = useState(initialShowComparison);

  const handleSelect = (type: HostingType) => {
    setSelectedType(type);
    onSelect?.(type);
  };

  const selectedInfo = hostingTypes.find(h => h.type === selectedType);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          Hosting Type Explorer
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComparison(!showComparison)}
          className="gap-2"
        >
          {showComparison ? (
            <>
              <LayoutGrid className="w-4 h-4" />
              Card View
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              Compare All
            </>
          )}
        </Button>
      </div>

      {showComparison ? (
        <ComparisonView hostingTypes={hostingTypes} />
      ) : (
        <>
          {/* Hosting type cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {hostingTypes.map((hosting) => (
              <motion.button
                key={hosting.type}
                onClick={() => handleSelect(hosting.type)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  'hover:border-primary/50 hover:bg-primary/5',
                  selectedType === hosting.type
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                  selectedType === hosting.type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                )}>
                  {hosting.icon}
                </div>
                <h4 className="font-medium text-sm">{hosting.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {hosting.priceRange}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Selected type details */}
          <AnimatePresence mode="wait">
            {selectedInfo && (
              <motion.div
                key={selectedInfo.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 bg-card border shadow-sm">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {selectedInfo.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{selectedInfo.name}</h3>
                      <p className="text-sm text-muted-foreground italic mt-1">
                        &ldquo;{selectedInfo.analogy}&rdquo;
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-primary">
                        {selectedInfo.priceRange}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6">
                    {selectedInfo.description}
                  </p>

                  {/* Pros, Cons, Use Cases */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Pros */}
                    <div>
                      <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Advantages
                      </h4>
                      <ul className="space-y-2">
                        {selectedInfo.pros.map((pro, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <ChevronRight className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" />
                            {pro}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div>
                      <h4 className="font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Disadvantages
                      </h4>
                      <ul className="space-y-2">
                        {selectedInfo.cons.map((con, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <ChevronRight className="w-3 h-3 mt-1 text-red-500 flex-shrink-0" />
                            {con}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Best For
                      </h4>
                      <ul className="space-y-2">
                        {selectedInfo.useCases.map((useCase, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <ChevronRight className="w-3 h-3 mt-1 text-blue-500 flex-shrink-0" />
                            {useCase}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt to select */}
          {!selectedInfo && (
            <div className="text-center py-8 text-muted-foreground">
              <p>👆 Click on a hosting type above to learn more about it</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Comparison table view
function ComparisonView({ hostingTypes }: { hostingTypes: HostingTypeInfo[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 font-medium">Feature</th>
            {hostingTypes.map((h) => (
              <th key={h.type} className="text-center p-3 font-medium min-w-[120px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {h.icon}
                  </div>
                  <span className="text-xs">{h.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/50">
            <td className="p-3 font-medium text-muted-foreground">Price Range</td>
            {hostingTypes.map((h) => (
              <td key={h.type} className="p-3 text-center text-xs">
                {h.priceRange}
              </td>
            ))}
          </tr>
          <tr className="border-b border-border/50 bg-muted/30">
            <td className="p-3 font-medium text-muted-foreground">Control Level</td>
            {hostingTypes.map((h) => (
              <td key={h.type} className="p-3 text-center">
                <ControlIndicator type={h.type} />
              </td>
            ))}
          </tr>
          <tr className="border-b border-border/50">
            <td className="p-3 font-medium text-muted-foreground">Scalability</td>
            {hostingTypes.map((h) => (
              <td key={h.type} className="p-3 text-center">
                <ScalabilityIndicator type={h.type} />
              </td>
            ))}
          </tr>
          <tr className="border-b border-border/50 bg-muted/30">
            <td className="p-3 font-medium text-muted-foreground">Technical Skill</td>
            {hostingTypes.map((h) => (
              <td key={h.type} className="p-3 text-center">
                <SkillIndicator type={h.type} />
              </td>
            ))}
          </tr>
          <tr className="border-b border-border/50">
            <td className="p-3 font-medium text-muted-foreground">Best For</td>
            {hostingTypes.map((h) => (
              <td key={h.type} className="p-3 text-center text-xs text-muted-foreground">
                {h.useCases[0]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Helper components for comparison indicators
function ControlIndicator({ type }: { type: HostingType }) {
  const levels: Record<HostingType, number> = {
    shared: 1,
    vps: 3,
    dedicated: 5,
    cloud: 4,
    serverless: 2,
  };
  return <LevelDots level={levels[type]} max={5} color="blue" />;
}

function ScalabilityIndicator({ type }: { type: HostingType }) {
  const levels: Record<HostingType, number> = {
    shared: 1,
    vps: 3,
    dedicated: 2,
    cloud: 5,
    serverless: 5,
  };
  return <LevelDots level={levels[type]} max={5} color="green" />;
}

function SkillIndicator({ type }: { type: HostingType }) {
  const levels: Record<HostingType, number> = {
    shared: 1,
    vps: 3,
    dedicated: 5,
    cloud: 4,
    serverless: 3,
  };
  return <LevelDots level={levels[type]} max={5} color="orange" />;
}

function LevelDots({ level, max, color }: { level: number; max: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full',
            i < level ? colorClasses[color] : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}

// Export the hosting types data for testing
export { hostingTypes };
