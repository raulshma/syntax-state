'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight, Plus, Check, Upload, Download, GitCommit, GitBranch, ArrowRight, AlertTriangle, FileText, Copy, Link2, Unlink2, Settings2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DemoType = 
  | 'ip-address-demo'
  | 'url-parser'
  | 'request-builder'
  | 'packet-simulator'
  | 'git-staging-demo'
  | 'git-remote-sync'
  | 'git-branching-sandbox'
  | 'git-conflict-resolver'
  | 'gitignore-builder'
  | 'git-commit-message-builder'
  | 'git-upstream-tracking'
  | 'git-pull-strategy'
  | 'git-fetch-prune'
  | 'git-force-with-lease';

interface InteractiveDemoProps {
  type: DemoType;
  title?: string;
}

export function InteractiveDemo({ type, title }: InteractiveDemoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
        <Play className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {title || getDemoTitle(type)}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">Interactive Demo</span>
      </div>
      <div className="p-6">
        {type === 'ip-address-demo' && <IPAddressDemo />}
        {type === 'url-parser' && <URLParserDemo />}
        {type === 'request-builder' && <RequestBuilderDemo />}
        {type === 'packet-simulator' && <PacketSimulatorDemo />}
        {type === 'git-staging-demo' && <GitStagingDemo />}
        {type === 'git-remote-sync' && <GitRemoteSyncDemo />}
        {type === 'git-branching-sandbox' && <GitBranchingSandboxDemo />}
        {type === 'git-conflict-resolver' && <GitConflictResolverDemo />}
        {type === 'gitignore-builder' && <GitIgnoreBuilderDemo />}
        {type === 'git-commit-message-builder' && <GitCommitMessageBuilderDemo />}
        {type === 'git-upstream-tracking' && <GitUpstreamTrackingDemo />}
        {type === 'git-pull-strategy' && <GitPullStrategyDemo />}
        {type === 'git-fetch-prune' && <GitFetchPruneDemo />}
        {type === 'git-force-with-lease' && <GitForceWithLeaseDemo />}
      </div>
    </motion.div>
  );
}

function getDemoTitle(type: DemoType): string {
  switch (type) {
    case 'ip-address-demo': return 'Your IP Address';
    case 'url-parser': return 'URL Structure';
    case 'request-builder': return 'HTTP Request Builder';
    case 'packet-simulator': return 'Packet Journey Simulator';
    case 'git-staging-demo': return 'Git Staging (git add / restore --staged)';
    case 'git-remote-sync': return 'Remote Sync (fetch / pull / push)';
    case 'git-branching-sandbox': return 'Branching Sandbox (switch / commit / merge)';
    case 'git-conflict-resolver': return 'Conflict Resolver (markers → resolved file)';
    case 'gitignore-builder': return '.gitignore Builder';
    case 'git-commit-message-builder': return 'Commit Message Builder (conventional style)';
    case 'git-upstream-tracking': return 'Upstream Tracking (push -u / pull defaults)';
    case 'git-pull-strategy': return 'Pull Strategy Simulator (merge vs rebase vs ff-only)';
    case 'git-fetch-prune': return 'Fetch + Prune (clean remote-tracking refs)';
    case 'git-force-with-lease': return 'Safe Force Push (force-with-lease)';
    default: return 'Interactive Demo';
  }
}

type GitFileState = 'modified' | 'untracked' | 'staged';
interface GitFile {
  name: string;
  state: GitFileState;
}

