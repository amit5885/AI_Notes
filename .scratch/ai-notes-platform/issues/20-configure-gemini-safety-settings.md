# 20: Configure Gemini safety settings

**What to build:** Explicit Gemini API safety settings configured on the model, providing AI-level content filtering as required by the spec.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Add safety settings to `createGeminiClient()` or model configuration
- [x] Configure block thresholds for harassment, hate speech, sexually explicit, and dangerous content
- [x] Handle safety block responses gracefully (return friendly error)
- [x] Add tests for safety setting configuration
- [x] Verify all tests pass and typecheck is clean
