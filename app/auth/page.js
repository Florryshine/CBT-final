'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/select-subjects');
    });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/select-subjects');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-white font-bold">SB</div>
        <span className="font-display font-bold text-slate-800 text-lg">Shiney Brain</span>
      </Link>

      <div className="card w-full max-w-md animate-slide-up">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
          {mode === 'login' ? 'Welcome back!' : 'Create your account'}
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          {mode === 'login' ? 'Sign in to access your practice exams' : 'Join thousands of JAMB aspirants'}
        </p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">⚠️ {error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" className="input-field" placeholder="Your full name" value={fullName} onChange={e=>setFullName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" className="input-field" placeholder={mode==='signup'?'Min. 6 characters':'Your password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required />
          </div>
          <button type="submit" className="btn-primary w-full text-base py-3.5" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? '🔐 Sign In' : '🚀 Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setSuccess('');}} className="text-blue-600 font-semibold hover:underline">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>}>
      <AuthForm />
    </Suspense>
  );
                                         }