function GitStagingDemo() {
  const [files, setFiles] = useState<GitFile[]>([
    { name: 'src/app/page.tsx', state: 'modified' },
    { name: 'README.md', state: 'untracked' },
    { name: 'src/components/Button.tsx', state: 'modified' },
  ]);
  const [lastAction, setLastAction] = useState<string>('');

  const stageFile = (name: string) => {
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, state: 'staged' } : f)));
    setLastAction(`git add ${name}`);
  };

  const unstageFile = (name: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.name === name ? { ...f, state: f.state === 'staged' ? 'modified' : f.state } : f))
    );
    setLastAction(`git restore --staged ${name}`);
  };

  const commit = () => {
    const hasStaged = files.some((f) => f.state === 'staged');
    if (!hasStaged) return;
    setFiles((prev) => prev.filter((f) => f.state !== 'staged'));
    setLastAction('git commit -m "..."');
  };

  const reset = () => {
    setFiles([
      { name: 'src/app/page.tsx', state: 'modified' },
      { name: 'README.md', state: 'untracked' },
      { name: 'src/components/Button.tsx', state: 'modified' },
    ]);
    setLastAction('');
  };

  const statusText = useMemo(() => {
    const staged = files.filter((f) => f.state === 'staged');
    const modified = files.filter((f) => f.state === 'modified');
    const untracked = files.filter((f) => f.state === 'untracked');

    const lines: string[] = [];
    lines.push('On branch main');
    lines.push('');

    if (staged.length) {
      lines.push('Changes to be committed:');
      for (const f of staged) lines.push(`  modified:   ${f.name}`);
      lines.push('');
    }

    if (modified.length) {
      lines.push('Changes not staged for commit:');
      lines.push('  (use "git add <file>..." to update what will be committed)');
      for (const f of modified) lines.push(`  modified:   ${f.name}`);
      lines.push('');
    }

    if (untracked.length) {
      lines.push('Untracked files:');
      lines.push('  (use "git add <file>..." to include in what will be committed)');
      for (const f of untracked) lines.push(`  ${f.name}`);
      lines.push('');
    }

    if (!staged.length && !modified.length && !untracked.length) {
      lines.push('nothing to commit, working tree clean');
    }

    return lines.join('\n');
  }, [files]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Practice the &quot;three places&quot; model: working tree → staging area → commit.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <GitBranch className="w-4 h-4" />
            <span>Files</span>
          </div>

          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f.name}
                className={cn(
                  'p-3 rounded-lg border flex items-center justify-between gap-3',
                  f.state === 'staged'
                    ? 'bg-green-500/10 border-green-500/30'
                    : f.state === 'untracked'
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-secondary/30 border-border'
                )}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.state === 'staged' ? 'staged' : f.state === 'untracked' ? 'untracked' : 'modified'}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {f.state !== 'staged' ? (
                    <Button size="sm" variant="outline" onClick={() => stageFile(f.name)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Stage
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => unstageFile(f.name)}>
                      Undo stage
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={commit} disabled={!files.some((f) => f.state === 'staged')}>
              <GitCommit className="w-4 h-4 mr-2" />
              Commit staged
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="w-4 h-4" />
              <span>Simulated <span className="font-mono">git status</span></span>
            </div>
            {lastAction && (
              <span className="text-xs text-muted-foreground">
                Last: <span className="font-mono text-foreground">{lastAction}</span>
              </span>
            )}
          </div>
          <pre className="bg-zinc-900 border border-border rounded-xl p-4 overflow-x-auto text-xs text-green-400 whitespace-pre">
{statusText}
          </pre>
        </div>
      </div>
    </div>
  );
}

