'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { SUBJECTS, CATEGORIES, CATEGORY_LABELS, EXAM_MODES, EXAM_CONFIG, getSubjectsByCategory } from '../../lib/subjects';
import Link from 'next/link';

export default function SelectSubjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examMode, setExamMode] = useState(EXAM_MODES.MOCK);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

  const config = EXAM_CONFIG[examMode];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/auth');
      else { setUser(user); setLoading(false); }
    });
  }, [router]);

  function toggleSubject(subjectId) {
    setError('');
    setSelected(prev => {
      if (prev.includes(subjectId)) return prev.filter(s => s !== subjectId);
      if (prev.length >= config.maxSubjects) {
        if (examMode === EXAM_MODES.SINGLE) return [subjectId];
        setError(`You can only select ${config.maxSubjects} subjects for ${config.label}.`);
        return prev;
      }
      return [...prev, subjectId];
    });
  }

  function handleModeChange(newMode) {
    setExamMode(newMode);
    setSelected([]);
    setError('');
  }

  async function startExam() {
    if (selected.length < config.minSubjects) {
      setError(examMode === EXAM_MODES.MOCK ? 'Please select exactly 4 subjects for Mock mode.' : 'Please select a subject to continue.');
      return;
    }
    sessionStorage.setItem('examSetup', JSON.stringify({ examMode, selectedSubjects: selected }));
    router.push('/exam');
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner" style={{width:40,height:40,borderWidth:4}} />
    </div>
  );

  const categoryList = [CATEGORIES.SCIENCE, CATEGORIES.ARTS, CATEGORIES.COMMERCIAL];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white font-bold text-sm">SB</div>
            <span className="font-display font-bold text-slate-800 hidden sm:block">Shiney Brain</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm hidden sm:block">{user?.email?.split('@')[0]}</span>
            <button onClick={signOut} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <div className="mb-6 animate-slide-up">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Set Up Your Exam</h1>
          <p className="text-slate-500 mt-1">Choose your mode and select subjects</p>
        </div>

        <div className="card mb-6">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Exam Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(EXAM_MODES).map(mode => {
              const cfg = EXAM_CONFIG[mode];
              const isActive = examMode === mode;
              return (
                <button key={mode} onClick={() => handleModeChange(mode)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                  <div className="text-xl mb-1">{mode === EXAM_MODES.SINGLE ? '📖' : '🏆'}</div>
                  <div className={`font-semibold text-sm ${isActive ? 'text-blue-800' : 'text-slate-700'}`}>{cfg.label}</div>
                  <div className={`text-xs mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{cfg.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
            Select {examMode === EXAM_MODES.SINGLE ? '1 Subject' : '4 Subjects'}
          </h2>
          <span className={`text-sm font-semibold ${selected.length === config.maxSubjects ? 'text-green-600' : 'text-slate-400'}`}>
            {selected.length} / {config.maxSubjects} selected
          </span>
        </div>

        {categoryList.map(category => {
          const catInfo = CATEGORY_LABELS[category];
          const subjects = getSubjectsByCategory(category);
          return (
            <div key={category} className="card mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{catInfo.emoji}</span>
                <h3 className="font-display font-bold text-slate-800">{catInfo.label}</h3>
                <span className="badge bg-slate-100 text-slate-500">{subjects.length} subjects</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {subjects.map(subject => {
                  const isSelected = selected.includes(subject.id);
                  const isDisabled = !isSelected && selected.length >= config.maxSubjects && examMode === EXAM_MODES.MOCK;
                  return (
                    <button key={subject.id} onClick={() => toggleSubject(subject.id)} disabled={isDisabled}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                        isSelected ? 'border-blue-500 bg-blue-50' : isDisabled ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                      }`}>
                      <span className="text-xl">{subject.icon}</span>
                      <span className={`font-medium text-sm ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>{subject.name}</span>
                      {isSelected && <span className="ml-auto text-blue-600 text-base">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto">
          {error && <p className="text-red-600 text-sm text-center mb-3">⚠️ {error}</p>}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
              {selected.map(id => {
                const sub = SUBJECTS.find(s => s.id === id);
                return (
                  <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {sub?.icon} {sub?.name}
                    <button onClick={() => toggleSubject(id)} className="ml-0.5 hover:text-red-500">×</button>
                  </span>
                );
              })}
            </div>
          )}
          <button onClick={startExam} disabled={selected.length < config.minSubjects} className="btn-primary w-full text-base py-4">
            {selected.length < config.minSubjects
              ? `Select ${config.minSubjects - selected.length} more subject${config.minSubjects - selected.length !== 1 ? 's' : ''}`
              : `🚀 Start Exam (${config.description})`}
          </button>
        </div>
      </div>
    </main>
  );
}
