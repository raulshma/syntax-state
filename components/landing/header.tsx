'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewTransitionLink } from '@/components/transitions';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { useTransition } from 'react';

export function Header() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    await signOut();
    startTransition(() => {
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
          router.push('/');
        });
      } else {
        router.push('/');
      }
    });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    
    if (pathname !== '/') {
      // Navigate to homepage first, then scroll to section
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
          startTransition(() => {
            router.push(`/${hash}`);
          });
        });
      } else {
        startTransition(() => {
          router.push(`/${hash}`);
        });
      }
    } else {
      // Already on homepage, just scroll to section
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (firstName[0] || user.emailAddresses[0]?.emailAddress[0] || 'U').toUpperCase();
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <ViewTransitionLink href="/" viewTransitionName="logo">
          <Logo />
        </ViewTransitionLink>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, '#features')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer"
          >
            Features
          </a>
          <a
            href="#community"
            onClick={(e) => handleNavClick(e, '#community')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer"
          >
            Community
          </a>
          <ViewTransitionLink
            href="/pricing"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Pricing
          </ViewTransitionLink>
        </nav>
        <div className="flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
                      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
                        startTransition(() => {
                          router.push('/dashboard');
                        });
                      });
                    } else {
                      router.push('/dashboard');
                    }
                  }}
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <ViewTransitionLink href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </ViewTransitionLink>
              <ViewTransitionLink href="/onboarding">
                <Button size="sm">Get Started</Button>
              </ViewTransitionLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
