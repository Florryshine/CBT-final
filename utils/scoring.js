import { supabase } from '../lib/supabaseClient';
import { getSubjectById } from '../lib/subjects';

/**
 * Grade a completed exam
 * Returns detailed scoring breakdown per subject and overall
 */
export function gradeExam(questions) {
  const overall = { correct: 0, total: questions.length };
  const bySubject = {};

  for (const question of questions) {
    const { subjectId, userAnswer, correct_answer } = question;

    if (!bySubject[subjectId]) {
      const subjectInfo = getSubjectById(subjectId);
      bySubject[subjectId] = {
        subjectId,
        subjectName: subjectInfo?.name || subjectId,
        correct: 0,
        total: 0,
        questions: [],
      };
    }

    const isCorrect =
      userAnswer !== null &&
      userAnswer !== undefined &&
      userAnswer.toString().toLowerCase() === correct_answer.toString().toLowerCase();

    bySubject[subjectId].total += 1;
    if (isCorrect) {
      bySubject[subjectId].correct += 1;
      overall.correct += 1;
    }

    bySubject[subjectId].questions.push({
      ...question,
      isCorrect,
    });
  }

  const percentage = overall.total > 0
    ? Math.round((overall.correct / overall.total) * 100)
    : 0;

  // Add percentage to each subject
  const subjectResults = Object.values(bySubject).map((s) => ({
    ...s,
    percentage: Math.round((s.correct / s.total) * 100),
    grade: getGrade(Math.round((s.correct / s.total) * 100)),
  }));

  return {
    score: overall.correct,
    totalQuestions: overall.total,
    percentage,
    grade: getGrade(percentage),
    bySubject: subjectResults,
    passed: percentage >= 50,
  };
}

/**
 * Get JAMB-style grade from percentage
 */
export function getGrade(percentage) {
  if (percentage >= 80) return { label: 'Excellent', color: 'success', emoji: '🏆' };
  if (percentage >= 65) return { label: 'Very Good', color: 'brand', emoji: '🌟' };
  if (percentage >= 50) return { label: 'Good', color: 'blue', emoji: '👍' };
  if (percentage >= 40) return { label: 'Fair', color: 'warning', emoji: '📈' };
  return { label: 'Needs Improvement', color: 'danger', emoji: '📚' };
}

/**
 * Save exam results to Supabase
 */
export async function saveResult(userId, examData, scoringResult) {
  const { data, error } = await supabase
    .from('results')
    .insert([
      {
        user_id: userId,
        score: scoringResult.score,
        total_questions: scoringResult.totalQuestions,
        percentage: scoringResult.percentage,
        exam_mode: examData.examMode,
        subjects_selected: examData.selectedSubjects,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving result:', error);
    // Non-fatal: result may fail to save but we still show results
    return null;
  }

  return data;
}

/**
 * Fetch user's past results
 */
export async function fetchUserResults(userId, limit = 10) {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching results:', error);
    return [];
  }

  return data || [];
}
