'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { buildExam, formatTime, getTimerClass, getExamProgress } from '../../utils/examEngine';
import { getSubjectById } from '../../lib/subjects';

export default function ExamPage() {
  const router = useRouter();
  const [exam, setExam] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }

      const setupRaw = sessionStorage.getItem('examSetup');
      if (!setupRaw) { router.replace('/select-subjects'); return; }

      const setup = JSON.parse(setupRaw);
      try {
        const examData = await buildExam(setup.selectedSubjects, setup.examMode);
        setExam(examData);
        setTimeLeft(examData.durationSeconds);
        setLoading(false);
      } catch (err) {
        setLoadError(err.message || 'Failed to load exam questions.');
        setLoading(false);
      }
    }
    init();
  }, [router]);

  useEffect(() => {
    if (!exam || loading || submitting) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [exam, loading, submitting]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    setShowConfirm(false);
    const gradedQuestions = exam.questions.map(q => ({ ...q, userAnswer: answers[q.id] || null }));
    sessionStorage.setItem('examResult', JSON.stringify({
      questions: gradedQuestions,
      examMode: exam.examMode,
      selectedSubjects: exam.selectedSubjects,
      autoSubmitted: autoSubmit,
    }));
    router.push('/result');
  }, [submitting, exam, answers, router]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center">
        <div className="spinner mx-auto mb-4" style={{width:40,height:40,borderWidth:4}} />
        <h2 className="font-display font-bold text-slate-800 text-lg mb-1">Loading Your Exam</h2>
        <p className="text-slate-500 text-sm">Fetching and randomizing questions...</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="font-display font-bold text-slate-800 text-lg mb-2">Failed to Load Exam</h2>
        <p className="text-slate-500 text-sm mb-4">{loadError}</p>
        <p className="text-slate-400 text-xs mb-4">Make sure questions have been added to Supabase for the selected subjects.</p>
        <button onClick={() => router.replace('/select-subjects')} className="btn-primary w-full">← Back to Subject Selection</button>
      </div>
    </div>
  );

  const currentQuestion = exam.questions[currentIdx];
  const progress = getExamProgress(exam.questions.map(q => ({ ...q, userAnswer: answers[q.id] || null })));
  const timerClass = getTimerClass(timeLeft, exam.durationSeconds);
  const currentSubject = getSubjectById(currentQuestion.subjectId);
  const selectedSubjects = exam.selectedSubjects.map(id => getSubjectById(id)).filter(Boolean);
  const optionLetters = ['a', 'b', 'c', 'd'];
  const optionValues = { a: currentQuestion.option_a, b: currentQuestion.option_b, c: currentQuestion.option_c, d: currentQuestion.option_d };
  const filteredQuestions = activeSubjectFilter
    ? exam.questions.map((q,i) => ({...q,origIdx:i})).filter(q => q.subjectId === activeSubjectFilter)
    : exam.questions.map((q,i) => ({...q,origIdx:i}));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className={`flex items-center gap-1.5 font-mono font-bold text-lg tabular-nums ${timerClass}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <div className="flex-1 mx-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{width:`${progress.percentage}%`}} />
              </div>
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{progress.answered}/{progress.total}</span>
            </div>
          </div>
          <button onClick={() => setShowNav(!showNav)} className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
            Q {currentIdx+1}/{exam.totalQuestions}
          </button>
          <button onClick={() => setShowConfirm(true)} className="btn-danger text-sm py-2 px-3 sm:px-4">Submit</button>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 pb-24">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">{currentSubject?.icon}</span>
          <span className="text-sm font-semibold text-slate-600">{currentSubject?.name}</span>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-400">Question {currentIdx+1} of {exam.totalQuestions}</span>
        </div>

        <div className="card mb-4" key={currentQuestion.id}>
          <p className="text-slate-800 font-medium text-base sm:text-lg leading-relaxed">{currentQuestion.question_text}</p>
        </div>

        <div className="space-y-2.5 mb-4">
          {optionLetters.map(letter => {
            const val = optionValues[letter];
            if (!val) return null;
            const isSelected = answers[currentQuestion.id] === letter;
            return (
              <button key={letter} onClick={() => setAnswers(prev => ({...prev,[currentQuestion.id]:letter}))}
                className={`option-btn ${isSelected ? 'option-btn-selected' : 'option-btn-default'}`}>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold mr-3 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {letter.toUpperCase()}
                </span>
                {val}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => setCurrentIdx(i => Math.max(0,i-1))} disabled={currentIdx===0} className="btn-secondary text-sm py-2.5 px-4 flex-1 disabled:opacity-40">← Prev</button>
          {!answers[currentQuestion.id]
            ? <span className="text-xs text-slate-400 text-center flex-shrink-0">Not answered</span>
            : <span className="text-xs text-green-600 font-semibold text-center flex-shrink-0">✓ Answered</span>}
          <button onClick={() => setCurrentIdx(i => Math.min(exam.totalQuestions-1,i+1))} disabled={currentIdx===exam.totalQuestions-1} className="btn-primary text-sm py-2.5 px-4 flex-1 disabled:opacity-40">Next →</button>
        </div>
      </div>

      {showNav && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNav(false)} />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800">Question Navigator</h3>
              <button onClick={() => setShowNav(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            {selectedSubjects.length > 1 && (
              <div className="px-4 py-2 border-b border-slate-100 flex gap-1.5 overflow-x-auto">
                <button onClick={() => setActiveSubjectFilter(null)}
                  className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${!activeSubjectFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  All
                </button>
                {selectedSubjects.map(s => (
                  <button key={s.id} onClick={() => setActiveSubjectFilter(s.id)}
                    className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${activeSubjectFilter===s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {s.icon} {s.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 gap-1.5">
                {filteredQuestions.map(q => {
                  const origIdx = q.origIdx;
                  const isAnswered = !!answers[q.id];
                  const isCurrent = origIdx === currentIdx;
                  return (
                    <button key={origIdx} onClick={() => { setCurrentIdx(origIdx); setShowNav(false); }}
                      className={`q-num-btn ${isCurrent ? 'q-num-current' : isAnswered ? 'q-num-answered' : 'q-num-unanswered'}`}>
                      {origIdx+1}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-blue-600 rounded" /> Answered ({progress.answered})</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-white border border-slate-200 rounded" /> Unanswered ({progress.unanswered})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Submit Exam?</h3>
            <p className="text-slate-500 text-sm mb-4">
              You have answered <strong className="text-slate-700">{progress.answered}</strong> of <strong className="text-slate-700">{progress.total}</strong> questions.
              {progress.unanswered > 0 && <span className="text-orange-600"> {progress.unanswered} unanswered.</span>}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-amber-700">
              ⚠️ You cannot return to the exam after submitting.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Continue Exam</button>
              <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-danger flex-1">
                {submitting ? 'Submitting...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
    }
