# 60-Second CIO Challenge

A production-ready event-based decision game for CIOs, CTOs, and enterprise leaders.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, React Router
- **Backend**: Supabase (Postgres, Edge Functions, Realtime)

## Project Structure
- `supabase/migrations`: SQL schema and seed questions.
- `supabase/functions`: Edge Functions for game logic and scoring.
- `src/pages`: Mobile-first user pages and large-screen LED display.

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project.
2. Run the SQL migrations in the Supabase SQL Editor:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_seed_questions.sql`
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy create-session
   supabase functions deploy get-current-question
   supabase functions deploy submit-answer
   supabase functions deploy get-result
   supabase functions deploy get-leaderboard
   ```
4. Set Edge Function secrets:
   ```bash
   supabase secrets set SUPABASE_URL=...
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
   ```

### 2. Frontend Setup
1. Copy `.env.example` to `.env` and fill in your Supabase credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run locally:
   ```bash
   npm run dev
   ```

## Key Routes
- `/start/:eventId`: QR code entry and registration.
- `/game/:sessionId`: Interactive game logic with 60s timer.
- `/result/:sessionId`: Personal rank and top 10 leaderboard.
- `/display/:eventId`: Real-time LED screen for events.

## Scoring Logic
- **Base Score**: Strategic answer (100), Good (70), Risky (40), Poor (10).
- **Speed Bonus**:
  - <= 10 seconds: +20
  - <= 25 seconds: +10
- **Leaderboard**: Sorted by highest total score, then lowest total response time.
