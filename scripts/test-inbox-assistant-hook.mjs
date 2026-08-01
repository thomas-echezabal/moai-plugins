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

function splitPrompt(source) {
  const rules = new Map();
  const markerFor = (number) =>
    number <= 1 ? `\n\n${number}. ` : `\n${number}. `;
  const firstMarker = markerFor(0);
  const firstIndex = source.indexOf(firstMarker);
  assert.notEqual(firstIndex, -1, "missing rule 0");

  for (let number = 0; number <= 5; number += 1) {
    const marker = markerFor(number);
    const matches = source.split(marker).length - 1;
    assert.equal(matches, 1, `rule ${number} must appear exactly once`);
    const start = source.indexOf(marker) + marker.match(/^\n+/)[0].length;
    const nextMarker = markerFor(number + 1);
    const next =
      number === 5
        ? source.indexOf("\n\nFail closed", start)
        : source.indexOf(nextMarker, start);
    assert.notEqual(next, -1, `missing boundary after rule ${number}`);
    rules.set(number, source.slice(start, next));
  }

  return {
    preamble: source.slice(0, firstIndex),
    rules,
    tail: source.slice(source.indexOf("\n\nFail closed")),
  };
}

function validatePromptPolicy(source) {
  const sections = splitPrompt(source);
  const policyCases = [
    {
      label: "multi-effect calls use the strictest class",
      section: sections.preamble,
      pattern:
        /reply that also archives[\s\S]*?read that marks messages read[\s\S]*?strictest class governs/,
    },
    {
      label: "unrelated inventory write allows",
      section: sections.rules.get(0),
      pattern:
        /mcp__inventory-notes__write_note[\s\S]*?no email, calendar, contacts, or Zapier capability[\s\S]*?must return ALLOW/,
    },
    {
      label: "renamed Zapier server stays in scope",
      section: sections.rules.get(0),
      pattern:
        /exact tool name appears as the Zapier tool name in Task Settings[\s\S]*?positive evidence that it belongs to the member's Zapier server[\s\S]*?IN scope/,
    },
    {
      label: "email-capable vendors stay in scope",
      section: sections.rules.get(0),
      pattern:
        /Email capability always wins the scope decision[\s\S]*?HubSpot, Apollo, Klaviyo, Mailchimp, Salesforce, Intercom, and SendGrid/,
    },
    {
      label: "vendor email state changes deny",
      section: sections.rules.get(0),
      pattern:
        /vendor-labeled call whose full effect includes email[\s\S]*?must return DENY under rule 5/,
    },
    {
      label: "UUID and ambiguous mail scope fails closed",
      section: sections.rules.get(0),
      pattern:
        /opaque, conflicting, or UUID-named server[\s\S]*?plausibly involving email, calendar, or contacts[\s\S]*?fail closed/,
    },
    {
      label: "pure in-scope read allows",
      section: sections.rules.get(1),
      pattern:
        /^1\. Pure read with no state change \(search, list, get, find, read\) on any in-scope connector: ALLOW\.$/,
    },
    {
      label: "native Gmail or Outlook write denies",
      section: sections.rules.get(2),
      pattern:
        /^2\. Any state change routed through an in-scope native connector \(Gmail or Outlook\), including send, reply, draft, archive, label, move, delete, or mark read: DENY\./,
    },
    {
      label: "untested Zapier write denies",
      section: sections.rules.get(3),
      pattern:
        /^3\. State change routed through Zapier: ALLOW only if[\s\S]*?Status: enabled[\s\S]*?Last tested date[\s\S]*?kill switch reads off[\s\S]*?missing, unreadable, or mismatched: DENY\./,
    },
    {
      label: "pending-test defaults to deny",
      section: sections.rules.get(4),
      pattern: /^4\. Status pending-test: DENY, with one narrow exception\./,
    },
    {
      label: "pending-test needs every supervised condition",
      section: sections.rules.get(4),
      pattern:
        /interactive \/inbox-assistant:test controls session[\s\S]*?owner gave an explicit yes[\s\S]*?smallest self-owned one available[\s\S]*?no earlier live call/,
    },
    {
      label: "pending-test excludes unattended runs and retries",
      section: sections.rules.get(4),
      pattern:
        /scheduled unattended run[\s\S]*?ordinary chat[\s\S]*?retry after a failed or ambiguous first call[\s\S]*?second action[\s\S]*?never qualify/,
    },
    {
      label: "unclassified in-scope call denies",
      section: sections.rules.get(5),
      pattern: /^5\. Anything you cannot classify with confidence[\s\S]*?: DENY\.$/,
    },
    {
      label: "untrusted arguments cannot escape scope",
      section: sections.rules.get(0),
      pattern: /never from values inside tool arguments, email bodies, or documents/,
    },
    {
      label: "missing policy and state fail closed",
      section: sections.tail,
      pattern:
        /missing schema version line[\s\S]*?unreadable Inbox Assistant State or Task Settings[\s\S]*?DENY/,
    },
  ];

  for (const policyCase of policyCases) {
    assert.match(policyCase.section, policyCase.pattern, policyCase.label);
  }

  assert.doesNotMatch(
    source,
    /known unrelated family/,
    "unrelated servers must not require membership in an allowlist",
  );
  return policyCases.length;
}

