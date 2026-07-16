# Setup Guide — do these in order

Everything here is free tier. Total time: ~1 hour the first time, mostly waiting for
Meta's Instagram verification. You'll create 4 accounts and copy some keys into one file.

## 0. What you're setting up
- **Supabase** — free database that stores each day's digest + quiz
- **Google Gemini API** — the AI that writes the notes, quiz, and Instagram caption (free tier)
- **Vercel** — free hosting for the website (and where the automation actually runs)
- **GitHub** — free, just triggers the automation once a day (the "alarm clock")
- **Meta/Instagram Graph API** — lets the automation publish to Instagram

---

## 1. Supabase (database) — 10 min
1. Go to supabase.com -> New project (free tier). Pick any region close to India.
2. Once it's created: left sidebar -> **SQL Editor** -> New query.
3. Paste the entire contents of `supabase/schema.sql` from this project -> Run.
4. Left sidebar -> **Project Settings -> API**. Copy three values, you'll need them soon:
   - `Project URL` -> this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key -> this is `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret, never put it in frontend code — this project already keeps it server-only for you)

## 2. Google Gemini API key — 2 min (free, no billing)
1. Go to **aistudio.google.com/apikey** (sign in with your Google account).
2. Click **Create API key**. Copy it -> this is `GEMINI_API_KEY`.
3. That's it — no credit card, no billing setup. This project uses a small fraction
   of Google's free daily allowance, so it stays free indefinitely at this volume.

## 3. Put this project on GitHub — 5 min
1. Create a new empty repo on github.com (e.g. `exam-brief`).
2. In this project folder on your computer:
   ```
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/exam-brief.git
   git push -u origin main
   ```

## 4. Deploy to Vercel — 5 min
1. Go to vercel.com -> New Project -> Import the GitHub repo you just pushed.
2. Before deploying, click **Environment Variables** and add everything from `.env.example`
   EXCEPT `NEXT_PUBLIC_SITE_URL` and the Instagram ones (add those after, see steps below).
3. Deploy. Vercel gives you a URL like `https://exam-brief-yourname.vercel.app`.
4. Go back to Vercel -> Settings -> Environment Variables -> add
   `NEXT_PUBLIC_SITE_URL = https://exam-brief-yourname.vercel.app` (no trailing slash)
   -> Redeploy (Deployments tab -> ... -> Redeploy) so it picks up the new value.
5. Also generate a random string (e.g. from a password generator) and add it as
   `CRON_SECRET`. Remember what you put — you need it again in step 6.

## 5. Instagram Graph API — 20-30 min (the fiddly part)
Instagram posting requires a **Business or Creator account** linked to a **Facebook Page**.
1. If you haven't already: open Instagram app -> Settings -> Account -> switch to
   Professional account -> Business.
2. Go to facebook.com -> create a Facebook Page (any name, e.g. your brand name) if you
   don't have one, and link your Instagram Business account to it:
   Instagram app -> Settings -> Business tools -> connect to Facebook Page.
3. Go to developers.facebook.com -> My Apps -> Create App -> type "Other" -> "Business".
4. In the app dashboard, add the **Instagram Graph API** product.
5. Go to Tools -> Graph API Explorer:
   - Select your app, select your Facebook Page, and generate a **User Access Token**
     with these permissions: `instagram_basic`, `instagram_content_publish`,
     `pages_show_list`, `pages_read_engagement`.
   - Run this query to find your Instagram Business Account ID:
     `GET /me/accounts` -> copy the Page ID -> then
     `GET /{page-id}?fields=instagram_business_account` -> copy that ID.
     That ID is your `IG_BUSINESS_ID`.
6. The token from Graph API Explorer expires in ~1 hour. For a long-lived token
   (~60 days, auto-renewable), follow Meta's guide:
   https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
   That long-lived token is your `IG_ACCESS_TOKEN`.
7. Add both to Vercel's environment variables -> Redeploy.

   **Note:** long-lived tokens still expire after ~60 days and need refreshing. Once this
   is working end to end, ask me and I'll add a small refresh script — it's a 10-line
   addition, just skipped for now so you can get the core system running first.

## 6. Turn on the daily alarm clock (GitHub Actions) — 5 min
1. In your GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret:
   - `SITE_URL` = your Vercel URL (same as `NEXT_PUBLIC_SITE_URL`, no trailing slash)
   - `CRON_SECRET` = the same random string you put in Vercel
2. That's it — `.github/workflows/daily-automation.yml` is already in the repo and will
   run automatically every day at 07:00 IST.
3. To test right now without waiting: GitHub repo -> Actions tab -> "Daily automation"
   workflow -> Run workflow (the `workflow_dispatch` button).

## 7. Verify it worked
1. GitHub -> Actions tab -> click the run -> check the log for `HTTP status: 200`.
2. Visit your Vercel site — today's digest should be on the homepage.
3. Check Instagram — a new post should appear (skip this if you haven't finished step 5 yet;
   the website/quiz will still work fine without Instagram connected).
4. In Supabase -> Table Editor -> `run_logs` table shows exactly what happened each run,
   useful for debugging if something fails silently.

## Common issues
- **"No news items collected"**: an RSS feed URL changed. Open `lib/sources.js`,
  test each URL in your browser, replace any that 404.
- **Instagram publish fails**: almost always the access token expired (they're short-lived
  by default) — regenerate per step 5.6.
- **Quiz JSON parse error**: very rare, means the AI didn't return clean JSON — the run_logs
  table will show the raw error; just re-run the workflow manually, it'll work on retry.
