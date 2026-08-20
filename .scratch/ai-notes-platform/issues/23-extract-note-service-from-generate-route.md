# 23: Extract NoteService from generate route

**What to build:** A deep `NoteService` module that owns the full generation pipeline (expansion → cache → generation → persistence → diagram), reducing the generate route to a thin HTTP adapter. Also extract `parseJsonFromLLMText` as a reusable utility.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Create `src/lib/llm-response.ts` with `parseJsonFromLLMText()` utility
- [x] Write tests for `parseJsonFromLLMText`
- [x] Create `src/lib/note-service.ts` with `createNoteService(genAI, prisma)` factory
- [x] Write tests for NoteService
- [x] Refactor `src/app/api/generate/route.ts` to use NoteService
- [x] Update generate route tests
- [x] Verify all tests pass and typecheck is clean

**Decisions (from grilling):**
- Scope: Full pipeline (expansion → cache → generation → persistence → diagram)
- Interface: `generate(rawTopic: string): Promise<NoteData>`
- Errors: Typed errors (`ExpansionError`, `ParseError`, `SafetyBlockError`)
- Dependencies: Factory function `createNoteService(genAI, prisma)`
- Prompts: Private inside NoteService
- Diagram: Sequential (after note generation)
- Cache hit: Uniform `NoteData` return (no `fromCache` flag)
