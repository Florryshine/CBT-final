# 🧠 Shiney Brain JAMB Mock CBT

A full-featured JAMB examination simulator with realistic CBT interface, timed exams, and instant results.

---

## 📁 Project Structure

```
shiney-brain-cbt/
├── app/
│   ├── layout.js           # Root layout with fonts & metadata
│   ├── globals.css         # Global styles & Tailwind
│   ├── page.js             # Home / Landing page
│   ├── auth/
│   │   └── page.js         # Login & Signup page
│   ├── select-subjects/
│   │   └── page.js         # Subject & exam mode selection
│   ├── exam/
│   │   └── page.js         # CBT exam interface
│   └── result/
│       └── page.js         # Results, review & analytics
├── lib/
│   ├── supabaseClient.js   # Supabase client initialization
│   └── subjects.js         # Subject constants & config
├── utils/
│   ├── examEngine.js       # Exam building & timer logic
│   └── scoring.js          # Grading & result saving
├── supabase/
│   └── schema.sql          # Database schema + seed data
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Quick Start

### Step 1: Clone & Install

```bash
git clone <your-repo>
cd shiney-brain-cbt
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name and strong database password
3. Wait for project initialization (~2 minutes)

### Step 3: Run Database Schema

1. In Supabase dashboard → **SQL Editor** → **New query**
2. Paste the entire content of `supabase/schema.sql`
3. Click **Run** — this creates tables, RLS policies, and seeds sample questions

### Step 4: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in: **Supabase Dashboard → Settings → API → Project URL & anon public key**

### Step 5: Configure Supabase Auth

In Supabase Dashboard:
1. **Authentication → Settings**
2. Set **Site URL** to `http://localhost:3000` (dev) or your Vercel URL (production)
3. Add to **Redirect URLs**: `http://localhost:3000/**` and `https://your-app.vercel.app/**`
4. Email confirmations: You can **disable** for easier testing (Auth → Settings → Email confirmation)

### Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow prompts. When asked for environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B: GitHub + Vercel Dashboard

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. In **Environment Variables**, add both Supabase variables
4. Click **Deploy**

### Post-Deploy

Update Supabase Auth redirect URLs to include your Vercel URL:
- `https://your-project.vercel.app/**`

---

## 📚 Subjects Supported

| Category   | Subjects |
|------------|---------|
| 🔬 Science | Biology, Chemistry, Physics, Mathematics |
| 📖 Arts    | English Language, Literature in English, Government, CRS, IRS, History, Fine Art |
| 💼 Commercial | Economics, Commerce, Accounting, Marketing, Geography, Civic Education |

---

## ⚙️ Exam Modes

| Mode | Subjects | Questions | Duration |
|------|----------|-----------|----------|
| Single Subject | 1 | 40 | 30 mins |
| JAMB Mock | 4 | 160 (40/subject) | 120 mins |

---

## 📊 Adding More Questions

**Method 1: Supabase Dashboard Table Editor**
1. Go to Supabase → **Table Editor → questions**
2. Click **Insert row**
3. Fill in all fields

**Method 2: SQL**
```sql
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, subject, category)
VALUES ('Your question here?', 'Option A', 'Option B', 'Option C', 'Option D', 'a', 'biology', 'science');
```

**Subject IDs (use exactly these):**
`biology`, `chemistry`, `physics`, `mathematics`, `english`, `literature`, `government`, `crs`, `irs`, `history`, `fine_art`, `economics`, `commerce`, `accounting`, `marketing`, `geography`, `civic_education`

**Category values:** `science`, `arts`, `commercial`

**Correct answer values:** `a`, `b`, `c`, or `d`

---

## 🔒 Security Notes

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose — Supabase RLS policies protect data
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- RLS ensures users can only see/modify their own results
- Questions are readable by all authenticated users (required for exam)

---

## 📈 Scaling Suggestions

### Short Term
- Add question difficulty levels (easy/medium/hard) and filter by difficulty
- Implement subject-wise leaderboard using `results` table
- Add a question reporting system (users flag wrong questions)
- Add a "Pause & Resume" feature using localStorage

### Medium Term
- Admin dashboard at `/admin` with service role key (server component)
- Bulk CSV import for question bank population
- Question categories/topics within subjects (e.g., "Genetics" under Biology)
- Email results using Resend/SendGrid

### Long Term
- AI-generated explanations for wrong answers (Anthropic API)
- Adaptive exam engine (harder questions when performing well)
- Subscription tiers with Stripe
- Native mobile app with React Native / Expo
- Offline support with PWA + IndexedDB

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel
- **Fonts**: Bitter (headings) + DM Sans (body) via Google Fonts

---

## ❓ Troubleshooting

**"Failed to load exam questions"**
→ Make sure you've run `schema.sql` and questions exist for the selected subjects.
→ Check Supabase → Table Editor → questions has rows with matching `subject` values.

**Auth redirect loop**
→ Add your URL to Supabase Auth → Settings → Redirect URLs

**RLS blocking queries**
→ Ensure user is authenticated before fetching questions. Check `supabase.auth.getUser()` returns a valid user.

**Vercel build error**
→ Ensure both env variables are set in Vercel project settings.
