# combine-maccy-pastes

Combine the most recent Maccy clipboard entries into a single Markdown document.

This is a small macOS utility for turning a run of clipboard history into one file you can save, share, or feed into another tool.

## Main Use Case

```bash
node combine-maccy-pastes.js
```

That writes the last 10 Maccy pastes into `combined.md` as plain Markdown content blocks, newest first, separated by blank lines.

## Why

Maccy is good at storing lots of clipboard history. It is less convenient when you want to turn the last few copies into one clean document. This script does that without adding headings or metadata to the output by default.

## Features

- Auto-detects the Maccy `Storage.sqlite` database
- Combines the last `N` clipboard entries into one Markdown file
- Skips image-only clipboard entries automatically
- Supports copying the combined result back to the clipboard
- Can skip Finder-style file-copy entries when needed
- Works from any directory as long as it can find the Maccy database

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
node combine-maccy-pastes.js 10 notes.md --skip-files
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
- `-c`, `--count`: Number of recent Maccy items to combine
- `-o`, `--output`: Output Markdown file path
- `--copy`: Copy the combined result to the clipboard with `pbcopy`
- `--skip-files`: Skip file-copy entries such as Finder selections
- `--db`: Use a specific SQLite database path
- `-`: Use `-` as the output path to write to stdout instead of a file
- `-h`, `--help`: Show usage

## Database Detection

If `--db` is not provided, the script looks for `Storage.sqlite` in this order:

1. Next to `combine-maccy-pastes.js`
2. The standard Maccy container path in the current user's home directory
3. The current working directory

## Notes

- This project targets macOS with Maccy.
- File-copy entries may still contain filenames as text unless `--skip-files` is used.
- Image-only clipboard entries are skipped automatically.

## License

MIT
