import { supabase } from '../lib/supabaseClient';
import { EXAM_CONFIG } from '../lib/subjects';

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function fetchSubjectQuestions(subjectId, count = 40) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('subject', subjectId);

  if (error) throw new Error(`Failed to load questions for: ${subjectId}`);
  if (!data || data.length === 0) throw new Error(`No questions found for: ${subjectId}`);

  const shuffled = shuffleArray(data);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function buildExam(selectedSubjectIds, examMode) {
  const config = EXAM_CONFIG[examMode];
  if (!config) throw new Error(`Invalid exam mode: ${examMode}`);

  const allQuestions = [];
  const subjectMap = {};

  for (const subjectId of selectedSubjectIds) {
    const questions = await fetchSubjectQuestions(subjectId, config.questionsPerSubject);
    const startIndex = allQuestions.length;
    const enriched = questions.map((q, idx) => ({
      ...q, subjectId, examIndex: startIndex + idx, userAnswer: null,
    }));
    subjectMap[subjectId] = { startIndex, endIndex: startIndex + enriched.length - 1, count: enriched.length };
    allQuestions.push(...enriched);
  }

  return {
    questions: allQuestions,
    subjectMap,
    totalQuestions: allQuestions.length,
    durationSeconds: config.durationMinutes * 60,
    examMode,
    selectedSubjects: selectedSubjectIds,
  };
}

export function getExamProgress(questions) {
  const answered = questions.filter(q => q.userAnswer !== null).length;
  return {
    answered,
    total: questions.length,
    unanswered: questions.length - answered,
    percentage: Math.round((answered / questions.length) * 100),
  };
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getTimerClass(secondsRemaining, totalSeconds) {
  const ratio = secondsRemaining / totalSeconds;
  if (ratio <= 0.1) return 'text-red-600 animate-tick';
  if (ratio <= 0.25) return 'text-orange-500';
  return 'text-blue-700';
}
