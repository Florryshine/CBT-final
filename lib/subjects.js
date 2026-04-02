export const CATEGORIES = {
  SCIENCE: 'science',
  ARTS: 'arts',
  COMMERCIAL: 'commercial',
};

export const SUBJECTS = [
  // Science
  { id: 'biology', name: 'Biology', category: CATEGORIES.SCIENCE, icon: '🧬' },
  { id: 'chemistry', name: 'Chemistry', category: CATEGORIES.SCIENCE, icon: '⚗️' },
  { id: 'physics', name: 'Physics', category: CATEGORIES.SCIENCE, icon: '⚡' },
  { id: 'mathematics', name: 'Mathematics', category: CATEGORIES.SCIENCE, icon: '📐' },

  // Arts
  { id: 'english', name: 'English Language', category: CATEGORIES.ARTS, icon: '📝' },
  { id: 'literature', name: 'Literature in English', category: CATEGORIES.ARTS, icon: '📚' },
  { id: 'government', name: 'Government', category: CATEGORIES.ARTS, icon: '🏛️' },
  { id: 'crs', name: 'Christian Religious Studies', category: CATEGORIES.ARTS, icon: '✝️' },
  { id: 'irs', name: 'Islamic Religious Studies', category: CATEGORIES.ARTS, icon: '☪️' },
  { id: 'history', name: 'History', category: CATEGORIES.ARTS, icon: '🏺' },
  { id: 'fine_art', name: 'Fine Art', category: CATEGORIES.ARTS, icon: '🎨' },

  // Commercial
  { id: 'economics', name: 'Economics', category: CATEGORIES.COMMERCIAL, icon: '📊' },
  { id: 'commerce', name: 'Commerce', category: CATEGORIES.COMMERCIAL, icon: '🏪' },
  { id: 'accounting', name: 'Accounting', category: CATEGORIES.COMMERCIAL, icon: '🧾' },
  { id: 'marketing', name: 'Marketing', category: CATEGORIES.COMMERCIAL, icon: '📣' },
  { id: 'geography', name: 'Geography', category: CATEGORIES.COMMERCIAL, icon: '🌍' },
  { id: 'civic_education', name: 'Civic Education', category: CATEGORIES.COMMERCIAL, icon: '🗳️' },
];

export const EXAM_MODES = {
  SINGLE: 'single',
  MOCK: 'mock',
};

export const EXAM_CONFIG = {
  [EXAM_MODES.SINGLE]: {
    questionsPerSubject: 40,
    durationMinutes: 30,
    maxSubjects: 1,
    minSubjects: 1,
    label: 'Single Subject',
    description: '40 questions · 30 minutes',
  },
  [EXAM_MODES.MOCK]: {
    questionsPerSubject: 40,
    durationMinutes: 120,
    maxSubjects: 4,
    minSubjects: 4,
    label: 'JAMB Mock (4 Subjects)',
    description: '160 questions · 120 minutes',
  },
};

export const getSubjectById = (id) => SUBJECTS.find((s) => s.id === id);

export const getSubjectsByCategory = (category) =>
  SUBJECTS.filter((s) => s.category === category);

export const CATEGORY_LABELS = {
  [CATEGORIES.SCIENCE]: { label: 'Science', emoji: '🔬', color: 'emerald' },
  [CATEGORIES.ARTS]: { label: 'Arts', emoji: '📖', color: 'purple' },
  [CATEGORIES.COMMERCIAL]: { label: 'Commercial', emoji: '💼', color: 'amber' },
};
