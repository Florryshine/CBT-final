'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { gradeExam, saveResult } from '../../utils/scoring';
import { getSubjectById, EXAM_CONFIG } from '../../lib/subjects';
import Link from 'next/link';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewSubjectId, setReviewSubjectId] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }
      const resultRaw = sessionStorage.getItem('examResult');
      if (!resultRaw) { router.replace('/select-subjects'); return; }
      const examData = JSON.parse(resultRaw);
      const graded = gradeExam(examData.questions);
      saveResult(user.id, { examMode: examData.examMode, selectedSubjects: examData.selectedSubjects }, graded);
      setResult({ ...graded, examData });
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner" style={{width:40,height:40,borderWidth:4}} />
    </div>
  );
  if (!result) return null;

  const { score, totalQuestions, percentage, grade, bySubject, passed, examData } = result;
  const examConfig = EXAM_CONFIG[examData.examMode];
  const isMultiSubject = bySubject.length > 1;

  const gradeColors = {
    success: { bg:'bg-green-50', border:'border-green-200', text:'text-green-700' },
    brand:   { bg:'bg-blue-50',  border:'border-blue-200',  text:'text-blue-700' },
    blue:    { bg:'bg-blue-50',  border:'border-blue-200',  text:'text-blue-700' },
    warning: { bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-700' },
    danger:  { bg:'bg-red-50',   border:'border-red-200',   text:'text-red-700' },
  };
  const gc = gradeColors[grade.color] || gradeColors.brand;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white font-bold text-sm">SB</div>
            <span className="font-display font-bold text-slate-800 hidden sm:block">Shiney Brain</span>
          </Link>
          <span className="text-sm text-slate-500 font-medium">
            {examData.autoSubmitted ? '⏱️ Time expired' : '✅ Submitted'}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className={`rounded-2xl border-2 p-6 text-center ${gc.bg} ${gc.border} animate-slide-up`}>
          <div className="text-5xl mb-2">{grade.emoji}</div>
          <div className={`font-display text-5xl font-bold mb-1 ${gc.text}`}>{percentage}%</div>
          <div className={`text-xl font-semibold mb-2 ${gc.text}`}>{grade.label}</div>
          <div className="text-slate-600 text-sm">You scored <strong>{score}</strong> out of <strong>{totalQuestions}</strong> questions</div>
          <div className={`inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {passed ? '✅ PASS' : '❌ BELOW PASS MARK (50%)'}
          </div>
        </div>

        <div className="card animate-slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              {v:score,l:'Correct'},
              {v:totalQuestions-score,l:'Wrong'},
              {v:examData.questions.filter(q=>!q.userAnswer).length,l:'Skipped'},
              {v:examConfig?.label?.split(' ')[0]||examData.examMode,l:'Mode'},
            ].map(s=>(
              <div key={s.l}>
                <div className="font-display text-xl font-bold text-slate-800">{s.v}</div>
                <div className="text-xs text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex bg-white rounded-xl border border-slate-100 p-1 gap-1">
          {[
            {id:'overview',label:'📊 Overview'},
            ...(isMultiSubject ? [{id:'breakdown',label:'📚 Per Subject'}] : []),
            {id:'review',label:'🔍 Review'},
          ].map(tab=>(
            <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setReviewSubjectId(null);}}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${activeTab===tab.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {bySubject.map(s => {
              const subject = getSubjectById(s.subjectId);
              return (
                <div key={s.subjectId} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{subject?.icon}</span>
                      <span className="font-semibold text-slate-700 text-sm">{s.subjectName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-600">{s.correct}/{s.total}</span>
                      <span className={`badge ${s.percentage>=50?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{s.percentage}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2.5">
                    <div className={`${s.percentage>=50?'bg-blue-500':'bg-red-400'} h-2.5 rounded-full transition-all duration-700`} style={{width:`${s.percentage}%`}} />
                  </div>
                </div>
              );
            })}
            <div className="card bg-blue-50 border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-3">💡 Performance Tips</h3>
              <ul className="space-y-1.5 text-sm text-blue-700">
                {bySubject.filter(s=>s.percentage<50).map(s=>(
                  <li key={s.subjectId}>• Focus more on <strong>{s.subjectName}</strong> — you scored {s.percentage}%</li>
                ))}
                {bySubject.every(s=>s.percentage>=50) && <li>🌟 Great job! You passed all subjects.</li>}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'breakdown' && isMultiSubject && (
          <div className="space-y-3 animate-fade-in">
            {bySubject.map(s => {
              const subject = getSubjectById(s.subjectId);
              return (
                <div key={s.subjectId} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{subject?.icon}</span>
                    <div className="flex-1">
                      <div className="font-display font-bold text-slate-800">{s.subjectName}</div>
                      <div className="text-xs text-slate-500">{s.total} questions</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-display text-2xl font-bold ${s.percentage>=50?'text-green-600':'text-red-500'}`}>{s.percentage}%</div>
                      <div className="text-xs text-slate-400">{s.correct}/{s.total} correct</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-green-50 rounded-xl py-2"><div className="font-bold text-green-700">{s.correct}</div><div className="text-xs text-green-600">Correct</div></div>
                    <div className="bg-red-50 rounded-xl py-2"><div className="font-bold text-red-600">{s.total-s.correct-s.questions.filter(q=>!q.userAnswer).length}</div><div className="text-xs text-red-500">Wrong</div></div>
                    <div className="bg-slate-50 rounded-xl py-2"><div className="font-bold text-slate-600">{s.questions.filter(q=>!q.userAnswer).length}</div><div className="text-xs text-slate-500">Skipped</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="animate-fade-in">
            {isMultiSubject && (
              <div className="flex gap-2 flex-wrap mb-4">
                <button onClick={()=>setReviewSubjectId(null)} className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${!reviewSubjectId?'bg-blue-600 text-white border-blue-600':'bg-white text-slate-600 border-slate-200'}`}>All</button>
                {bySubject.map(s=>{
                  const sub=getSubjectById(s.subjectId);
                  return <button key={s.subjectId} onClick={()=>setReviewSubjectId(s.subjectId)} className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${reviewSubjectId===s.subjectId?'bg-blue-600 text-white border-blue-600':'bg-white text-slate-600 border-slate-200'}`}>{sub?.icon} {sub?.name?.split(' ')[0]}</button>;
                })}
              </div>
            )}
            <div className="space-y-3">
              {(reviewSubjectId
                ? bySubject.find(s=>s.subjectId===reviewSubjectId)?.questions
                : bySubject.flatMap(s=>s.questions)
              )?.map(q=>{
                const opts={a:q.option_a,b:q.option_b,c:q.option_c,d:q.option_d};
                return (
                  <div key={q.id} className={`card border-l-4 ${q.isCorrect?'border-l-green-500':q.userAnswer?'border-l-red-400':'border-l-slate-300'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${q.isCorrect?'bg-green-100 text-green-700':q.userAnswer?'bg-red-100 text-red-600':'bg-slate-100 text-slate-500'}`}>
                        {q.isCorrect?'✓':q.userAnswer?'✗':'–'}
                      </span>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed">{q.question_text}</p>
                    </div>
                    <div className="space-y-1 ml-8">
                      {Object.entries(opts).filter(([,v])=>v).map(([letter,val])=>{
                        const isCorrect=letter===q.correct_answer;
                        const isUserAnswer=letter===q.userAnswer;
                        return (
                          <div key={letter} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${isCorrect?'bg-green-50 text-green-700 font-semibold':isUserAnswer&&!isCorrect?'bg-red-50 text-red-600 line-through':'text-slate-500'}`}>
                            <span className="font-bold">{letter.toUpperCase()}.</span>{val}
                            {isCorrect&&<span className="ml-auto">✅</span>}
                            {isUserAnswer&&!isCorrect&&<span className="ml-auto">❌</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button onClick={()=>{sessionStorage.removeItem('examResult');router.replace('/select-subjects');}} className="btn-primary flex-1 text-base py-4">🔄 Take Another Exam</button>
          <Link href="/dashboard" className="btn-secondary flex-1 text-base py-4 text-center">📊 Dashboard</Link>
        </div>
      </div>
    </main>
  );
  }
