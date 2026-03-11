# 0003. Use fixture-based CLI tests with the Node test runner

- Status: accepted
- Date: 2026-03-11

## Context

This tool is small, but it still has behavior worth protecting:

- decoding UTF-8 and UTF-16 clipboard contents
- skipping image-only entries
- auto-detecting the Maccy database path
- preserving the intended command-line UX

The repo should keep test setup light and avoid unnecessary dependencies.

## Decision

Use the built-in Node test runner with fixture-style SQLite databases created during test execution.

## Consequences

Positive:

- no external test framework dependency
- tests exercise the real CLI, not only internal helpers
- fixture databases keep the cases deterministic and easy to read
- CI setup stays minimal

Negative:

- tests still depend on `sqlite3` being available in the environment
- CLI-level tests are a little less granular than unit tests

## Notes

GitHub Actions runs the same `npm test` command used locally on `macos-latest`.
