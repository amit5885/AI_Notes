# 04: Note generation API

**What to build:** POST `/api/generate` endpoint that calls Gemini to generate a note, stores it in the database, and returns it.

**Blocked by:** 02 (Database schema)

**Status:** done

- [x] Create `src/app/api/generate/route.ts`
- [x] Accept POST with `{ topic: string }` body
- [x] Call Gemini API with the note generation prompt
- [x] Parse AI response into structured content (intro, keyConcepts, howItWorks, example, summary)
- [x] Store note in PostgreSQL via Prisma
- [x] Return the generated note as JSON
- [x] Handle errors gracefully (AI failure, DB failure)
