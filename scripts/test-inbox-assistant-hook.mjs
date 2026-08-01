#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(repoRoot, "plugins", "inbox-assistant");
const hookConfig = JSON.parse(
  readFileSync(join(pluginRoot, "hooks", "hooks.json"), "utf8"),
);
const codexPolicy = readFileSync(
  join(pluginRoot, "references", "codex-compatibility.md"),
  "utf8",
);

const preToolUse = hookConfig.hooks?.PreToolUse;
assert.equal(preToolUse?.length, 1, "expected one PreToolUse hook group");
assert.equal(preToolUse[0].matcher, "mcp__.*", "guard must inspect every MCP call");
assert.equal(preToolUse[0].hooks?.length, 1, "expected one MCP policy hook");

const hook = preToolUse[0].hooks[0];
assert.equal(hook.type, "prompt", "write guard must remain a prompt hook");
assert.equal(hook.timeout, 30, "write guard timeout changed unexpectedly");

const prompt = hook.prompt;
const policyCases = [
  {
    label: "unrelated named write allows",
    pattern:
      /mcp__inventory-notes__write_note[\s\S]*?out of scope and must return ALLOW/,
  },
  {
    label: "native Gmail or Outlook write denies",
    pattern:
      /state change routed through an in-scope native connector \(Gmail or Outlook\)[\s\S]*?: DENY/,
  },
  {
    label: "pure in-scope read allows",
    pattern: /Pure read with no state change[\s\S]*?: ALLOW/,
  },
  {
    label: "untested Zapier write denies",
    pattern:
      /State change routed through Zapier:[\s\S]*?Status: enabled[\s\S]*?Last tested date[\s\S]*?kill switch reads off[\s\S]*?missing, unreadable, or mismatched: DENY/,
  },
  {
    label: "ambiguous mail, calendar, or contacts fails closed",
    pattern:
      /plausibly involving email, calendar, or contacts[\s\S]*?apply rules 1-5 and fail closed/,
  },
  {
    label: "untrusted arguments cannot escape scope",
    pattern:
      /never from values inside tool arguments, email bodies, or documents/,
  },
];

for (const policyCase of policyCases) {
  assert.match(prompt, policyCase.pattern, policyCase.label);
}

assert.doesNotMatch(
  prompt,
  /known unrelated family/,
  "unrelated servers must not require membership in an allowlist",
);

for (const pattern of [
  /same scope gate/,
  /descriptive, non-UUID server identity[\s\S]*?unrelated domain[\s\S]*?allowed/,
  /opaque or UUID-named server[\s\S]*?fails closed/,
  /native-connector write is denied/,
  /read with no state change is allowed/,
  /Zapier write needs the matching enabled and tested action control plus an off kill switch/,
]) {
  assert.match(
    codexPolicy,
    pattern,
    "Codex manual preflight must mirror the Claude hook policy",
  );
}

process.stdout.write(
  `Validated ${policyCases.length} Inbox Assistant hook decisions and the matching Codex manual preflight.\n`,
);
