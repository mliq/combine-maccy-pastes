# 0001. Use Node.js for the CLI implementation

- Status: accepted
- Date: 2026-03-11

## Context

`combine-maccy-pastes` is a small local utility that needs to:

- query a SQLite database
- decode UTF-8 and UTF-16 clipboard payloads
- write files and optionally copy results back to the macOS clipboard
- stay easy to package, test, and publish on GitHub

Possible implementation choices included shell, Node.js, and Python.

## Decision

Use Node.js for the current implementation.

## Consequences

Positive:

- good fit for a single-file cross-machine CLI
- straightforward file handling and string processing
- easy packaging through `package.json` and a `bin` entry
- built-in test runner is sufficient for this repo

Negative:

- depends on Node.js being available
- still relies on the external `sqlite3` command instead of a library
- Python would also have been a strong fit for this kind of utility

## Notes

This decision can be revisited later if the project grows and would benefit from a Python rewrite or from removing the `sqlite3` shell dependency.
