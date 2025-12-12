'use client';

import { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Box,
  Palette,
  User,
  Moon,
  Sun,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ContextProviderSimulatorProps {
  /** Initial theme value */
  initialTheme?: 'light' | 'dark';
  /** Initial user name */
  initialUser?: string;
}

// Simulated contexts for demonstration
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

interface UserContextValue {
  user: { name: string } | null;
  setUserName: (name: string) => void;
  logout: () => void;
}

// Create contexts (for internal simulation)
const SimThemeContext = createContext<ThemeContextValue | null>(null);
const SimUserContext = createContext<UserContextValue | null>(null);

/**
 * ContextProviderSimulator Component
 * Allows interactive modification of context values and shows propagation
 * Requirements: 14.6
 */
export function ContextProviderSimulator({
  initialTheme = 'light',
  initialUser = 'Alice',
}: ContextProviderSimulatorProps) {
  // Theme context state
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [themeUpdateCount, setThemeUpdateCount] = useState(0);
  
  // User context state
  const [userName, setUserName] = useState(initialUser);
  const [userUpdateCount, setUserUpdateCount] = useState(0);
  
  // Track which consumers are "receiving" updates
  const [activeConsumers, setActiveConsumers] = useState<string[]>([]);

  // Theme context value
  const themeContextValue = useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme: () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
      setThemeUpdateCount(c => c + 1);
      // Animate consumers
      setActiveConsumers(['header', 'sidebar', 'content']);
      setTimeout(() => setActiveConsumers([]), 800);
    },
  }), [theme]);

  // User context value
  const userContextValue = useMemo<UserContextValue>(() => ({
    user: userName ? { name: userName } : null,
    setUserName: (name: string) => {
      setUserName(name);
      setUserUpdateCount(c => c + 1);
      // Animate consumers
      setActiveConsumers(['profile', 'greeting']);
      setTimeout(() => setActiveConsumers([]), 800);
    },
    logout: () => {
      setUserName('');
      setUserUpdateCount(c => c + 1);
      setActiveConsumers(['profile', 'greeting']);
      setTimeout(() => setActiveConsumers([]), 800);
    },
  }), [userName]);

  // Reset handler
  const handleReset = useCallback(() => {
    setTheme(initialTheme);
    setUserName(initialUser);
    setThemeUpdateCount(0);
    setUserUpdateCount(0);
    setActiveConsumers([]);
  }, [initialTheme, initialUser]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          Context Provider Simulator
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Interactive Context:</strong> Modify context values using the controls below and watch how changes propagate to all consuming components instantly. No prop drilling needed!
        </p>
      </Card>


      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Provider Controls */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/30">
            <span className="text-sm font-medium flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-500" />
              Context Providers
            </span>
          </div>
          <div className="p-4 space-y-6">
            {/* Theme Context Provider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-500" />
                  ThemeContext
                </h4>
                <span className="text-xs text-muted-foreground">
                  Updates: {themeUpdateCount}
                </span>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current theme:</span>
                  <span className={cn(
                    'px-2 py-1 rounded text-sm font-medium',
                    theme === 'dark' 
                      ? 'bg-zinc-800 text-white' 
                      : 'bg-yellow-100 text-yellow-800'
                  )}>
                    {theme === 'dark' ? <Moon className="w-4 h-4 inline mr-1" /> : <Sun className="w-4 h-4 inline mr-1" />}
                    {theme}
                  </span>
                </div>
                
                <Button 
                  onClick={themeContextValue.toggleTheme}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <Zap className="w-3 h-3" />
                  Toggle Theme
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground font-mono p-2 rounded bg-zinc-900 text-zinc-300">
                {`<ThemeContext.Provider value={{ theme: "${theme}" }}>`}
              </div>
            </div>

            {/* User Context Provider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  UserContext
                </h4>
                <span className="text-xs text-muted-foreground">
                  Updates: {userUpdateCount}
                </span>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current user:</span>
                  <span className={cn(
                    'px-2 py-1 rounded text-sm font-medium',
                    userName ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  )}>
                    {userName || 'Not logged in'}
                  </span>
                </div>
                
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => userContextValue.setUserName(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                />
                
                <Button 
                  onClick={userContextValue.logout}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!userName}
                >
                  Logout
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground font-mono p-2 rounded bg-zinc-900 text-zinc-300">
                {`<UserContext.Provider value={{ user: ${userName ? `{ name: "${userName}" }` : 'null'} }}>`}
              </div>
            </div>
          </div>
        </Card>

        {/* Consumer Components */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/30">
            <span className="text-sm font-medium flex items-center gap-2">
              <Box className="w-4 h-4 text-green-500" />
              Consumer Components
            </span>
          </div>
          <div className="p-4 space-y-4">
            {/* Simulated App Preview */}
            <SimThemeContext.Provider value={themeContextValue}>
              <SimUserContext.Provider value={userContextValue}>
                <div className={cn(
                  'rounded-lg border overflow-hidden transition-colors duration-300',
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
                )}>
                  {/* Header Consumer */}
                  <ConsumerComponent
                    id="header"
                    name="Header"
                    isActive={activeConsumers.includes('header')}
                    theme={theme}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">MyApp</span>
                      <span className="text-xs px-2 py-1 rounded bg-current/10">
                        Theme: {theme}
                      </span>
                    </div>
                  </ConsumerComponent>
                  
                  <div className="flex">
                    {/* Sidebar Consumer */}
                    <ConsumerComponent
                      id="sidebar"
                      name="Sidebar"
                      isActive={activeConsumers.includes('sidebar')}
                      theme={theme}
                      className="w-1/3 border-r"
                    >
                      <div className="space-y-2">
                        <div className={cn(
                          'text-xs px-2 py-1 rounded',
                          theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                        )}>
                          Dashboard
                        </div>
                        <div className={cn(
                          'text-xs px-2 py-1 rounded',
                          theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                        )}>
                          Settings
                        </div>
                      </div>
                    </ConsumerComponent>
                    
                    {/* Content Area */}
                    <div className="flex-1">
                      {/* Greeting Consumer */}
                      <ConsumerComponent
                        id="greeting"
                        name="Greeting"
                        isActive={activeConsumers.includes('greeting')}
                        theme={theme}
                      >
                        <p className="text-sm">
                          {userName ? `Welcome back, ${userName}!` : 'Please log in'}
                        </p>
                      </ConsumerComponent>
                      
                      {/* Profile Consumer */}
                      <ConsumerComponent
                        id="profile"
                        name="UserProfile"
                        isActive={activeConsumers.includes('profile')}
                        theme={theme}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                            theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
                          )}>
                            {userName ? userName[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {userName || 'Guest'}
                            </div>
                            <div className="text-xs opacity-60">
                              {userName ? 'Logged in' : 'Not authenticated'}
                            </div>
                          </div>
                        </div>
                      </ConsumerComponent>
                    </div>
                  </div>
                </div>
              </SimUserContext.Provider>
            </SimThemeContext.Provider>
          </div>
        </Card>
      </div>

      {/* Code Example */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">How It Works</h4>
        <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto">
          <pre>{`// 1. Create context
const ThemeContext = createContext();

// 2. Provider wraps the app
function App() {
  const [theme, setTheme] = useState('${theme}');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />  {/* Can access theme */}
      <Sidebar /> {/* Can access theme */}
      <Content /> {/* Can access theme */}
    </ThemeContext.Provider>
  );
}

// 3. Consumers use useContext
function Header() {
  const { theme } = useContext(ThemeContext);
  return <header className={theme}>...</header>;
}`}</pre>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Change the theme or user name above and watch all consumer components update instantly. This is the power of React Context!
      </div>
    </div>
  );
}

/**
 * ConsumerComponent - Renders a simulated consumer with update animation
 */
interface ConsumerComponentProps {
  id: string;
  name: string;
  isActive: boolean;
  theme: 'light' | 'dark';
  className?: string;
  children: React.ReactNode;
}

function ConsumerComponent({
  id,
  name,
  isActive,
  theme,
  className,
  children,
}: ConsumerComponentProps) {
  return (
    <motion.div
      className={cn(
        'p-3 transition-colors duration-300',
        theme === 'dark' 
          ? 'text-zinc-100 border-zinc-700' 
          : 'text-gray-900 border-gray-200',
        className
      )}
      animate={isActive ? {
        backgroundColor: theme === 'dark' 
          ? ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0)']
          : ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0)'],
      } : {}}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center gap-1 mb-2">
        <Box className={cn(
          'w-3 h-3',
          isActive ? 'text-green-500' : 'text-muted-foreground'
        )} />
        <span className="text-xs font-mono opacity-60">{name}</span>
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-xs px-1 py-0.5 rounded bg-green-500 text-white ml-auto"
            >
              Updated!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {children}
    </motion.div>
  );
}

export default ContextProviderSimulator;
