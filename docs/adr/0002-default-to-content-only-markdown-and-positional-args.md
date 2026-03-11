# 0002. Default to content-only Markdown output with positional arguments

- Status: accepted
- Date: 2026-03-11

## Context

The main use case for this project is to quickly turn a run of recent Maccy clipboard entries into one clean Markdown file. Earlier versions exposed more switches and output shapes, including a more explicit flag-based invocation.

That made the tool more flexible but also made the primary workflow feel heavier than necessary.

## Decision

Default the tool to:

- content-only Markdown output
- no headings or metadata by default
- positional arguments for `count` and `output`
- sensible defaults of `10` and `combined.md`

Retain only a small set of non-default behavior flags:

- `--copy`
- `--db`

## Consequences

Positive:

- the common case is extremely short to type
- the output matches the core use case without cleanup
- the README and CLI are easier to understand

Negative:

- less discoverable for users who prefer explicit named flags
- narrower interface than earlier revisions

## Notes

Compatibility with removed `-c` and `-o` flags was intentionally dropped to keep the public interface minimal.
