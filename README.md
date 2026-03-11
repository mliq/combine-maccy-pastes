# combine-maccy-pastes

Combine the most recent Maccy clipboard entries into a single Markdown document.

## Main Use Case

```bash
node combine-maccy-pastes.js -c 10 -o combined.md
```

That writes the last 10 Maccy pastes into `combined.md` as plain Markdown content blocks, newest first, separated by blank lines.

## Features

- Auto-detects the Maccy `Storage.sqlite` database
- Combines the last `N` clipboard entries into one Markdown file
- Skips image-only clipboard entries automatically
- Supports copying the combined result back to the clipboard
- Can skip Finder-style file-copy entries when needed

## Installation

Clone the repo and run the script with Node.js.

Requirements:

- Node.js
- `sqlite3` available on your `PATH`

## Usage

```bash
node combine-maccy-pastes.js -c <count> [-o output.md] [--copy]
```

Examples:

```bash
node combine-maccy-pastes.js -c 10 -o combined.md
node combine-maccy-pastes.js -c 25 -o meeting-notes.md
node combine-maccy-pastes.js -c 10 --copy
node combine-maccy-pastes.js -c 10 --skip-files -o notes.md
```

## Options

- `-c`, `--count`: Number of recent Maccy items to combine
- `-o`, `--output`: Output Markdown file path
- `--copy`: Copy the combined result to the clipboard with `pbcopy`
- `--skip-files`: Skip file-copy entries such as Finder selections
- `--include-meta`: Include timestamps, source URLs, and file URLs above each block
- `--db`: Use a specific SQLite database path
- `-h`, `--help`: Show usage

## Database Detection

If `--db` is not provided, the script looks for `Storage.sqlite` in this order:

1. Next to `combine-maccy-pastes.js`
2. The standard Maccy container path in the current user's home directory
3. The current working directory

## Notes

- File-copy entries may still contain filenames as text unless `--skip-files` is used.
- Browser text copies are included. Source URLs are only emitted with `--include-meta`.

## License

MIT
