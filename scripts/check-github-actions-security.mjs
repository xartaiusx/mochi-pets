import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const workflowsDir = path.resolve(".github", "workflows");
const workflowFiles = readdirSync(workflowsDir)
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort();
const failures = [];
const fullSha = /^[0-9a-f]{40}$/i;

function lineIndent(line) {
  return line.match(/^\s*/)?.[0].length ?? 0;
}

function checkoutDisablesCredentialPersistence(lines, usesIndex) {
  const usesIndent = lineIndent(lines[usesIndex]);

  for (let index = usesIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;
    if (lineIndent(line) < usesIndent || (lineIndent(line) === usesIndent && trimmed.startsWith("uses:"))) {
      break;
    }
    if (/^persist-credentials:\s*false(?:\s+#.*)?$/i.test(trimmed)) return true;
  }

  return false;
}

for (const file of workflowFiles) {
  const relativePath = path.posix.join(".github", "workflows", file);
  const source = readFileSync(path.join(workflowsDir, file), "utf8");
  const lines = source.split(/\r?\n/);

  if (!/^permissions:\s*$/m.test(source)) {
    failures.push(`${relativePath}: missing explicit top-level permissions.`);
  }
  if (/^permissions:\s*(?:write-all|read-all)\s*$/m.test(source)) {
    failures.push(`${relativePath}: broad permissions shorthand is not allowed.`);
  }

  for (const match of source.matchAll(/^\s*([a-z][a-z0-9-]*):\s*write\s*$/gim)) {
    if (!(file === "codeql.yml" && match[1] === "security-events")) {
      failures.push(`${relativePath}: unexpected write permission for ${match[1]}.`);
    }
  }

  lines.forEach((line, index) => {
    const match = line.match(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/i);
    if (!match) return;

    const action = match[1];
    if (action.startsWith("./")) return;

    const atIndex = action.lastIndexOf("@");
    const reference = atIndex >= 0 ? action.slice(atIndex + 1) : "";
    if (!fullSha.test(reference)) {
      failures.push(`${relativePath}:${index + 1}: external action is not pinned to a full commit SHA.`);
    }

    if (action.startsWith("actions/checkout@") && !checkoutDisablesCredentialPersistence(lines, index)) {
      failures.push(`${relativePath}:${index + 1}: checkout must set persist-credentials: false.`);
    }
  });
}

const ciSource = readFileSync(path.join(workflowsDir, "ci.yml"), "utf8");
if (!ciSource.includes("npm run check:github-actions-security")) {
  failures.push(".github/workflows/ci.yml: security guard is not part of CI.");
}

if (failures.length > 0) {
  console.error("GitHub Actions security validation failed.");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`GitHub Actions security validation OK (${workflowFiles.length} workflows).`);
