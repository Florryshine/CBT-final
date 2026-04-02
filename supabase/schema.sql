CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.questions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text  TEXT NOT NULL,
  option_a       TEXT NOT NULL,
  option_b       TEXT NOT NULL,
  option_c       TEXT NOT NULL,
  option_d       TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  subject        TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('science', 'arts', 'commercial')),
  year           INTEGER,
  difficulty     TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_subject  ON public.questions (subject);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions (category);

CREATE TABLE IF NOT EXISTS public.results (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score             INTEGER NOT NULL,
  total_questions   INTEGER NOT NULL,
  percentage        NUMERIC(5,2) NOT NULL,
  exam_mode         TEXT NOT NULL CHECK (exam_mode IN ('single', 'mock')),
  subjects_selected TEXT[] NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_results_user_id    ON public.results (user_id);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON public.results (created_at DESC);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read questions"
  ON public.questions FOR SELECT TO authenticated USING (true);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own results"
  ON public.results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results"
  ON public.results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
