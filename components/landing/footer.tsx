import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-12 md:py-16 px-4 md:px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="sm:col-span-2">
            <Logo className="mb-4" />
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              AI-powered interview preparation for software engineers. 
              Personalized content that helps you understand, not just memorize.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/raulshma/syntax-state" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <Github className="w-4 h-4 text-foreground" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <Twitter className="w-4 h-4 text-foreground" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-mono text-sm text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#community"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-mono text-sm text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 SyntaxState. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for developers, by developer
          </p>
        </div>
      </div>
    </footer>
  )
}
