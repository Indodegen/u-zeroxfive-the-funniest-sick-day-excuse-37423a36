import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.txt");
const targetPath = "/output/entry.txt";

let raw: string;
try {
  raw = readFileSync(sourcePath, "utf8");
} catch {
  fail(`could not read ${sourcePath}`);
}

if (raw.includes("\n") || raw.includes("\r")) {
  fail("entry must be exactly one line");
}

if (raw.length < 1 || raw.length > 200) {
  fail(`entry must be 1-200 characters, got ${raw.length}`);
}

if (raw.trim().length === 0) {
  fail("entry must not be only whitespace");
}

// Reject invisible / control characters (C0 controls, DEL, and
// zero-width or otherwise invisible code points) so the entry is
// exactly what a reader sees. U+000A is not listed here because the
// single-line check above already rejects it.
for (const ch of raw) {
  const code = ch.codePointAt(0)!;
  const invisible =
    (code >= 0x00 && code <= 0x1f && code !== 0x0a) ||
    code === 0x7f ||
    code === 0x200b ||
    code === 0x200c ||
    code === 0x200d ||
    code === 0xfeff;
  if (invisible) {
    fail(
      `entry contains an invisible or control character: U+${code
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")}`,
    );
  }
}

mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, raw, "utf8");
