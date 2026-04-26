# CROSSTRAIN FC — COMPLETE SETUP GUIDE
## From zero to live in under 2 hours

---

## STEP 1 — SUPABASE DATABASE (10 min)

1. Go to **supabase.com** → Login
2. Click **"New Project"**
   - Name: `crosstrain-fc`
   - Password: (make a strong one, save it)
   - Region: **South Asia (Mumbai)**
3. Wait ~2 minutes for project to load
4. In the left sidebar, click **"SQL Editor"**
5. Click **"New Query"**
6. Open the file `supabase-schema.sql` from this folder
7. **Select ALL** the text (Ctrl+A) and **Copy** it
8. **Paste** it into the SQL Editor
9. Click the **"Run"** button (or press Ctrl+Enter)
10. You should see "Success. No rows returned"
11. Click **"Table Editor"** in sidebar — you should see all tables

### Get your Supabase credentials:
1. Click **"Project Settings"** (gear icon, bottom left)
2. Click **"API"**
3. Copy:
   - **Project URL** (looks like: https://xxxx.supabase.co)
   - **anon/public key** (long string starting with eyJ...)
4. Save these — you'll need them in Step 3

---

## STEP 2 — DOWNLOAD THE CODE (2 min)

The code folder `cfc-app` contains everything.

If you need to download it:
1. Zip the entire `cfc-app` folder
2. Download to your computer

---

## STEP 3 — ADD YOUR SUPABASE KEYS (2 min)

1. Open the `cfc-app` folder on your computer
2. Find the file called `.env.local`
3. Open it in any text editor (Notepad, TextEdit, VS Code)
4. Replace the placeholder values:

```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_long_anon_key_here
```

Replace with YOUR actual values from Step 1.

5. Save the file

---

## STEP 4 — DEPLOY TO VERCEL (5 min)

### Option A — Drag and Drop (Easiest):
1. Go to **vercel.com** → Login
2. Click **"Add New Project"**
3. Drag and drop the entire `cfc-app` folder
4. Vercel will detect it's a React app automatically
5. Before clicking Deploy, click **"Environment Variables"**
6. Add these two variables:
   - `REACT_APP_SUPABASE_URL` = your supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your anon key
7. Click **"Deploy"**
8. Wait 2-3 minutes
9. You get a live URL like: `https://cfc-ops.vercel.app`

### Option B — Via GitHub (Better for updates):
1. Create a new repo on **github.com**
2. Upload the `cfc-app` folder contents
3. In Vercel → Import from GitHub
4. Add environment variables
5. Deploy

---

## STEP 5 — TEST YOUR LIVE APP (5 min)

Open your Vercel URL and check:
- [ ] Dashboard loads with real data
- [ ] Can see leads in Pipeline
- [ ] Members list shows
- [ ] Center switcher works
- [ ] Can add a new lead (click + Add Lead)
- [ ] Can move a lead between pipeline stages

---

## WHAT'S LIVE NOW

✅ Ops Dashboard (6 pages, all live data)
✅ Lead Pipeline with status tracking
✅ Follow-up queue with auto-generate
✅ Member management with search
✅ Churn alerts (auto-calculated)
✅ Revenue analytics

---

## WHAT COMES NEXT (After Siddharth approves)

1. Member App (React Native/Expo) — mobile app
2. Razorpay payments integration
3. WhatsApp notifications for follow-ups
4. Google Play submission
5. Custom domain (crosstrainfcapp.com)

---

## NEED HELP?

At any step, just message with:
- What step you're on
- What you see on screen
- Any error messages

I'll fix it immediately.
