# 0001: PostgreSQL for Storage

## Status

Accepted

## Context

The platform needs to store generated notes for caching and reuse. Options considered:

- JSON files on disk (simplest, no DB)
- SQLite (lightweight, embedded)
- PostgreSQL (full relational DB)

## Decision

Use PostgreSQL.

## Consequences

- Requires a running database service (not embedded)
- Supports full-text search natively (useful for topic lookup)
- Easy to add user accounts later (v2)
- JSON column type for note body keeps schema flexible
- Free tiers available (Supabase, Neon, Railway)
