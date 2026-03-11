#!/usr/bin/env node

const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

function printUsage() {
  console.log(`Usage:
  node combine-maccy-pastes.js [count] [output.md] [--copy] [--db FILE]

Examples:
  node combine-maccy-pastes.js
  node combine-maccy-pastes.js 25
  node combine-maccy-pastes.js 25 notes.md
  node combine-maccy-pastes.js notes.md
`);
}

function parseArgs(argv) {
  const options = {
    count: 10,
    output: "combined.md",
    copy: false,
    db: null,
  };
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--copy") {
      options.copy = true;
    } else if (arg === "--db") {
      options.db = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      positionals.push(arg);
    }
  }

  if (positionals.length > 2) {
    throw new Error("Too many positional arguments");
  }

  if (positionals.length === 1) {
    if (/^\d+$/.test(positionals[0])) {
      options.count = Number(positionals[0]);
    } else {
      options.output = positionals[0];
    }
  }

  if (positionals.length === 2) {
    if (!/^\d+$/.test(positionals[0])) {
      throw new Error("When passing two positional arguments, the first must be the paste count");
    }
    options.count = Number(positionals[0]);
    options.output = positionals[1];
  }

  if (!Number.isInteger(options.count) || options.count <= 0) {
    throw new Error("--count must be a positive integer");
  }

  return options;
}

function resolveDbPath(explicitDbPath) {
  if (explicitDbPath) {
    return path.resolve(explicitDbPath);
  }

  const candidates = [
    path.join(
      os.homedir(),
      "Library",
      "Containers",
      "org.p0deje.Maccy",
      "Data",
      "Library",
      "Application Support",
      "Maccy",
      "Storage.sqlite",
    ),
    path.join(process.cwd(), "Storage.sqlite"),
    path.join(__dirname, "Storage.sqlite"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    "Could not find Storage.sqlite automatically. Pass --db /path/to/Storage.sqlite.",
  );
}

function runSqlite(dbPath, sql) {
  const raw = execFileSync("sqlite3", ["-json", dbPath, sql], { encoding: "utf8" });
  return JSON.parse(raw);
}

function decodeValue(type, valueHex) {
  if (!valueHex) return null;
  const buf = Buffer.from(valueHex, "hex");

  if (type === "public.utf16-external-plain-text") {
    if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
      return buf.subarray(2).toString("utf16le").replace(/\u0000+$/g, "");
    }
    if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
      const swapped = Buffer.allocUnsafe(buf.length - 2);
      for (let i = 2; i < buf.length; i += 2) {
        swapped[i - 2] = buf[i + 1] ?? 0;
        swapped[i - 1] = buf[i];
      }
      return swapped.toString("utf16le").replace(/\u0000+$/g, "");
    }
    return buf.toString("utf16le").replace(/\u0000+$/g, "");
  }

  return buf.toString("utf8").replace(/\u0000+$/g, "");
}

function loadItems(dbPath, count) {
  const sql = `
WITH last AS (
  SELECT Z_PK, ZLASTCOPIEDAT, ZTITLE
  FROM ZHISTORYITEM
  ORDER BY ZLASTCOPIEDAT DESC
  LIMIT ${count}
)
SELECT
  l.Z_PK AS id,
  l.ZTITLE AS title,
  c.ZTYPE AS type,
  hex(c.ZVALUE) AS valueHex
FROM last l
LEFT JOIN ZHISTORYITEMCONTENT c ON c.ZITEM = l.Z_PK
ORDER BY l.ZLASTCOPIEDAT DESC, c.ZTYPE;
`;

  const rows = runSqlite(dbPath, sql);
  const byId = new Map();

  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        title: row.title || "",
        text: null,
        imageTypes: [],
      });
    }

    const item = byId.get(row.id);
    const decoded = decodeValue(row.type, row.valueHex);
    if (row.type === "public.utf8-plain-text" || row.type === "public.utf16-external-plain-text") {
      if (!item.text) item.text = decoded;
    } else if (isImageType(row.type)) {
      item.imageTypes.push(row.type);
    }
  }

  return Array.from(byId.values());
}

function normalizeBody(item) {
  const body = item.text || item.title || "";
  return body.replace(/\r/g, "\n").trim();
}

function isImageType(type) {
  if (!type) return false;
  return /image|png|jpe?g|gif|tiff|bmp|webp|heic|heif|svg/i.test(type);
}

function toMarkdown(items) {
  const blocks = [];
  for (const item of items) {
    if (item.imageTypes.length > 0 && !item.text) continue;

    const body = normalizeBody(item);
    if (!body) continue;
    blocks.push(body);
  }
  return blocks.join("\n\n").trimEnd() + "\n";
}

function writeOutput(text, options) {
  if (options.output === "-") {
    process.stdout.write(text);
  } else {
    fs.writeFileSync(options.output, text);
  }

  if (options.copy) {
    const result = spawnSync("pbcopy", { input: text, encoding: "utf8" });
    if (result.status !== 0) {
      throw new Error(result.stderr || "pbcopy failed");
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const dbPath = resolveDbPath(options.db);
  const items = loadItems(dbPath, options.count);
  const rendered = toMarkdown(items);

  writeOutput(rendered, options);

  const destination = options.output === "-" ? "stdout" : path.resolve(options.output);
  console.error(`Combined ${items.length} pastes into markdown (${destination})${options.copy ? " and copied to clipboard" : ""}.`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
