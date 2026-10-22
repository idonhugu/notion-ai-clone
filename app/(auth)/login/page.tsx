'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!hasSupabaseUrl) {
        // Mock demo login if Supabase credentials are not yet configured
        setMessage({
          text: 'Running in Demo Mode. Redirecting to workspace...',
          type: 'success',
        });
        setTimeout(() => router.push('/'), 800);
        return;
      }

      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;
        setMessage({
          text: 'Check your email! We sent you a secure magic login link.',
          type: 'success',
        });
      } else {
        if (isSignUp) {
          const { error, data } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          if (data.session) {
            router.push('/');
          } else {
            setMessage({
              text: 'Account created! Please check your email to confirm your registration.',
              type: 'success',
            });
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          router.push('/');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setMessage({
        text: err.message || 'Authentication failed. Please verify your credentials.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-purple-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950/20 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600 text-white font-bold text-xl shadow-lg shadow-purple-600/20 mb-3">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-2">
            Notion AI
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              Gemini 1.5
            </span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {useMagicLink
              ? 'Sign in securely with a magic link'
              : isSignUp
              ? 'Create your free workspace account'
              : 'Sign in to access your docs and AI notes'}
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mb-5 p-3 rounded-lg text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition"
              />
            </div>
          </div>

          {!useMagicLink && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {useMagicLink
                    ? 'Send Magic Link'
                    : isSignUp
                    ? 'Create Workspace'
                    : 'Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle options */}
        <div className="mt-5 space-y-2 text-center text-xs text-neutral-500">
          <button
            type="button"
            onClick={() => setUseMagicLink(!useMagicLink)}
            className="text-purple-600 dark:text-purple-400 hover:underline font-medium block w-full"
          >
            {useMagicLink ? 'Sign in with Password instead' : 'Sign in with Magic Link instead'}
          </button>

          {!useMagicLink && (
            <div>
              <span>{isSignUp ? 'Already have an account? ' : "Don't have an account? "}</span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </div>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-400">or</span>
            </div>
          </div>

          {/* Guest continue button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            Continue as Guest (Instant Preview)
          </button>
        </div>
      </div>
    </div>
  );
}
