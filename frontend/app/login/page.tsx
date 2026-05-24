'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      setTimeout(() => router.push('/dashboard'), 0);
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted border border-border">
            <ShieldAlert className="h-6 w-6 text-green-500" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">DefenderMate</h1>
          <p className="text-sm text-muted-foreground">Sign in to your analyst account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="h-9 text-sm bg-background"
                placeholder="analyst"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-9 text-sm bg-background"
              />
            </div>
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-9 text-sm bg-foreground text-background hover:bg-foreground/90"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