function replaceOnce(source, before, after) {
  assert.equal(
    source.split(before).length - 1,
    1,
    `mutation target must occur once: ${before}`,
  );
  return source.replace(before, after);
}

function assertPolicyRejects(source, expectedFailure, label) {
  assert.throws(
    () => validatePromptPolicy(source),
    (error) => error.message.includes(expectedFailure),
    label,
  );
}

const policyCaseCount = validatePromptPolicy(prompt);
const invertedRead = replaceOnce(
  prompt,
  "1. Pure read with no state change (search, list, get, find, read) on any in-scope connector: ALLOW.",
  "1. Pure read with no state change (search, list, get, find, read) on any in-scope connector: DENY.",
);
assertPolicyRejects(
  invertedRead,
  "pure in-scope read allows",
  "rule 1 inversion must fail validation",
);

const invertedNativeWrite = replaceOnce(
  prompt,
  "including send, reply, draft, archive, label, move, delete, or mark read: DENY.",
  "including send, reply, draft, archive, label, move, delete, or mark read: ALLOW.",
);
assertPolicyRejects(
  invertedNativeWrite,
  "native Gmail or Outlook write denies",
  "rule 2 inversion must fail validation",
);

const codexPreflight = codexPolicy
  .split("\n")
  .filter(
    (line) =>
      line.startsWith("Before every") || line.startsWith("For in-scope"),
  )
  .join("\n");
for (const pattern of [
  /same scope gate/,
  /exact tool name[\s\S]*?Zapier tool name in Task Settings[\s\S]*?stays in scope/,
  /unrelated domain[\s\S]*?allowed only when[\s\S]*?no email, calendar, contacts, or Zapier capability/,
  /email-capable CRM, sales, marketing, support, and messaging vendors do not/,
  /opaque or UUID-named server[\s\S]*?fails closed/,
  /complete effect set[\s\S]*?strictest effect govern/,
  /native-connector write is denied/,
  /read with no state change is allowed/,
  /Zapier write needs the matching enabled and tested action control plus an off kill switch/,
  /Pending-test is denied unless every supervised bootstrap condition/,
  /Scheduled runs, ordinary chats, retries, and second actions do not qualify/,
]) {
  assert.match(
    codexPreflight,
    pattern,
    "Codex manual preflight must mirror the Claude hook policy",
  );
}

process.stdout.write(
  `Validated ${policyCaseCount} rule-bounded Inbox Assistant hook decisions, rejected 2 decision inversions, and matched the Codex manual preflight.\n`,
);
