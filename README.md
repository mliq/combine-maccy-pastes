# combine-maccy-pastes

Combine the most recent Maccy clipboard entries into a single Markdown document.

This is a small macOS utility for turning a run of clipboard history into one file you can save, share, or feed into another tool.

## Main Use Case

```bash
node combine-maccy-pastes.js 25 meeting-notes.md
```

That writes the last 25 Maccy pastes into `meeting-notes.md` as plain Markdown content blocks, newest first, separated by blank lines.

Defaults:

- `node combine-maccy-pastes.js` still uses `10` and `combined.md`

## Why

Maccy is good at storing lots of clipboard history. It is less convenient when you want to turn the last few copies into one clean document. This script does that without adding headings or metadata to the output by default.

## Features

- Auto-detects the Maccy `Storage.sqlite` database
- Combines the last `N` clipboard entries into one Markdown file
- Skips image-only clipboard entries automatically
- Supports copying the combined result back to the clipboard
- Works from any directory as long as it can find the Maccy database
- Captures key implementation decisions in MADRs

## Installation

Clone the repo and run the script with Node.js.

Requirements:

- Node.js
- `sqlite3` available on your `PATH`

## Usage

```bash
node combine-maccy-pastes.js [count] [output.md] [--copy]
```

Examples:

```bash
node combine-maccy-pastes.js
node combine-maccy-pastes.js 25
node combine-maccy-pastes.js 25 meeting-notes.md
node combine-maccy-pastes.js notes.md
node combine-maccy-pastes.js 10 --copy
```

## Sample Session

```bash
$ node combine-maccy-pastes.js 5 notes.md
$ cat notes.md
First copied note

Second copied note

Third copied note
```

## Example Output

If your recent clipboard history is:

```text
First note
Second note
Third note
```

Then:

```bash
node combine-maccy-pastes.js 3 combined.md
```

Produces:

```md
First note

Second note

Third note
```

## Options

- positional `count`: Number of recent Maccy items to combine. Defaults to `10`.
- positional `output.md`: Output Markdown file path. Defaults to `combined.md`.
- `--copy`: Copy the combined result to the clipboard with `pbcopy`
- `--db`: Use a specific SQLite database path
- `-`: Use `-` as the output path to write to stdout instead of a file
- `-h`, `--help`: Show usage

## Database Detection

If `--db` is not provided, the script looks for `Storage.sqlite` in this order:

1. The standard Maccy container path in the current user's home directory
2. The current working directory
3. Next to `combine-maccy-pastes.js` for local/dev setups

## Notes

- This project targets macOS with Maccy.
- Finder file-copy entries are treated like any other text-backed clipboard item.
- Image-only clipboard entries are skipped automatically.

## Decisions

Project decisions are tracked in [docs/adr/README.md](./docs/adr/README.md).

## License

MIT
