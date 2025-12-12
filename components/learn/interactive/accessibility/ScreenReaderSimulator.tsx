'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Code2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ScreenReaderOutput {
  element: string;
  announcement: string;
  role: string;
  properties: string[];
}

export interface ScreenReaderExample {
  id: string;
  name: string;
  description: string;
  html: string;
  outputs: ScreenReaderOutput[];
}

export const screenReaderExamples: ScreenReaderExample[] = [
  {
    id: 'semantic-page',
    name: 'Semantic Page',
    description: 'A well-structured page with landmarks',
    html: `<header>
  <h1>My Website</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
<main>
  <h2>Welcome</h2>
  <p>Hello, world!</p>
</main>
<footer>
  <p>© 2024</p>
</footer>`,
    outputs: [
      {
        element: '<header>',
        announcement: 'Banner landmark',
        role: 'banner',
        properties: ['landmark'],
      },
      {
        element: '<h1>My Website</h1>',
        announcement: 'Heading level 1, My Website',
        role: 'heading',
        properties: ['level: 1'],
      },
      {
        element: '<nav>',
        announcement: 'Navigation landmark',
        role: 'navigation',
        properties: ['landmark'],
      },
      {
        element: '<a href="/">Home</a>',
        announcement: 'Link, Home',
        role: 'link',
        properties: ['focusable'],
      },
      {
        element: '<a href="/about">About</a>',
        announcement: 'Link, About',
        role: 'link',
        properties: ['focusable'],
      },
      {
        element: '</nav>',
        announcement: 'End of navigation',
        role: 'navigation',
        properties: ['end'],
      },
      {
        element: '</header>',
        announcement: 'End of banner',
        role: 'banner',
        properties: ['end'],
      },
      {
        element: '<main>',
        announcement: 'Main landmark',
        role: 'main',
        properties: ['landmark'],
      },
      {
        element: '<h2>Welcome</h2>',
        announcement: 'Heading level 2, Welcome',
        role: 'heading',
        properties: ['level: 2'],
      },
      {
        element: '<p>Hello, world!</p>',
        announcement: 'Hello, world!',
        role: 'paragraph',
        properties: [],
      },
      {
        element: '</main>',
        announcement: 'End of main',
        role: 'main',
        properties: ['end'],
      },
      {
        element: '<footer>',
        announcement: 'Content info landmark',
        role: 'contentinfo',
        properties: ['landmark'],
      },
      {
        element: '<p>© 2024</p>',
        announcement: '© 2024',
        role: 'paragraph',
        properties: [],
      },
      {
        element: '</footer>',
        announcement: 'End of content info',
        role: 'contentinfo',
        properties: ['end'],
      },
    ],
  },
  {
    id: 'form-example',
    name: 'Accessible Form',
    description: 'Form with proper labels and ARIA',
    html: `<form aria-label="Contact form">
  <label for="name">Name:</label>
  <input type="text" id="name" required>
  
  <label for="email">Email:</label>
  <input type="email" id="email" 
         aria-describedby="email-hint">
  <span id="email-hint">
    We'll never share your email
  </span>
  
  <button type="submit">Send</button>
</form>`,
    outputs: [
      {
        element: '<form aria-label="Contact form">',
        announcement: 'Form, Contact form',
        role: 'form',
        properties: ['accessible name: Contact form'],
      },
      {
        element: '<label for="name">Name:</label>',
        announcement: 'Name:',
        role: 'label',
        properties: ['for: name'],
      },
      {
        element: '<input type="text" id="name" required>',
        announcement: 'Name, edit text, required',
        role: 'textbox',
        properties: ['required', 'focusable', 'editable'],
      },
      {
        element: '<label for="email">Email:</label>',
        announcement: 'Email:',
        role: 'label',
        properties: ['for: email'],
      },
      {
        element: '<input type="email" id="email">',
        announcement: "Email, edit text, We'll never share your email",
        role: 'textbox',
        properties: ['focusable', 'editable', 'described by: email-hint'],
      },
      {
        element: '<span id="email-hint">',
        announcement: "We'll never share your email",
        role: 'generic',
        properties: ['referenced by: email input'],
      },
      {
        element: '<button type="submit">Send</button>',
        announcement: 'Send, button',
        role: 'button',
        properties: ['focusable', 'type: submit'],
      },
      {
        element: '</form>',
        announcement: 'End of form',
        role: 'form',
        properties: ['end'],
      },
    ],
  },
  {
    id: 'list-example',
    name: 'Lists & Navigation',
    description: 'Navigation with list structure',
    html: `<nav aria-label="Main menu">
  <ul>
    <li><a href="/">Home</a></li>
    <li>
      <a href="/products" 
         aria-current="page">Products</a>
    </li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>`,
    outputs: [
      {
        element: '<nav aria-label="Main menu">',
        announcement: 'Navigation, Main menu',
        role: 'navigation',
        properties: ['landmark', 'accessible name: Main menu'],
      },
      {
        element: '<ul>',
        announcement: 'List, 3 items',
        role: 'list',
        properties: ['3 items'],
      },
      {
        element: '<li>',
        announcement: '1 of 3',
        role: 'listitem',
        properties: ['position: 1 of 3'],
      },
      {
        element: '<a href="/">Home</a>',
        announcement: 'Link, Home',
        role: 'link',
        properties: ['focusable'],
      },
      {
        element: '<li>',
        announcement: '2 of 3',
        role: 'listitem',
        properties: ['position: 2 of 3'],
      },
      {
        element: '<a aria-current="page">Products</a>',
        announcement: 'Link, Products, current page',
        role: 'link',
        properties: ['focusable', 'current: page'],
      },
      {
        element: '<li>',
        announcement: '3 of 3',
        role: 'listitem',
        properties: ['position: 3 of 3'],
      },
      {
        element: '<a href="/contact">Contact</a>',
        announcement: 'Link, Contact',
        role: 'link',
        properties: ['focusable'],
      },
      {
        element: '</ul>',
        announcement: 'End of list',
        role: 'list',
        properties: ['end'],
      },
      {
        element: '</nav>',
        announcement: 'End of navigation',
        role: 'navigation',
        properties: ['end'],
      },
    ],
  },
  {
    id: 'image-example',
    name: 'Images & Figures',
    description: 'Images with alt text and figures',
    html: `<figure>
  <img src="chart.png" 
       alt="Sales increased 50% in Q4">
  <figcaption>
    Quarterly sales report
  </figcaption>
</figure>

<img src="decorative.png" 
     alt="" role="presentation">

<img src="logo.png" 
     alt="Company Logo">`,
    outputs: [
      {
        element: '<figure>',
        announcement: 'Figure',
        role: 'figure',
        properties: ['group'],
      },
      {
        element: '<img alt="Sales increased 50% in Q4">',
        announcement: 'Image, Sales increased 50% in Q4',
        role: 'img',
        properties: ['accessible name from alt'],
      },
      {
        element: '<figcaption>',
        announcement: 'Caption, Quarterly sales report',
        role: 'caption',
        properties: ['describes figure'],
      },
      {
        element: '</figure>',
        announcement: 'End of figure',
        role: 'figure',
        properties: ['end'],
      },
      {
        element: '<img alt="" role="presentation">',
        announcement: '(skipped - decorative)',
        role: 'presentation',
        properties: ['hidden from accessibility tree'],
      },
      {
        element: '<img alt="Company Logo">',
        announcement: 'Image, Company Logo',
        role: 'img',
        properties: ['accessible name from alt'],
      },
    ],
  },
  {
    id: 'aria-live',
    name: 'Live Regions',
    description: 'Dynamic content announcements',
    html: `<div role="alert">
  Error: Please fill in all fields
</div>

<div aria-live="polite" 
     aria-atomic="true">
  3 items in cart
</div>

<div role="status">
  Loading complete
</div>`,
    outputs: [
      {
        element: '<div role="alert">',
        announcement: 'Alert: Error: Please fill in all fields',
        role: 'alert',
        properties: ['live: assertive', 'atomic: true', 'interrupts'],
      },
      {
        element: '<div aria-live="polite">',
        announcement: '3 items in cart',
        role: 'region',
        properties: ['live: polite', 'atomic: true', 'waits for pause'],
      },
      {
        element: '<div role="status">',
        announcement: 'Status: Loading complete',
        role: 'status',
        properties: ['live: polite', 'implicit'],
      },
    ],
  },
];


