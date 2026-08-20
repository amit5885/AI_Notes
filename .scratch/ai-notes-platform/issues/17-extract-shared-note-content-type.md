# 17: Extract shared NoteContent type

**What to build:** A single `NoteContent` type definition used across all files that reference note structure, eliminating the 4 duplicated interface definitions.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Create `src/types/note.ts` with shared `NoteContent`, `NoteData`, and `NoteExport` interfaces
- [x] Update `src/app/api/generate/route.ts` to import from shared type
- [x] Update `src/app/notes/[topic]/page.tsx` to import from shared type
- [x] Update `src/components/ExportButtons.tsx` to import from shared type
- [x] Update `src/lib/export-utils.ts` to import from shared type
- [x] Verify all tests pass and typecheck is clean
