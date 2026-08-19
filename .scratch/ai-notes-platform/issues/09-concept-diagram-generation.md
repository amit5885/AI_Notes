# 09: Concept diagram generation

**What to build:** AI generates a concept diagram (flowchart, visual model) for the "How It Works" section of each note.

**Blocked by:** 04 (Note generation API)

**Status:** ready-for-agent

- [ ] Call Gemini image generation (or DALL-E fallback) after text generation
- [ ] Prompt for educational diagrams (flowcharts, process diagrams, not illustrations)
- [ ] Store image URL in Note.diagramUrl
- [ ] Display diagram in "How It Works" section of note page
- [ ] Handle image generation failures gracefully (note still works without diagram)
