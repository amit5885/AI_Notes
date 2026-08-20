# 18: Unify slug normalization logic

**What to build:** A single slug normalization function used by both client and server, ensuring consistent URL generation and database lookups.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Create `src/lib/slug.ts` with shared `normalizeSlug()` function
- [x] Update `src/components/SearchBar.tsx` to use shared slug function
- [x] Update `src/components/TrendingTopics.tsx` to use shared slug function
- [x] Update `src/app/api/generate/route.ts` to use shared slug function
- [x] Update `src/lib/export-utils.ts` and `src/components/ExportButtons.tsx` to use shared slug
- [x] Add tests for slug normalization edge cases
- [x] Verify all tests pass and typecheck is clean
