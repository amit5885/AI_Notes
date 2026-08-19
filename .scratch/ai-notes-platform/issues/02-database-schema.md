# 02: Database schema

**What to build:** PostgreSQL connected via Prisma with a Note model. Migrations run successfully.

**Blocked by:** 01 (Project scaffolding)

**Status:** done

- [x] Define Note model in `schema.prisma` (id, topic, rawQuery, title, content JSON, diagramUrl, createdAt)
- [x] Add index on `topic` column
- [x] Run `prisma generate` to create client
- [x] Verify types with typecheck and build
