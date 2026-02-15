'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SiGithub, SiGoogle } from 'react-icons/si';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl bg-background-secondary p-8">
        <h1 className="text-3xl font-bold text-white mb-2">ScopedIn</h1>
        <p className="text-text-muted mb-8">Master your estimation</p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-background p-3 text-white border border-border focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-background p-3 text-white border border-border focus:border-primary focus:outline-none"
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary p-3 text-white font-semibold hover:bg-primary-dark transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-text-muted text-sm">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border p-3 text-white hover:bg-background-tertiary transition">
            <SiGoogle size={20} />
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border p-3 text-white hover:bg-background-tertiary transition">
            <SiGithub size={20} />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