type PlaybackSpeed = 'slow' | 'normal' | 'fast';

const speedSettings: Record<PlaybackSpeed, number> = {
  slow: 2000,
  normal: 1200,
  fast: 600,
};

interface ScreenReaderSimulatorProps {
  initialExample?: string;
  speed?: PlaybackSpeed;
}

export function ScreenReaderSimulator({
  initialExample = 'semantic-page',
  speed: initialSpeed = 'normal',
}: ScreenReaderSimulatorProps) {
  const [selectedExampleId, setSelectedExampleId] = useState(initialExample);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(initialSpeed);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedExample = screenReaderExamples.find((e) => e.id === selectedExampleId)!;

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(() => {
    if (currentIndex >= selectedExample.outputs.length - 1) {
      setCurrentIndex(-1);
    }
    setIsPlaying(true);
  }, [currentIndex, selectedExample.outputs.length]);

  const handleReset = useCallback(() => {
    stopPlayback();
    setCurrentIndex(-1);
    setSelectedExampleId('semantic-page');
  }, [stopPlayback]);

  const handleNext = useCallback(() => {
    if (currentIndex < selectedExample.outputs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, selectedExample.outputs.length]);

  const handleExampleChange = useCallback(
    (exampleId: string) => {
      stopPlayback();
      setSelectedExampleId(exampleId);
      setCurrentIndex(-1);
    },
    [stopPlayback]
  );

  // Playback effect
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= selectedExample.outputs.length - 1) {
            stopPlayback();
            return prev;
          }
          return prev + 1;
        });
      }, speedSettings[speed]);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, selectedExample.outputs.length, stopPlayback]);

  const currentOutput = currentIndex >= 0 ? selectedExample.outputs[currentIndex] : null;

  const getRoleColor = (role: string) => {
    if (['banner', 'navigation', 'main', 'contentinfo', 'form', 'region'].includes(role)) {
      return 'text-purple-400 bg-purple-500/10';
    }
    if (['heading'].includes(role)) {
      return 'text-blue-400 bg-blue-500/10';
    }
    if (['link', 'button'].includes(role)) {
      return 'text-green-400 bg-green-500/10';
    }
    if (['textbox', 'listbox', 'combobox'].includes(role)) {
      return 'text-yellow-400 bg-yellow-500/10';
    }
    if (['alert', 'status'].includes(role)) {
      return 'text-red-400 bg-red-500/10';
    }
    if (['img', 'figure'].includes(role)) {
      return 'text-cyan-400 bg-cyan-500/10';
    }
    return 'text-zinc-400 bg-zinc-500/10';
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          Screen Reader Simulator
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Example Selector */}
        <Card className="p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            HTML Examples
          </h4>
          <div className="space-y-2">
            {screenReaderExamples.map((example) => (
              <button
                key={example.id}
                onClick={() => handleExampleChange(example.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-colors',
                  selectedExampleId === example.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-secondary/50 border-border'
                )}
              >
                <span className="text-sm font-medium">{example.name}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {example.description}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Simulator Panel */}
        <Card className="lg:col-span-2 p-4 bg-card border shadow-sm">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            {selectedExample.name}
          </h4>

          {/* HTML Code */}
          <div className="mb-4 p-3 rounded-lg bg-zinc-900 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-400">HTML Source</span>
            </div>
            <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
              {selectedExample.html}
            </pre>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Button
              variant={isPlaying ? 'secondary' : 'default'}
              size="sm"
              onClick={isPlaying ? stopPlayback : startPlayback}
              className="gap-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Play
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={isPlaying || currentIndex >= selectedExample.outputs.length - 1}
              className="gap-1"
            >
              <SkipForward className="w-3 h-3" />
              Next
            </Button>

            {/* Speed Control */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-muted-foreground mr-1">Speed:</span>
              {(['slow', 'normal', 'fast'] as PlaybackSpeed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    speed === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {s === 'slow' ? '0.5x' : s === 'normal' ? '1x' : '2x'}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>
                {currentIndex + 1} / {selectedExample.outputs.length}
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentIndex + 1) / selectedExample.outputs.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Current Announcement */}
          <AnimatePresence mode="wait">
            {currentOutput ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* Announcement Display */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs text-primary font-medium">
                      Screen Reader Announces:
                    </span>
                  </div>
                  <p className="text-lg font-medium">{currentOutput.announcement}</p>
                </div>

                {/* Element & Role Info */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Element
                    </span>
                    <code className="text-sm font-mono text-foreground">
                      {currentOutput.element}
                    </code>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Role
                    </span>
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded text-sm font-mono',
                        getRoleColor(currentOutput.role)
                      )}
                    >
                      {currentOutput.role}
                    </span>
                  </div>
                </div>

                {/* Properties */}
                {currentOutput.properties.length > 0 && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <span className="text-xs text-muted-foreground block mb-2">
                      Properties
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {currentOutput.properties.map((prop, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-zinc-700/50 text-xs font-mono text-zinc-300"
                        >
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 rounded-lg bg-secondary/30 text-center"
              >
                <VolumeX className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Press Play or Next to start the screen reader simulation
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reading Order */}
          <div className="mt-4 pt-4 border-t">
            <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              Reading Order
            </h5>
            <div className="flex flex-wrap gap-1">
              {selectedExample.outputs.map((output, i) => (
                <button
                  key={i}
                  onClick={() => {
                    stopPlayback();
                    setCurrentIndex(i);
                  }}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-mono transition-colors',
                    i === currentIndex
                      ? 'bg-primary text-primary-foreground'
                      : i < currentIndex
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 This simulates how screen readers like NVDA, JAWS, or VoiceOver announce HTML content. Proper semantic HTML provides rich context for users.
      </div>
    </div>
  );
}

export { screenReaderExamples as examples };