function GitRemoteSyncDemo() {
  const [localAhead, setLocalAhead] = useState(0);
  const [localBehind, setLocalBehind] = useState(0);
  const [remoteAhead, setRemoteAhead] = useState(0);
  const [message, setMessage] = useState<string>('Start by making a local commit or simulating a teammate push.');

  const makeLocalCommit = () => {
    setLocalAhead((n) => n + 1);
    setMessage('You made a local commit. You are now "ahead" of origin/main.');
  };

  const teammatePushes = () => {
    setRemoteAhead((n) => n + 1);
    setLocalBehind((n) => n + 1);
    setMessage('A teammate pushed to origin. Your local branch is now "behind".');
  };

  const fetch = () => {
    if (remoteAhead === 0) {
      setMessage('Fetch pulled no new remote commits.');
      return;
    }
    setMessage('Fetched: updated remote-tracking branch origin/main (no merge into your branch yet).');
  };

  const pull = () => {
    if (localBehind === 0) {
      setMessage('Pull: already up to date.');
      return;
    }
    setLocalBehind(0);
    setRemoteAhead(0);
    setMessage('Pulled: your local branch now includes the remote commits.');
  };

  const push = () => {
    if (localAhead === 0) {
      setMessage('Push: nothing to push.');
      return;
    }
    setLocalAhead(0);
    setMessage('Pushed: origin now has your commits.');
  };

  const reset = () => {
    setLocalAhead(0);
    setLocalBehind(0);
    setRemoteAhead(0);
    setMessage('Reset the simulation.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This models the difference between <span className="font-mono">fetch</span> (download history) and <span className="font-mono">pull</span> (fetch + integrate).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Your local branch</h4>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>ahead of origin/main: <span className="font-mono text-foreground">{localAhead}</span></div>
            <div>behind origin/main: <span className="font-mono text-foreground">{localBehind}</span></div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-foreground">Remote (origin)</h4>
          </div>
          <div className="text-xs text-muted-foreground">
            new commits on origin/main: <span className="font-mono text-foreground">{remoteAhead}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={makeLocalCommit}>
          <Plus className="w-4 h-4 mr-2" />
          Local commit
        </Button>
        <Button size="sm" variant="outline" onClick={teammatePushes}>
          <ArrowRight className="w-4 h-4 mr-2" />
          Teammate pushes
        </Button>
        <Button size="sm" variant="outline" onClick={fetch}>
          <Download className="w-4 h-4 mr-2" />
          Fetch
        </Button>
        <Button size="sm" onClick={pull} disabled={localBehind === 0}>
          <Download className="w-4 h-4 mr-2" />
          Pull
        </Button>
        <Button size="sm" onClick={push} disabled={localAhead === 0}>
          <Upload className="w-4 h-4 mr-2" />
          Push
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-3 rounded-lg border border-border bg-secondary/30 text-sm text-muted-foreground">
        {message}
      </div>
    </div>
  );
}

type BranchName = 'main' | 'feature/search' | 'feature/login';
interface BranchState {
  name: BranchName;
  base: number; // commit number where branch diverged
  head: number; // current head commit number
  mergedIntoMain?: boolean;
}

function GitBranchingSandboxDemo() {
  const [mainHead, setMainHead] = useState(3);
  const [current, setCurrent] = useState<BranchName>('main');
  const [branches, setBranches] = useState<Record<Exclude<BranchName, 'main'>, BranchState>>({
    'feature/search': { name: 'feature/search', base: 3, head: 3 },
    'feature/login': { name: 'feature/login', base: 3, head: 3 },
  });
  const [lastCommand, setLastCommand] = useState<string>('');

  const reset = () => {
    setMainHead(3);
    setCurrent('main');
    setBranches({
      'feature/search': { name: 'feature/search', base: 3, head: 3 },
      'feature/login': { name: 'feature/login', base: 3, head: 3 },
    });
    setLastCommand('');
  };

  const switchBranch = (name: BranchName) => {
    setCurrent(name);
    setLastCommand(name === 'main' ? 'git switch main' : `git switch ${name}`);
  };

  const createBranchFromMain = (name: Exclude<BranchName, 'main'>) => {
    setBranches((prev) => ({
      ...prev,
      [name]: { name, base: mainHead, head: mainHead },
    }));
    setCurrent(name);
    setLastCommand(`git switch -c ${name}`);
  };

  const commit = () => {
    if (current === 'main') {
      const next = mainHead + 1;
      setMainHead(next);
      setLastCommand('git commit -m "..."');
      return;
    }

    setBranches((prev) => {
      const branch = prev[current];
      const next = branch.head + 1;
      return {
        ...prev,
        [current]: { ...branch, head: next },
      };
    });
    setLastCommand('git commit -m "..."');
  };

  const mergeIntoMain = (name: Exclude<BranchName, 'main'>) => {
    const branch = branches[name];
    if (!branch) return;
    const needsMerge = branch.head > mainHead;
    if (!needsMerge) {
      setLastCommand(`git merge ${name}  # already up to date`);
      return;
    }

    setMainHead(branch.head);
    setBranches((prev) => ({
      ...prev,
      [name]: { ...prev[name], mergedIntoMain: true },
    }));
    setLastCommand(`git merge ${name}`);
  };

  const currentHead = current === 'main' ? mainHead : branches[current].head;
  const currentBase = current === 'main' ? 0 : branches[current].base;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Use this sandbox to build the mental model: branches are pointers, commits move the pointer.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">State</h4>
            </div>
            <span className="text-xs text-muted-foreground">
              HEAD: <span className="font-mono text-foreground">{current}</span>
            </span>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="font-mono">main</span>
              <span>
                head <span className="font-mono text-foreground">C{mainHead}</span>
              </span>
            </div>
            {(['feature/search', 'feature/login'] as const).map((b) => (
              <div key={b} className="flex items-center justify-between">
                <span className="font-mono">{b}</span>
                <span>
                  base <span className="font-mono text-foreground">C{branches[b].base}</span> → head{' '}
                  <span className="font-mono text-foreground">C{branches[b].head}</span>
                  {branches[b].mergedIntoMain ? <span className="ml-2 text-green-500">(merged)</span> : null}
                </span>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Current branch head: <span className="font-mono text-foreground">C{currentHead}</span>
            {current !== 'main' && (
              <span>
                {' '}• diverged at <span className="font-mono text-foreground">C{currentBase}</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <h4 className="font-semibold text-foreground">Actions</h4>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={current === 'main' ? 'default' : 'outline'} onClick={() => switchBranch('main')}>
              Switch main
            </Button>
            <Button size="sm" variant={current === 'feature/search' ? 'default' : 'outline'} onClick={() => switchBranch('feature/search')}>
              Switch feature/search
            </Button>
            <Button size="sm" variant={current === 'feature/login' ? 'default' : 'outline'} onClick={() => switchBranch('feature/login')}>
              Switch feature/login
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={commit}>
              <GitCommit className="w-4 h-4 mr-2" />
              Commit
            </Button>
            <Button size="sm" variant="outline" onClick={() => createBranchFromMain('feature/search')}>
              <Plus className="w-4 h-4 mr-2" />
              New feature/search
            </Button>
            <Button size="sm" variant="outline" onClick={() => createBranchFromMain('feature/login')}>
              <Plus className="w-4 h-4 mr-2" />
              New feature/login
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => mergeIntoMain('feature/search')}>
              Merge feature/search → main
            </Button>
            <Button size="sm" onClick={() => mergeIntoMain('feature/login')}>
              Merge feature/login → main
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {lastCommand && (
            <div className="text-xs text-muted-foreground">
              Command: <span className="font-mono text-foreground">{lastCommand}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground">
        Tip: In real Git, the “commit number” is a SHA like <span className="font-mono text-foreground">a1b2c3d</span>.
      </div>
    </div>
  );
}

type ConflictResolutionMode = 'ours' | 'theirs' | 'both' | 'manual';

const CONFLICT_OURS = `function title() {
  return "Hello";
}`;

const CONFLICT_THEIRS = `function title() {
  return "Hello, world!";
}`;

function GitConflictResolverDemo() {
  const [mode, setMode] = useState<ConflictResolutionMode>('ours');
  const [manual, setManual] = useState<string>(CONFLICT_OURS);

  const conflictText = `<<<<<<< HEAD
${CONFLICT_OURS}
=======
${CONFLICT_THEIRS}
>>>>>>> feature-branch`;

  const resolved = useMemo(() => {
    if (mode === 'ours') return CONFLICT_OURS;
    if (mode === 'theirs') return CONFLICT_THEIRS;
    if (mode === 'both') return `${CONFLICT_OURS}

${CONFLICT_THEIRS}`;
    return manual;
  }, [mode, manual]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Practice reading conflict markers and producing a clean resolved file.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span>Conflicted file</span>
          </div>
          <pre className="bg-zinc-900 border border-border rounded-xl p-4 overflow-x-auto text-xs text-yellow-300 whitespace-pre">
{conflictText}
          </pre>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Choose a resolution</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={mode === 'ours' ? 'default' : 'outline'} onClick={() => setMode('ours')}>
              Keep ours
            </Button>
            <Button size="sm" variant={mode === 'theirs' ? 'default' : 'outline'} onClick={() => setMode('theirs')}>
              Keep theirs
            </Button>
            <Button size="sm" variant={mode === 'both' ? 'default' : 'outline'} onClick={() => setMode('both')}>
              Keep both
            </Button>
            <Button size="sm" variant={mode === 'manual' ? 'default' : 'outline'} onClick={() => setMode('manual')}>
              Manual
            </Button>
          </div>

          {mode === 'manual' && (
            <textarea
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono text-xs"
            />
          )}

          <div className="text-xs text-muted-foreground">Resolved output:</div>
          <pre className="bg-zinc-900 border border-border rounded-xl p-4 overflow-x-auto text-xs text-green-400 whitespace-pre">
{resolved}
          </pre>

          <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground">
            Next steps: <span className="font-mono text-foreground">git add file</span> then <span className="font-mono text-foreground">git commit</span> (or finish the merge).
          </div>
        </div>
      </div>
    </div>
  );
}

type IgnorePresetKey = 'node' | 'next' | 'dist' | 'env' | 'coverage' | 'logs';
const ignorePresets: Array<{ key: IgnorePresetKey; label: string; lines: string[] }> = [
  { key: 'node', label: 'Node dependencies', lines: ['node_modules/'] },
  { key: 'next', label: 'Next.js build output', lines: ['.next/', 'out/'] },
  { key: 'dist', label: 'Bundler output', lines: ['dist/', 'build/'] },
  { key: 'env', label: 'Environment secrets', lines: ['.env', '.env.*', '!.env.example'] },
  { key: 'coverage', label: 'Test coverage', lines: ['coverage/'] },
  { key: 'logs', label: 'Logs', lines: ['*.log', 'npm-debug.log*', 'pnpm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*'] },
];

function GitIgnoreBuilderDemo() {
  const [selected, setSelected] = useState<Record<IgnorePresetKey, boolean>>({
    node: true,
    next: true,
    dist: true,
    env: true,
    coverage: false,
    logs: true,
  });
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    const lines: string[] = [];
    lines.push('# Generated by .gitignore Builder');
    lines.push('');
    for (const preset of ignorePresets) {
      if (!selected[preset.key]) continue;
      lines.push(`# ${preset.label}`);
      lines.push(...preset.lines);
      lines.push('');
    }
    return lines.join('\n').trimEnd() + '\n';
  }, [selected]);

  const toggle = (key: IgnorePresetKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pick common patterns and generate a starter <span className="font-mono">.gitignore</span>.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <h4 className="font-semibold text-foreground">Presets</h4>
          <div className="space-y-2">
            {ignorePresets.map((p) => (
              <button
                key={p.key}
                onClick={() => toggle(p.key)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors',
                  selected[p.key] ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:border-muted-foreground/50'
                )}
              >
                <span className="text-sm text-foreground">{p.label}</span>
                <span className={cn('text-xs font-mono', selected[p.key] ? 'text-primary' : 'text-muted-foreground')}>
                  {selected[p.key] ? 'ON' : 'OFF'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Generated <span className="font-mono">.gitignore</span>
            </div>
            <Button size="sm" variant="outline" onClick={copy}>
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <pre className="bg-zinc-900 border border-border rounded-xl p-4 overflow-x-auto text-xs text-green-400 whitespace-pre">
{content}
          </pre>
        </div>
      </div>
    </div>
  );
}

type CommitType = 'feat' | 'fix' | 'docs' | 'refactor' | 'test' | 'chore' | 'perf';

function GitCommitMessageBuilderDemo() {
  const [type, setType] = useState<CommitType>('feat');
  const [scope, setScope] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => {
    const trimmedScope = scope.trim();
    const scopePart = trimmedScope ? `(${trimmedScope})` : '';
    const desc = description.trim();
    return `${type}${scopePart}: ${desc || '...'}`;
  }, [type, scope, description]);

  const issues = useMemo(() => {
    const problems: string[] = [];
    if (!description.trim()) problems.push('Add a short description (what changed?).');
    if (description.trim().length > 72) problems.push('Keep the description under ~72 characters (easy to scan in logs).');
    if (description.trim() && /^[A-Z]/.test(description.trim())) problems.push('Prefer starting with a lowercase verb (“add”, “fix”, “refactor”…).');
    if (scope.includes(' ')) problems.push('Scope usually has no spaces (e.g., “auth”, “ui”, “api”).');
    return problems;
  }, [description, scope]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Build a clean commit message. Think: <span className="font-mono">type(scope): description</span>.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CommitType)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
              >
                {(['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'perf'] as CommitType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground block mb-2">Scope (optional)</label>
              <input
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-mono"
                placeholder="auth / ui / api / roadmap"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-2">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
              placeholder="add branch switching lesson content"
            />
          </div>

          {issues.length > 0 && (
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions</div>
              <ul className="space-y-1">
                {issues.map((p) => (
                  <li key={p} className="text-xs text-muted-foreground">- {p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Preview</div>
            <Button size="sm" variant="outline" onClick={copy}>
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <pre className="bg-zinc-900 border border-border rounded-xl p-4 overflow-x-auto text-xs text-green-400 whitespace-pre">
{message}
          </pre>
          <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground">
            Use it with: <span className="font-mono text-foreground">git commit -m &quot;{message}&quot;</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GitUpstreamTrackingDemo() {
  const [hasUpstream, setHasUpstream] = useState(false);
  const [branch, setBranch] = useState('feature/login');
  const [remote, setRemote] = useState('origin');

  const pushCmd = hasUpstream
    ? 'git push'
    : `git push -u ${remote} ${branch}`;
  const pullCmd = hasUpstream
    ? 'git pull'
    : `git pull ${remote} ${branch}`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upstream tracking is why <span className="font-mono">git push</span> and <span className="font-mono">git pull</span> can work without extra args.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Scenario</span>
            <span className={cn(
              'ml-auto text-xs font-mono px-2 py-1 rounded border',
              hasUpstream ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-secondary border-border text-muted-foreground'
            )}>
              {hasUpstream ? 'upstream set' : 'no upstream'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Branch</label>
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Remote</label>
              <input
                value={remote}
                onChange={(e) => setRemote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setHasUpstream(true)}>
              <Link2 className="w-4 h-4 mr-2" />
              Set upstream
            </Button>
            <Button size="sm" variant="outline" onClick={() => setHasUpstream(false)}>
              <Unlink2 className="w-4 h-4 mr-2" />
              Unset
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Commands you’d typically run</div>
          <pre className="bg-zinc-900 border border-border rounded-xl p-4 overflow-x-auto text-xs text-green-400 whitespace-pre">
{pushCmd}
{pullCmd}
          </pre>
          <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground">
            Tip: <span className="font-mono text-foreground">git push -u</span> sets upstream while pushing.
          </div>
        </div>
      </div>
    </div>
  );
}

type PullMode = 'merge' | 'rebase' | 'ff-only';

function GitPullStrategyDemo() {
  const [pullMode, setPullMode] = useState<PullMode>('merge');
  const [localAhead, setLocalAhead] = useState(0);
  const [localBehind, setLocalBehind] = useState(0);
  const [message, setMessage] = useState('Simulate divergence, then try pull strategies.');

  const localCommit = () => {
    setLocalAhead((n) => n + 1);
    setMessage('Local commit added (you are ahead).');
  };

  const teammateCommit = () => {
    setLocalBehind((n) => n + 1);
    setMessage('Remote moved forward (you are behind).');
  };

  const pull = () => {
    if (localBehind === 0) {
      setMessage('Pull: already up to date (nothing to integrate).');
      return;
    }

    const diverged = localAhead > 0 && localBehind > 0;
    if (pullMode === 'ff-only') {
      if (diverged) {
        setMessage('Pull (ff-only) refused: your branch diverged. You must merge or rebase.');
        return;
      }
      setLocalBehind(0);
      setMessage('Pull (ff-only): fast-forwarded your branch.');
      return;
    }

    if (pullMode === 'merge') {
      setLocalBehind(0);
      setMessage(diverged
        ? 'Pull (merge): would create a merge commit to combine histories.'
        : 'Pull (merge): integrated remote changes.'
      );
      return;
    }

    // rebase
    setLocalBehind(0);
    setMessage(diverged
      ? 'Pull (rebase): would replay your local commits on top of the updated remote.'
      : 'Pull (rebase): integrated remote changes (no merge commit).'
    );
  };

  const reset = () => {
    setPullMode('merge');
    setLocalAhead(0);
    setLocalBehind(0);
    setMessage('Reset the simulation.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose what <span className="font-mono">git pull</span> should do when histories diverge.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">Pull mode</div>
            <span className="text-xs text-muted-foreground">
              ahead <span className="font-mono text-foreground">{localAhead}</span> • behind{' '}
              <span className="font-mono text-foreground">{localBehind}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={pullMode === 'merge' ? 'default' : 'outline'} onClick={() => setPullMode('merge')}>merge</Button>
            <Button size="sm" variant={pullMode === 'rebase' ? 'default' : 'outline'} onClick={() => setPullMode('rebase')}>rebase</Button>
            <Button size="sm" variant={pullMode === 'ff-only' ? 'default' : 'outline'} onClick={() => setPullMode('ff-only')}>ff-only</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={localCommit}>
              <Plus className="w-4 h-4 mr-2" />
              Local commit
            </Button>
            <Button size="sm" variant="outline" onClick={teammateCommit}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Teammate pushes
            </Button>
            <Button size="sm" onClick={pull} disabled={localBehind === 0}>
              <Download className="w-4 h-4 mr-2" />
              Pull
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">What happens?</div>
          <div className="p-4 rounded-xl border border-border bg-secondary/30 text-sm text-muted-foreground">
            {message}
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-xs text-muted-foreground">
            Config hints:
            {' '}
            <span className="font-mono text-foreground">pull.rebase</span> controls rebase vs merge,
            {' '}
            <span className="font-mono text-foreground">pull.ff</span> can enforce fast-forward.
          </div>
        </div>
      </div>
    </div>
  );
}

function GitFetchPruneDemo() {
  const [remoteBranches, setRemoteBranches] = useState<string[]>(['main', 'feature/a', 'feature/b']);
  const [trackingBranches, setTrackingBranches] = useState<string[]>(['origin/main', 'origin/feature/a', 'origin/feature/b']);
  const [message, setMessage] = useState('Simulate a remote branch deletion, then fetch with or without prune.');

  const deleteRemoteBranch = (name: string) => {
    setRemoteBranches((prev) => prev.filter((b) => b !== name));
    setMessage(`Remote deleted ${name}. Your local origin/${name} may still exist until pruned.`);
  };

  const fetch = () => {
    setMessage('Fetched updates. Remote-tracking refs updated, but deleted branches may remain locally.');
  };

  const fetchPrune = () => {
    const next = trackingBranches.filter((t) => {
      const short = t.replace('origin/', '');
      return remoteBranches.includes(short);
    });
    setTrackingBranches(next);
    setMessage('Fetched with prune: removed origin/* refs that no longer exist on the remote.');
  };

  const reset = () => {
    setRemoteBranches(['main', 'feature/a', 'feature/b']);
    setTrackingBranches(['origin/main', 'origin/feature/a', 'origin/feature/b']);
    setMessage('Reset the simulation.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Remote-tracking branches are cached state. Pruning keeps them tidy.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="text-sm font-semibold text-foreground">Remote branches</div>
          <div className="flex flex-wrap gap-2">
            {remoteBranches.map((b) => (
              <span key={b} className="text-xs font-mono px-2 py-1 rounded border border-border bg-card">
                {b}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => deleteRemoteBranch('feature/a')} disabled={!remoteBranches.includes('feature/a')}>
              Delete feature/a on remote
            </Button>
            <Button size="sm" variant="outline" onClick={() => deleteRemoteBranch('feature/b')} disabled={!remoteBranches.includes('feature/b')}>
              Delete feature/b on remote
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="text-sm font-semibold text-foreground">Local remote-tracking refs</div>
          <div className="flex flex-wrap gap-2">
            {trackingBranches.map((t) => (
              <span key={t} className="text-xs font-mono px-2 py-1 rounded border border-border bg-card">
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={fetch}>
              <Download className="w-4 h-4 mr-2" />
              Fetch
            </Button>
            <Button size="sm" onClick={fetchPrune}>
              <Download className="w-4 h-4 mr-2" />
              Fetch --prune
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border bg-secondary/30 text-sm text-muted-foreground">
        {message}
      </div>
    </div>
  );
}

function GitForceWithLeaseDemo() {
  const [teammatePushed, setTeammatePushed] = useState(false);
  const [message, setMessage] = useState('Simulate a teammate push, then compare --force vs --force-with-lease.');

  const simulateTeammatePush = () => {
    setTeammatePushed(true);
    setMessage('Teammate pushed new commits to the remote branch.');
  };

  const force = () => {
    setMessage('git push --force: overwrote the remote branch (can destroy teammate commits).');
    setTeammatePushed(false);
  };

  const forceWithLease = () => {
    if (teammatePushed) {
      setMessage('git push --force-with-lease: refused (remote changed since you last fetched).');
      return;
    }
    setMessage('git push --force-with-lease: force-pushed safely (remote matched what you expected).');
  };

  const reset = () => {
    setTeammatePushed(false);
    setMessage('Reset the simulation.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        If you must force-push (usually after rebasing your own branch), prefer <span className="font-mono">--force-with-lease</span>.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Remote status</span>
            <span className={cn(
              'ml-auto text-xs font-mono px-2 py-1 rounded border',
              teammatePushed ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-green-500/10 border-green-500/30 text-green-500'
            )}>
              {teammatePushed ? 'remote changed' : 'remote matches'}
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={simulateTeammatePush} disabled={teammatePushed}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Teammate pushes
          </Button>
        </div>

        <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <div className="text-sm font-semibold text-foreground">Push options</div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={force}>
              git push --force
            </Button>
            <Button size="sm" onClick={forceWithLease}>
              git push --force-with-lease
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border bg-secondary/30 text-sm text-muted-foreground">
        {message}
      </div>

      <div className="p-3 rounded-lg border border-border bg-card text-xs text-muted-foreground">
        Why it matters: <span className="font-mono text-foreground">--force-with-lease</span> is a safety check that helps prevent overwriting commits you didn’t know about.
      </div>
    </div>
  );
}

// IP Address Demo
function IPAddressDemo() {
  const [revealed, setRevealed] = useState(false);
  // Simulated IP - in real implementation, fetch from API
  const mockIP = '192.168.1.42';
  const mockPublicIP = '203.0.113.195';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Every device on the Internet has a unique address. Click below to see examples:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <span className="text-xs text-muted-foreground block mb-1">Local IP (Your Network)</span>
          <motion.div
            className="font-mono text-lg text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
          >
            {revealed ? mockIP : '•••.•••.•.••'}
          </motion.div>
        </div>

        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <span className="text-xs text-muted-foreground block mb-1">Public IP (Internet)</span>
          <motion.div
            className="font-mono text-lg text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
          >
            {revealed ? mockPublicIP : '•••.•.•••.•••'}
          </motion.div>
        </div>
      </div>

      <Button 
        onClick={() => setRevealed(!revealed)} 
        variant="outline" 
        size="sm"
      >
        {revealed ? 'Hide' : 'Reveal'} IP Addresses
      </Button>

      {revealed && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground"
        >
          💡 Your local IP is used within your home network. Your public IP is how websites see you!
        </motion.p>
      )}
    </div>
  );
}

// URL Parser Demo
function URLParserDemo() {
  const [url, setUrl] = useState('https://www.example.com:443/path/page?query=value#section');
  
  const parts = parseURL(url);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground block mb-2">
          Enter a URL to parse:
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm"
          placeholder="https://example.com/page"
        />
      </div>

      <div className="space-y-2">
        {Object.entries(parts).map(([key, value]) => (
          <motion.div
            key={key}
            className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-xs font-medium text-muted-foreground w-20">{key}</span>
            <code className={cn(
              'text-sm font-mono flex-1',
              value ? 'text-primary' : 'text-muted-foreground/50'
            )}>
              {value || '(none)'}
            </code>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function parseURL(urlString: string): Record<string, string> {
  try {
    const url = new URL(urlString);
    return {
      Protocol: url.protocol.replace(':', ''),
      Host: url.hostname,
      Port: url.port || '(default)',
      Path: url.pathname,
      Query: url.search.replace('?', ''),
      Hash: url.hash.replace('#', ''),
    };
  } catch {
    return {
      Protocol: '',
      Host: '',
      Port: '',
      Path: '',
      Query: '',
      Hash: '',
    };
  }
}

// Request Builder Demo
function RequestBuilderDemo() {
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [path, setPath] = useState('/api/users');

  const request = `${method} ${path} HTTP/1.1
Host: example.com
User-Agent: MyBrowser/1.0
Accept: application/json${method === 'POST' ? '\nContent-Type: application/json\n\n{"name": "John"}' : ''}`;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-2">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}
            className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground block mb-2">Path</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
          />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-zinc-900 border border-border font-mono text-xs text-green-400 whitespace-pre overflow-x-auto">
        {request}
      </div>
    </div>
  );
}

// Packet Simulator Demo
function PacketSimulatorDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentHop, setCurrentHop] = useState(-1);

  const hops = [
    { name: 'Your Router', ip: '192.168.1.1', time: '1ms' },
    { name: 'ISP Gateway', ip: '10.0.0.1', time: '5ms' },
    { name: 'Regional Hub', ip: '172.16.0.1', time: '15ms' },
    { name: 'Internet Exchange', ip: '203.0.113.1', time: '25ms' },
    { name: 'Destination Server', ip: '93.184.216.34', time: '35ms' },
  ];

  const runSimulation = () => {
    setIsRunning(true);
    setCurrentHop(-1);

    hops.forEach((_, i) => {
      setTimeout(() => {
        setCurrentHop(i);
        if (i === hops.length - 1) {
          setTimeout(() => setIsRunning(false), 500);
        }
      }, (i + 1) * 800);
    });
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentHop(-1);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Watch your data packet travel through the Internet:
      </p>

      <div className="space-y-2">
        {hops.map((hop, i) => (
          <motion.div
            key={i}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-colors',
              currentHop === i 
                ? 'bg-primary/10 border-primary' 
                : currentHop > i 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-secondary/30 border-border'
            )}
            animate={currentHop === i ? { scale: [1, 1.02, 1] } : {}}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
              currentHop >= i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            )}>
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{hop.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{hop.ip}</div>
            </div>
            {currentHop >= i && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-green-500 font-medium"
              >
                {hop.time}
              </motion.div>
            )}
            <ChevronRight className={cn(
              'w-4 h-4',
              currentHop >= i ? 'text-primary' : 'text-muted-foreground/30'
            )} />
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={runSimulation} 
          disabled={isRunning}
          size="sm"
        >
          {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isRunning ? 'Running...' : 'Start Trace'}
        </Button>
        <Button onClick={reset} variant="outline" size="sm" disabled={currentHop === -1}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
