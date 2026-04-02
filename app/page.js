'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const features = [
    { icon: '📚', title: 'All JAMB Subjects', desc: 'Science, Arts & Commercial' },
    { icon: '⏱️', title: 'Real-Time Timer', desc: 'Auto-submit on timeout' },
    { icon: '📊', title: 'Instant Results', desc: 'Detailed performance report' },
    { icon: '🔀', title: 'Randomized Questions', desc: 'New mix every attempt' },
  ];

  const subjects = [
    '🧬 Biology','⚗️ Chemistry','⚡ Physics','📐 Mathematics',
    '📝 English','📚 Literature','🏛️ Government','📊 Economics',
    '🧾 Accounting','🌍 Geography','✝️ CRS','☪️ IRS',
  ];

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white font-bold text-sm">SB</div>
            <span className="font-display font-bold text-slate-800 text-sm sm:text-base">Shiney Brain</span>
          </div>
          {!loading && (
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-sm text-slate-600 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 hidden sm:block">Dashboard</Link>
                  <Link href="/select-subjects" className="btn-primary text-sm py-2 px-4">Start Exam</Link>
                </>
              ) : (
                <Link href="/auth" className="btn-primary text-sm py-2 px-4">Sign In</Link>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-40" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            JAMB 2025 Preparation
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-4 animate-slide-up">
            Shiney Brain
            <span className="block text-blue-600">JAMB Mock CBT</span>
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Practice with real JAMB-style questions. Choose any subject, set your exam mode, and get instant results — just like the real thing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link href="/select-subjects" className="btn-primary text-lg py-4 px-8">🚀 Start Exam Now</Link>
            ) : (
              <>
                <Link href="/auth" className="btn-primary text-lg py-4 px-8">🚀 Start Free Practice</Link>
                <Link href="/auth?mode=signup" className="btn-secondary text-lg py-4 px-8">Create Account</Link>
              </>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-center">
            {[{num:'18',label:'Subjects'},{num:'100+',label:'Questions'},{num:'2',label:'Exam Modes'},{num:'100%',label:'Free'}].map(s=>(
              <div key={s.label} className="flex flex-col">
                <span className="font-display text-2xl font-bold text-blue-600">{s.num}</span>
                <span className="text-slate-500 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-slate-800 mb-10">Built for JAMB Success</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(f=>(
              <div key={f.title} className="card text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{f.title}</h3>
                <p className="text-slate-500 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-slate-800 mb-3">All JAMB Subjects Covered</h2>
          <p className="text-center text-slate-500 mb-10">Science · Arts · Commercial</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {subjects.map(s=>(
              <span key={s} className="bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full">{s}</span>
            ))}
            <span className="bg-slate-100 text-slate-500 text-sm font-medium px-3 py-1.5 rounded-full">+ 6 more subjects</span>
          </div>
        </div>
      </section>

      <section className="bg-blue-950 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">Two Ways to Practice</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-display text-xl font-bold mb-2">Single Subject Mode</h3>
              <p className="text-white/70 text-sm mb-4">Focus on one subject at a time</p>
              <ul className="space-y-1 text-sm text-white/80">
                <li>✓ 40 questions per subject</li>
                <li>✓ 30 minutes duration</li>
                <li>✓ Instant detailed feedback</li>
              </ul>
            </div>
            <div className="bg-yellow-500/20 rounded-2xl p-6 border border-yellow-400/30">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-display text-xl font-bold mb-2">JAMB Mock Mode</h3>
              <p className="text-white/70 text-sm mb-4">Full JAMB simulation experience</p>
              <ul className="space-y-1 text-sm text-white/80">
                <li>✓ 4 subjects · 160 questions</li>
                <li>✓ 120 minutes duration</li>
                <li>✓ Aggregate score + breakdown</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href={user ? '/select-subjects' : '/auth'} className="inline-block bg-white text-blue-700 font-bold py-4 px-10 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Start Practicing Now →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p className="font-display font-semibold text-slate-700 mb-1">Shiney Brain JAMB Mock CBT</p>
          <p>A practice tool for JAMB aspirants. Not affiliated with JAMB.</p>
        </div>
      </footer>
    </main>
  );
    }
