# 04: Note generation API

**What to build:** POST `/api/generate` endpoint that calls Gemini to generate a note, stores it in the database, and returns it.

**Blocked by:** 02 (Database schema)

**Status:** ready-for-agent

- [ ] Create `src/app/api/generate/route.ts`
- [ ] Accept POST with `{ topic: string }` body
- [ ] Call Gemini API with the note generation prompt
- [ ] Parse AI response into structured content (intro, keyConcepts, howItWorks, example, summary)
- [ ] Store note in PostgreSQL via Prisma
- [ ] Return the generated note as JSON
- [ ] Handle errors gracefully (AI failure, DB failure)
