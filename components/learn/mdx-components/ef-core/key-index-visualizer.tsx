'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Search, 
  Database,
  ArrowRight,
  Zap,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AnimatedControls,
  type AnimationSpeed,
  speedMultipliers,
} from '@/components/learn/shared/animated-controls';

type KeyType = 'primary' | 'composite' | 'alternate';
type DemoMode = 'keys' | 'indexes';

interface TableRow {
  id: number;
  state?: string;
  licensePlate?: string;
  name: string;
  email?: string;
  highlighted?: boolean;
}

/**
 * KeyIndexVisualizer Component
 * Interactive visualization of primary keys, composite keys, and indexes
 */
export function KeyIndexVisualizer() {
  const [mode, setMode] = useState<DemoMode>('keys');
  const [keyType, setKeyType] = useState<KeyType>('primary');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

  const primaryKeyData: TableRow[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
    { id: 4, name: 'Diana', email: 'diana@example.com' },
  ];

  const compositeKeyData: TableRow[] = [
    { id: 1, state: 'CA', licensePlate: 'ABC123', name: 'Tesla Model 3' },
    { id: 2, state: 'CA', licensePlate: 'XYZ789', name: 'Honda Civic' },
    { id: 3, state: 'NY', licensePlate: 'ABC123', name: 'Ford F-150' },
    { id: 4, state: 'TX', licensePlate: 'DEF456', name: 'Toyota Camry' },
  ];

  const runSearch = useCallback(() => {
    setIsSearching(true);
    setSearchStep(0);
    setHighlightedRow(null);

    const steps = mode === 'indexes' ? [0, 1, 2] : [0, 1, 2, 3];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setSearchStep(currentStep);
        if (mode === 'indexes') {
          // Index search - direct lookup
          if (currentStep === 2) {
            setHighlightedRow(2);
          }
        } else {
          // Sequential scan for non-indexed
          setHighlightedRow(currentStep);
        }
        currentStep++;
      } else {
        setIsSearching(false);
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [mode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Keys & Indexes Visualizer
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'keys' ? 'default' : 'outline'}
            onClick={() => setMode('keys')}
          >
            <Key className="w-3 h-3 mr-1" />
            Keys
          </Button>
          <Button
            size="sm"
            variant={mode === 'indexes' ? 'default' : 'outline'}
            onClick={() => setMode('indexes')}
          >
            <Search className="w-3 h-3 mr-1" />
            Indexes
          </Button>
        </div>
      </div>

      {mode === 'keys' ? (
        <KeysDemo 
          keyType={keyType} 
          setKeyType={setKeyType}
          primaryKeyData={primaryKeyData}
          compositeKeyData={compositeKeyData}
        />
      ) : (
        <IndexesDemo 
          isSearching={isSearching}
          searchStep={searchStep}
          highlightedRow={highlightedRow}
          runSearch={runSearch}
          data={primaryKeyData}
        />
      )}
    </motion.div>
  );
}

function KeysDemo({ 
  keyType, 
  setKeyType,
  primaryKeyData,
  compositeKeyData
}: { 
  keyType: KeyType;
  setKeyType: (type: KeyType) => void;
  primaryKeyData: TableRow[];
  compositeKeyData: TableRow[];
}) {
  return (
    <>
      {/* Key Type Selector */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          {(['primary', 'composite', 'alternate'] as KeyType[]).map((type) => (
            <button
              key={type}
              onClick={() => setKeyType(type)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm transition-all',
                keyType === type
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {type === 'primary' && '🔑 Primary Key'}
              {type === 'composite' && '🔗 Composite Key'}
              {type === 'alternate' && '🔐 Alternate Key'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Table Visualization */}
        <div className="p-4 border-r border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">
            {keyType === 'primary' && 'Customers Table'}
            {keyType === 'composite' && 'Cars Table (State + LicensePlate)'}
            {keyType === 'alternate' && 'Users Table (Email as Alternate Key)'}
          </h4>
          
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50">
                <tr>
                  {keyType === 'primary' && (
                    <>
                      <th className="px-3 py-2 text-left">
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3 text-yellow-500" />
                          Id
                        </span>
                      </th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Email</th>
                    </>
                  )}
                  {keyType === 'composite' && (
                    <>
                      <th className="px-3 py-2 text-left">
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3 text-yellow-500" />
                          State
                        </span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3 text-yellow-500" />
                          LicensePlate
                        </span>
                      </th>
                      <th className="px-3 py-2 text-left">Name</th>
                    </>
                  )}
                  {keyType === 'alternate' && (
                    <>
                      <th className="px-3 py-2 text-left">
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3 text-yellow-500" />
                          Id
                        </span>
                      </th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3 text-purple-500" />
                          Email (AK)
                        </span>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(keyType === 'composite' ? compositeKeyData : primaryKeyData).map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {keyType === 'primary' && (
                      <>
                        <td className="px-3 py-2 font-mono text-yellow-500">{row.id}</td>
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                      </>
                    )}
                    {keyType === 'composite' && (
                      <>
                        <td className="px-3 py-2 font-mono text-yellow-500">{row.state}</td>
                        <td className="px-3 py-2 font-mono text-yellow-500">{row.licensePlate}</td>
                        <td className="px-3 py-2">{row.name}</td>
                      </>
                    )}
                    {keyType === 'alternate' && (
                      <>
                        <td className="px-3 py-2 font-mono text-yellow-500">{row.id}</td>
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 font-mono text-purple-500">{row.email}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-zinc-950">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Configuration</h4>
          <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">
            {keyType === 'primary' && `// Convention: Id or CustomerId
public class Customer
{
    public int Id { get; set; }  // Auto PK
    public string Name { get; set; }
}

// Or with [Key] attribute
[Key]
public int CustomerId { get; set; }

// Or Fluent API
modelBuilder.Entity<Customer>()
    .HasKey(c => c.CustomerId);`}
            {keyType === 'composite' && `// Composite Key - multiple columns
[PrimaryKey(nameof(State), nameof(LicensePlate))]
public class Car
{
    public string State { get; set; }
    public string LicensePlate { get; set; }
    public string Name { get; set; }
}

// Fluent API
modelBuilder.Entity<Car>()
    .HasKey(c => new { c.State, c.LicensePlate });`}
            {keyType === 'alternate' && `// Alternate Key - unique identifier
public class User
{
    public int Id { get; set; }  // Primary Key
    public string Name { get; set; }
    public string Email { get; set; }  // Alternate Key
}

// Fluent API
modelBuilder.Entity<User>()
    .HasAlternateKey(u => u.Email);

// Can be used as FK target!
.HasForeignKey(p => p.UserEmail)
.HasPrincipalKey(u => u.Email);`}
          </pre>
        </div>
      </div>

      {/* Key Info */}
      <div className="px-4 py-3 border-t border-border bg-secondary/20">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {keyType === 'primary' && (
              <><strong className="text-foreground">Primary Key:</strong> Uniquely identifies each row. EF Core auto-detects Id or [ClassName]Id properties.</>
            )}
            {keyType === 'composite' && (
              <><strong className="text-foreground">Composite Key:</strong> Multiple columns together form the unique identifier. Common for join tables.</>
            )}
            {keyType === 'alternate' && (
              <><strong className="text-foreground">Alternate Key:</strong> Additional unique identifier. Can be used as a foreign key target instead of the primary key.</>
            )}
          </p>
        </div>
      </div>
    </>
  );
}

function IndexesDemo({ 
  isSearching, 
  searchStep, 
  highlightedRow,
  runSearch,
  data
}: { 
  isSearching: boolean;
  searchStep: number;
  highlightedRow: number | null;
  runSearch: () => void;
  data: TableRow[];
}) {
  const [hasIndex, setHasIndex] = useState(true);

  return (
    <>
      {/* Index Toggle */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={hasIndex ? 'default' : 'outline'}
            onClick={() => setHasIndex(true)}
          >
            <Zap className="w-3 h-3 mr-1" />
            With Index
          </Button>
          <Button
            size="sm"
            variant={!hasIndex ? 'default' : 'outline'}
            onClick={() => setHasIndex(false)}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Without Index
          </Button>
        </div>
        <Button size="sm" onClick={runSearch} disabled={isSearching}>
          <Search className="w-3 h-3 mr-1" />
          Search for &quot;Charlie&quot;
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Table with Search Animation */}
        <div className="p-4 border-r border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">
            Customers Table {hasIndex && '(Indexed on Name)'}
          </h4>
          
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-3 py-2 text-left">Id</th>
                  <th className="px-3 py-2 text-left">
                    <span className="flex items-center gap-1">
                      Name
                      {hasIndex && <Search className="w-3 h-3 text-blue-500" />}
                    </span>
                  </th>
                  <th className="px-3 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <motion.tr 
                    key={i} 
                    className={cn(
                      'border-t border-border transition-colors',
                      isSearching && highlightedRow === i && 'bg-yellow-500/20',
                      isSearching && highlightedRow === i && row.name === 'Charlie' && 'bg-green-500/20'
                    )}
                    animate={isSearching && highlightedRow === i ? { scale: [1, 1.02, 1] } : {}}
                  >
                    <td className="px-3 py-2 font-mono">{row.id}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Search Progress */}
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-2 rounded bg-secondary/30 text-xs"
            >
              {hasIndex ? (
                <span className="text-green-500">
                  ⚡ Index lookup: Direct access to row {highlightedRow !== null ? highlightedRow + 1 : '...'}
                </span>
              ) : (
                <span className="text-yellow-500">
                  🔍 Table scan: Checking row {highlightedRow !== null ? highlightedRow + 1 : '...'} of {data.length}
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Code Example */}
        <div className="p-4 bg-zinc-950">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Index Configuration</h4>
          <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">
{`// Data Annotation
[Index(nameof(Name))]
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}

// Fluent API
modelBuilder.Entity<Customer>()
    .HasIndex(c => c.Name);

// Unique Index
modelBuilder.Entity<Customer>()
    .HasIndex(c => c.Email)
    .IsUnique();

// Composite Index
modelBuilder.Entity<Customer>()
    .HasIndex(c => new { c.LastName, c.FirstName });`}
          </pre>
        </div>
      </div>

      {/* Performance Info */}
      <div className="px-4 py-3 border-t border-border bg-secondary/20">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">With Index:</strong>
              <p className="text-muted-foreground">O(log n) - Direct lookup, very fast even with millions of rows</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Without Index:</strong>
              <p className="text-muted-foreground">O(n) - Full table scan, slow with large datasets</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default KeyIndexVisualizer;
