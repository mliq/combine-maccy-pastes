const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");
const scriptPath = path.join(repoRoot, "combine-maccy-pastes.js");

function utf16Hex(text) {
  return Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]).toString("hex");
}

function utf8Hex(text) {
  return Buffer.from(text, "utf8").toString("hex");
}

function createFixtureDb(dbPath) {
  const sql = `
CREATE TABLE ZHISTORYITEM (
  Z_PK INTEGER PRIMARY KEY,
  Z_ENT INTEGER,
  Z_OPT INTEGER,
  ZNUMBEROFCOPIES INTEGER,
  ZFIRSTCOPIEDAT TIMESTAMP,
  ZLASTCOPIEDAT TIMESTAMP,
  ZPIN VARCHAR,
  ZTITLE VARCHAR,
  ZAPPLICATION VARCHAR
);
CREATE TABLE ZHISTORYITEMCONTENT (
  Z_PK INTEGER PRIMARY KEY,
  Z_ENT INTEGER,
  Z_OPT INTEGER,
  ZITEM INTEGER,
  ZTYPE VARCHAR,
  ZVALUE BLOB
);

INSERT INTO ZHISTORYITEM (Z_PK, ZLASTCOPIEDAT, ZTITLE) VALUES
  (1, 400, 'Newest text title'),
  (2, 300, 'file:///tmp/finder-item'),
  (3, 200, 'image item'),
  (4, 100, 'Older utf16 title');

INSERT INTO ZHISTORYITEMCONTENT (Z_PK, ZITEM, ZTYPE, ZVALUE) VALUES
  (1, 1, 'public.utf8-plain-text', x'${utf8Hex("Newest text")}'),
  (2, 2, 'public.file-url', x'${utf8Hex("file:///tmp/finder-item")}'),
  (3, 2, 'public.utf16-external-plain-text', x'${utf16Hex("finder-item")}'),
  (4, 3, 'public.png', x'89504e470d0a1a0a'),
  (5, 4, 'public.utf16-external-plain-text', x'${utf16Hex("Older utf16")}');
`;

  const result = spawnSync("sqlite3", [dbPath], {
    encoding: "utf8",
    input: sql,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "Failed to create fixture database");
  }
}

function runCli(args, options = {}) {
  const result = spawnSync("node", [scriptPath, ...args], {
    encoding: "utf8",
    cwd: options.cwd,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "CLI invocation failed");
  }

  return result;
}

test("writes combined.md by default with the last 10 pastes", async () => {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "combine-maccy-pastes-"));
  const dbPath = path.join(tempDir, "fixture.sqlite");
  createFixtureDb(dbPath);

  runCli(["--db", dbPath], { cwd: tempDir });
  const output = await fs.promises.readFile(path.join(tempDir, "combined.md"), "utf8");
  assert.equal(output, "Newest text\n\nfinder-item\n\nOlder utf16\n");
});

test("supports positional count and output arguments", async () => {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "combine-maccy-pastes-"));
  const dbPath = path.join(tempDir, "fixture.sqlite");
  createFixtureDb(dbPath);

  const outputPath = path.join(tempDir, "notes.md");
  runCli(["2", outputPath, "--db", dbPath], { cwd: tempDir });
  const output = await fs.promises.readFile(outputPath, "utf8");
  assert.equal(output, "Newest text\n\nfinder-item\n");
});

test("auto-detects a database next to the script", async () => {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "combine-maccy-pastes-"));
  const dbPath = path.join(tempDir, "Storage.sqlite");
  const tempScriptPath = path.join(tempDir, "combine-maccy-pastes.js");
  const tempHome = path.join(tempDir, "home");
  const runDir = path.join(tempDir, "elsewhere");

  createFixtureDb(dbPath);
  await fs.promises.copyFile(scriptPath, tempScriptPath);
  await fs.promises.mkdir(tempHome);
  await fs.promises.mkdir(runDir);

  const outputPath = path.join(tempDir, "combined.md");
  const result = spawnSync("node", [tempScriptPath, "2", outputPath], {
    encoding: "utf8",
    cwd: runDir,
    env: { ...process.env, HOME: tempHome },
  });

  assert.equal(result.status, 0, result.stderr);
  const output = await fs.promises.readFile(outputPath, "utf8");
  assert.equal(output, "Newest text\n\nfinder-item\n");
});
