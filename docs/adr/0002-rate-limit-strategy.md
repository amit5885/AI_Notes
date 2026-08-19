# 0002: Rate Limit Strategy

## Status

Accepted

## Context

Without limits, students could spam requests or accidentally trigger cost spikes via repeated generation.

## Decision

Rate limit to 20 requests per hour per IP address.

## Consequences

- Prevents abuse without punishing normal use
- IP-based is simple; no auth required for v1
- Can tighten or loosen based on observed usage
- Returns 429 status with friendly message when exceeded
