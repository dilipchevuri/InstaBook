# The Daily Brief — automated UPSC/GS digest, quiz & Instagram poster

Every day, fully automatically:
1. Pulls current-affairs headlines from 7 sources aspirants already rely on (PIB, PRS,
   The Hindu, Down To Earth, Indian Express) — see `lib/sources.js`.
2. Claude turns that into a formatted GS digest (Polity / Economy / IR / Environment /
   Sci-Tech / Society), grouped and exam-angled, plus a 5-question quiz.
3. Publishes the digest to your website (homepage + archive) and the quiz to `/quiz/[date]`.
4. Posts a matching image + caption to your Instagram Business account.
5. Logs every run to a `run_logs` table so failures are visible, not silent.

**Read `SETUP_GUIDE.md` first** — it walks through every account you need to create,
in order, with exact steps. Nothing here needs advanced dev skills, but Instagram's
setup (step 5) is genuinely fiddly — that's Meta's process, not this code's fault.

## Local development
```
npm install
cp .env.example .env.local   # fill in the values from SETUP_GUIDE.md
npm run dev
```
Visit http://localhost:3000. To test the automation locally before deploying:
```
curl -X GET "http://localhost:3000/api/cron/daily" -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Project structure
```
pages/
  index.js          today's digest (homepage)
  archive.js         list of all past digests
  notes/[slug].js     one digest, permalink
  quiz/[slug].js      that day's quiz
  api/cron/daily.js   the automation itself (news -> AI -> DB -> Instagram)
  api/og/[slug].js    generates the Instagram post image
  api/quiz/submit.js  logs quiz results for later analysis
lib/                 all the automation logic (news fetch, Claude calls, IG publish, DB)
components/          website UI pieces
supabase/schema.sql  run this once in Supabase to create the tables
.github/workflows/   the free daily "alarm clock" (GitHub Actions)
```

## Changing the subject focus
This is currently wired for UPSC/GS current affairs. To point it at a different niche
(e.g. school-level, JEE/NEET-style factual updates), edit two files:
- `lib/sources.js` — swap in relevant RSS feeds
- `lib/ai.js` — edit the `system` prompt in `generateDailyNote` to match the new
  subject's structure (headings, tone, depth)
Everything else (website, quiz, Instagram, automation) works unchanged.

## Cost
All free: Vercel (hosting), Supabase (database), GitHub Actions (scheduler), and
Google's Gemini API free tier (content generation) at this project's daily volume.
Realistically **$0/month** unless you scale far beyond one digest a day.
