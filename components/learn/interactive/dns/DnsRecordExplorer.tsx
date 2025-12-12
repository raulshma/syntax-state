'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Server,
  Mail,
  FileText,
  Link2,
  Shield,
  ChevronRight,
  Search,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';

export interface DnsRecord {
  type: DnsRecordType;
  name: string;
  description: string;
  purpose: string;
  format: string;
  example: {
    name: string;
    value: string;
    ttl: number;
  };
  icon: React.ReactNode;
  color: string;
}

const dnsRecords: DnsRecord[] = [
  {
    type: 'A',
    name: 'A Record (Address)',
    description: 'Maps a domain name to an IPv4 address',
    purpose: 'The most fundamental DNS record. It tells the internet where to find your website by pointing your domain to a server\'s IP address.',
    format: 'domain.com → IPv4 address (e.g., 192.168.1.1)',
    example: {
      name: 'example.com',
      value: '93.184.216.34',
      ttl: 3600,
    },
    icon: <Globe className="w-5 h-5" />,
    color: 'blue',
  },
  {
    type: 'AAAA',
    name: 'AAAA Record (IPv6 Address)',
    description: 'Maps a domain name to an IPv6 address',
    purpose: 'Same as A record but for the newer IPv6 addresses. As IPv4 addresses run out, AAAA records become increasingly important.',
    format: 'domain.com → IPv6 address (e.g., 2001:0db8::1)',
    example: {
      name: 'example.com',
      value: '2606:2800:220:1:248:1893:25c8:1946',
      ttl: 3600,
    },
    icon: <Globe className="w-5 h-5" />,
    color: 'indigo',
  },
  {
    type: 'CNAME',
    name: 'CNAME Record (Canonical Name)',
    description: 'Creates an alias from one domain to another',
    purpose: 'Points one domain to another domain instead of an IP. Useful for subdomains or when you want multiple names to resolve to the same place.',
    format: 'alias.domain.com → target.domain.com',
    example: {
      name: 'www.example.com',
      value: 'example.com',
      ttl: 3600,
    },
    icon: <Link2 className="w-5 h-5" />,
    color: 'green',
  },
  {
    type: 'MX',
    name: 'MX Record (Mail Exchange)',
    description: 'Specifies mail servers for the domain',
    purpose: 'Directs email to the correct mail servers. Without MX records, you cannot receive email at your domain.',
    format: 'domain.com → mail server (with priority)',
    example: {
      name: 'example.com',
      value: '10 mail.example.com',
      ttl: 3600,
    },
    icon: <Mail className="w-5 h-5" />,
    color: 'orange',
  },
  {
    type: 'TXT',
    name: 'TXT Record (Text)',
    description: 'Stores arbitrary text data for various purposes',
    purpose: 'Used for domain verification, email security (SPF, DKIM, DMARC), and other services that need to verify domain ownership.',
    format: 'domain.com → "text value"',
    example: {
      name: 'example.com',
      value: 'v=spf1 include:_spf.google.com ~all',
      ttl: 3600,
    },
    icon: <FileText className="w-5 h-5" />,
    color: 'purple',
  },
  {
    type: 'NS',
    name: 'NS Record (Name Server)',
    description: 'Specifies authoritative name servers for the domain',
    purpose: 'Tells the internet which DNS servers are responsible for your domain. These are set at your domain registrar.',
    format: 'domain.com → nameserver.provider.com',
    example: {
      name: 'example.com',
      value: 'ns1.exampledns.com',
      ttl: 86400,
    },
    icon: <Server className="w-5 h-5" />,
    color: 'cyan',
  },
];

interface DnsRecordExplorerProps {
  domain?: string;
  showAllTypes?: boolean;
}

export function DnsRecordExplorer({
  domain: initialDomain = 'example.com',
  showAllTypes = true,
}: DnsRecordExplorerProps) {
  const [selectedType, setSelectedType] = useState<DnsRecordType | null>(null);
  const [searchDomain, setSearchDomain] = useState(initialDomain);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const selectedRecord = dnsRecords.find((r) => r.type === selectedType);

  // Reset to initial state - Requirements 11.2
  const handleReset = () => {
    setSelectedType(null);
    setSearchDomain(initialDomain);
    setCopiedValue(null);
  };

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string; bgActive: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-500', bgActive: 'bg-blue-500/20' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500', text: 'text-indigo-500', bgActive: 'bg-indigo-500/20' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-500', bgActive: 'bg-green-500/20' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-500', bgActive: 'bg-orange-500/20' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-500', bgActive: 'bg-purple-500/20' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500', text: 'text-cyan-500', bgActive: 'bg-cyan-500/20' },
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          DNS Record Explorer
        </h3>

        {/* Domain lookup simulation */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchDomain}
              onChange={(e) => setSearchDomain(e.target.value)}
              placeholder="Enter domain..."
              className="pl-9 w-[200px] h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Record type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {dnsRecords.map((record) => {
          const colors = colorClasses[record.color];
          const isSelected = selectedType === record.type;

          return (
            <motion.button
              key={record.type}
              onClick={() => setSelectedType(isSelected ? null : record.type)}
              className={cn(
                'p-4 rounded-xl border-2 transition-all text-center',
                'hover:border-primary/50',
                isSelected
                  ? `${colors.bgActive} ${colors.border}`
                  : `${colors.bg} border-transparent`
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2',
                  isSelected ? colors.text : 'text-muted-foreground',
                  isSelected ? colors.bgActive : 'bg-secondary'
                )}
              >
                {record.icon}
              </div>
              <h4 className="font-bold text-lg">{record.type}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {record.name.split('(')[1]?.replace(')', '') || record.name}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Selected record details */}
      <AnimatePresence mode="wait">
        {selectedRecord && (
          <motion.div
            key={selectedRecord.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6 bg-card border shadow-sm">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    colorClasses[selectedRecord.color].bg,
                    colorClasses[selectedRecord.color].text
                  )}
                >
                  {selectedRecord.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedRecord.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRecord.description}
                  </p>
                </div>
              </div>

              {/* Purpose */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Purpose
                </h4>
                <p className="text-muted-foreground text-sm pl-6">
                  {selectedRecord.purpose}
                </p>
              </div>

              {/* Format */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Format
                </h4>
                <code className="text-sm bg-secondary px-3 py-2 rounded-lg block ml-6">
                  {selectedRecord.format}
                </code>
              </div>

              {/* Example lookup */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Example Record for {searchDomain}
                </h4>
                <div className="ml-6 p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <code className="text-sm font-mono">
                        {selectedRecord.example.name.replace('example.com', searchDomain)}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <code className="text-sm font-mono">{selectedRecord.type}</code>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">Value:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono truncate max-w-[250px]">
                          {selectedRecord.example.value}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopy(selectedRecord.example.value)}
                        >
                          {copiedValue === selectedRecord.example.value ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">TTL:</span>
                      <code className="text-sm font-mono">
                        {selectedRecord.example.ttl}s ({Math.floor(selectedRecord.example.ttl / 60)} min)
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt to select */}
      {!selectedRecord && (
        <div className="text-center py-8 text-muted-foreground">
          <p>👆 Click on a DNS record type above to learn more about it</p>
        </div>
      )}
    </div>
  );
}

// Export the DNS records data for testing
export { dnsRecords };
