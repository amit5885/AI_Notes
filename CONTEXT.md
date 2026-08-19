# Context

## Overview

A web platform where students enter any topic and receive AI-generated study notes with text explanations and concept diagrams.

## Glossary

| Term | Definition |
|------|------------|
| **Topic** | A subject or concept a student wants to learn (e.g., "Photosynthesis", "Binary Search"). Free-form text input. |
| **Note** | Generated study content for a topic. Contains six sections: Title, Introduction, Key Concepts, How It Works (with diagram), Example/Analogy, and Summary. ~500-800 words. |
| **Concept Diagram** | A visual explanation generated alongside text—flowcharts, visual models, or process diagrams. Not decorative illustrations. |
| **Query Expansion** | AI rewrites the student's raw search into a structured prompt before generation. Handles imprecise or colloquial input (e.g., "how plants make food" → "Photosynthesis"). |
| **Cache** | Stored note for a topic, served instantly on repeat requests. Common topics are cached; unique/niche topics generate fresh. |
| **Rate Limit** | IP-based request cap (20/hour) to prevent abuse and cost spikes. |

## Entities

- **NoteRequest** — an incoming student query with IP, timestamp, and topic text.
- **Note** — the generated content, stored with its topic slug, creation timestamp, and structured JSON body.
- **CachedTopic** — a materialized note ready to serve, keyed by normalized topic slug.

## Out of Scope (v1)

- User accounts and authentication
- Search history / bookmarks
- Model switcher (planned for v2)
