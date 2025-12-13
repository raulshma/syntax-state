'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  ArrowRight,
  Code,
  FileCode,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PageObjectModelDemoProps {
  /** Show the comparison view */
  showComparison?: boolean;
}

interface CodeBlock {
  title: string;
  filename: string;
  code: string;
  highlights?: string[];
}

const withoutPOM: CodeBlock = {
  title: 'Without Page Object Model',
  filename: 'login.spec.ts',
  code: `test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('user@test.com');
  await page.locator('#password').fill('password123');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL('/dashboard');
});

test('shows error for invalid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('wrong@test.com');
  await page.locator('#password').fill('wrongpass');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.error-message')).toBeVisible();
});

// Problem: Selectors duplicated everywhere!
// If #email changes to #user-email, update ALL tests 😱`,
  highlights: ['#email', '#password', 'button[type="submit"]'],
};

const pageObjectCode: CodeBlock = {
  title: 'Page Object Class',
  filename: 'pages/LoginPage.ts',
  code: `export class LoginPage {
  readonly page: Page;
  
  // Define locators once
  readonly emailInput = this.page.getByLabel('Email');
  readonly passwordInput = this.page.getByLabel('Password');
  readonly submitButton = this.page.getByRole('button', { name: 'Sign in' });
  readonly errorMessage = this.page.getByRole('alert');

  constructor(page: Page) {
    this.page = page;
  }

  // Encapsulate actions
  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}`,
  highlights: ['getByLabel', 'getByRole', 'login('],
};

const withPOM: CodeBlock = {
  title: 'With Page Object Model',
  filename: 'login.spec.ts',
  code: `import { LoginPage } from './pages/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password123');
  
  await expect(page).toHaveURL('/dashboard');
});

test('shows error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('wrong@test.com', 'wrongpass');
  
  await expect(loginPage.errorMessage).toBeVisible();
});

// ✅ Clean, readable, maintainable!
// Change selector in ONE place`,
  highlights: ['LoginPage', 'loginPage.goto()', 'loginPage.login('],
};

const benefits = [
  {
    title: 'Single Source of Truth',
    description: 'Selectors defined once, used everywhere',
    icon: '🎯',
  },
  {
    title: 'Readable Tests',
    description: 'Tests read like user stories',
    icon: '📖',
  },
  {
    title: 'Easy Maintenance',
    description: 'UI changes require updates in one place',
    icon: '🔧',
  },
  {
    title: 'Reusable Actions',
    description: 'Common flows encapsulated as methods',
    icon: '♻️',
  },
];

/**
 * PageObjectModelDemo Component
 * Interactive demonstration of the Page Object Model pattern
 */
export function PageObjectModelDemo({
  showComparison = true,
}: PageObjectModelDemoProps) {
  const [activeTab, setActiveTab] = useState<'without' | 'pageobject' | 'with'>('without');

  const codeBlocks = {
    without: withoutPOM,
    pageobject: pageObjectCode,
    with: withPOM,
  };

  const activeCode = codeBlocks[activeTab];

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Page Object Model Pattern</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Organize test code for maintainability and reusability
        </p>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('without')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              activeTab === 'without'
                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            )}
          >
            <span>1. Without POM</span>
          </button>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setActiveTab('pageobject')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              activeTab === 'pageobject'
                ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            )}
          >
            <span>2. Create Page Object</span>
          </button>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setActiveTab('with')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              activeTab === 'with'
                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            )}
          >
            <span>3. With POM</span>
          </button>
        </div>

        {/* Code Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-border overflow-hidden"
          >
            {/* File header */}
            <div className="px-4 py-2 bg-secondary/50 border-b border-border flex items-center gap-2">
              <FileCode className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">{activeCode.filename}</span>
            </div>
            
            {/* Code content */}
            <pre className="p-4 text-xs font-mono overflow-x-auto bg-secondary/20">
              <code>{activeCode.code}</code>
            </pre>
          </motion.div>
        </AnimatePresence>

        {/* Benefits Section */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Why Use Page Object Model?
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <span className="text-2xl mb-2 block">{benefit.icon}</span>
                <p className="text-sm font-medium">{benefit.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Insight */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Key Insight</p>
              <p className="text-xs text-muted-foreground mt-1">
                Page Objects act as an API for your pages. Tests describe <em>what</em> to do, 
                Page Objects handle <em>how</em> to do it. When the UI changes, update the 
                Page Object once instead of every test.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default PageObjectModelDemo;
