'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LightSwitch from './LightSwitch';
import { ShieldAlert } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/alerts', label: 'Alerts' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <ShieldAlert className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-sm tracking-tight">DefenderMate</span>
          </Link>
          <nav className="flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm px-3 py-1.5 rounded-md transition-colors duration-150',
                  pathname.startsWith(link.href)
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border">
            <div className="h-6 w-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-green-400 uppercase leading-none">
                {user.username[0]}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono hidden sm:block">
              {user.username}
            </span>
          </div>
          <LightSwitch />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
