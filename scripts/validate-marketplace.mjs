#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
const codexMarketplacePath = join(
  repoRoot,
  ".agents",
  "plugins",
  "marketplace.json",
);
const pluginsRoot = join(repoRoot, "plugins");
const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function fail(message) {
  throw new Error(message);
}

function readJSON(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function compareVersions(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function git(args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function readBaseManifest(base, slug) {
  try {
    return JSON.parse(
      git(["show", `${base}:plugins/${slug}/.claude-plugin/plugin.json`]),
    );
  } catch {
    return null;
  }
}

function pluginChanged(base, slug) {
  try {
    return (
      git(["diff", "--name-only", `${base}...HEAD`, "--", `plugins/${slug}`])
        .length > 0
    );
  } catch {
    return false;
  }
}

if (!existsSync(marketplacePath))
  fail(".claude-plugin/marketplace.json is missing.");
if (!existsSync(codexMarketplacePath))
  fail(".agents/plugins/marketplace.json is missing.");
if (!existsSync(pluginsRoot)) fail("plugins/ is missing.");

const marketplace = readJSON(marketplacePath);
const codexMarketplace = readJSON(codexMarketplacePath);
if (!kebabCase.test(marketplace.name ?? ""))
  fail("Marketplace name must be kebab-case.");
if (!marketplace.owner?.name) fail("Marketplace owner.name is required.");
if (!Array.isArray(marketplace.plugins))
  fail("Marketplace plugins must be an array.");
if (codexMarketplace.name !== marketplace.name)
  fail("Claude and Codex marketplace names must match.");
if (!Array.isArray(codexMarketplace.plugins))
  fail("Codex marketplace plugins must be an array.");

const directories = readdirSync(pluginsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => entry.name)
  .sort();
const entries = [...marketplace.plugins].sort((a, b) =>
  a.name.localeCompare(b.name),
);
const codexEntries = [...codexMarketplace.plugins].sort((a, b) =>
  a.name.localeCompare(b.name),
);
const seenNames = new Set();
const seenSources = new Set();

for (const entry of entries) {
  if (!kebabCase.test(entry.name ?? ""))
    fail(`Plugin name "${entry.name}" must be kebab-case.`);
  if (seenNames.has(entry.name))
    fail(`Plugin name "${entry.name}" appears more than once.`);
  seenNames.add(entry.name);
  if ("version" in entry)
    fail(`Plugin "${entry.name}" duplicates version in marketplace.json.`);

  const expectedSource = `./plugins/${entry.name}`;
  if (entry.source !== expectedSource) {
    fail(`Plugin "${entry.name}" must use source "${expectedSource}".`);
  }
  if (seenSources.has(entry.source))
    fail(`Plugin source "${entry.source}" appears more than once.`);
  seenSources.add(entry.source);

  const pluginRoot = join(repoRoot, entry.source);
  const manifestPath = join(pluginRoot, ".claude-plugin", "plugin.json");
  const codexManifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
  const changelogPath = join(pluginRoot, "CHANGELOG.md");
  const readmePath = join(pluginRoot, "README.md");
  if (!existsSync(manifestPath))
    fail(`Plugin "${entry.name}" is missing its Claude plugin.json.`);
  if (!existsSync(codexManifestPath))
    fail(`Plugin "${entry.name}" is missing its Codex plugin.json.`);
  if (!existsSync(changelogPath))
    fail(`Plugin "${entry.name}" is missing CHANGELOG.md.`);
  if (!existsSync(readmePath))
    fail(`Plugin "${entry.name}" is missing README.md.`);

  const manifest = readJSON(manifestPath);
  const codexManifest = readJSON(codexManifestPath);
  if (manifest.name !== entry.name) {
    fail(
      `Plugin directory "${entry.name}" has manifest name "${manifest.name}".`,
    );
  }
  if (!semver.test(manifest.version ?? "")) {
    fail(`Plugin "${entry.name}" must declare an X.Y.Z semantic version.`);
  }
  if (codexManifest.name !== entry.name) {
    fail(
      `Plugin directory "${entry.name}" has Codex manifest name "${codexManifest.name}".`,
    );
  }
  if (codexManifest.version !== manifest.version) {
    fail(
      `Plugin "${entry.name}" Claude version ${manifest.version} and Codex version ${codexManifest.version} must match.`,
    );
  }
  if (!codexManifest.description || !codexManifest.author?.name) {
    fail(
      `Plugin "${entry.name}" Codex manifest needs description and author.name.`,
    );
  }
  if (codexManifest.skills !== "./skills/") {
    fail(`Plugin "${entry.name}" Codex manifest must discover ./skills/.`);
  }
  const codexInterface = codexManifest.interface;
  for (const field of [
    "displayName",
    "shortDescription",
    "longDescription",
    "developerName",
    "category",
    "defaultPrompt",
  ]) {
    if (!codexInterface?.[field]) {
      fail(`Plugin "${entry.name}" Codex interface.${field} is required.`);
    }
  }
  if (!Array.isArray(codexInterface.capabilities)) {
    fail(
      `Plugin "${entry.name}" Codex interface.capabilities must be an array.`,
    );
  }
  const changelog = readFileSync(changelogPath, "utf8");
  const readme = readFileSync(readmePath, "utf8");
  if (
    !new RegExp(`^## ${manifest.version.replaceAll(".", "\\.")}$`, "m").test(
      changelog,
    )
  ) {
    fail(
      `Plugin "${entry.name}" changelog is missing "## ${manifest.version}".`,
    );
  }

  for (const heading of [
    "## Install in Claude Cowork",
    "## Updates",
    "## Install in ChatGPT/Codex",
  ]) {
    if (!readme.split("\n").includes(heading)) {
      fail(`Plugin "${entry.name}" README is missing "${heading}".`);
    }
  }
  if (!/auto-update/i.test(readme) || !/third-party/i.test(readme)) {
    fail(
      `Plugin "${entry.name}" README must explain that Claude Auto-update is a one-time, third-party marketplace setting.`,
    );
  }
  if (!/current\s+session\s+keeps\s+the\s+version\s+it\s+loaded/i.test(readme)) {
    fail(
      `Plugin "${entry.name}" README must explain that a running Claude session keeps its loaded plugin version.`,
    );
  }
  if (!readme.includes("codex plugin marketplace upgrade moai-plugins")) {
    fail(
      `Plugin "${entry.name}" README must include the Codex marketplace upgrade command.`,
    );
  }
  if (!readme.includes(`codex plugin add ${entry.name}@moai-plugins`)) {
    fail(
      `Plugin "${entry.name}" README must include its Codex install/reinstall command.`,
    );
  }
}

const entryNames = entries.map((entry) => entry.name);
const codexEntryNames = codexEntries.map((entry) => entry.name);
if (JSON.stringify(directories) !== JSON.stringify(entryNames)) {
  fail(
    `Marketplace directories and entries differ. Directories: ${directories.join(", ") || "(none)"}; entries: ${entryNames.join(", ") || "(none)"}.`,
  );
}
if (JSON.stringify(entryNames) !== JSON.stringify(codexEntryNames)) {
  fail(
    `Claude and Codex marketplace entries differ. Claude: ${entryNames.join(", ") || "(none)"}; Codex: ${codexEntryNames.join(", ") || "(none)"}.`,
  );
}

for (const entry of codexEntries) {
  if (!kebabCase.test(entry.name ?? ""))
    fail(`Codex plugin name "${entry.name}" must be kebab-case.`);
  if ("version" in entry)
    fail(`Codex marketplace entry "${entry.name}" must not contain a version.`);
  const expectedPath = `./plugins/${entry.name}`;
  if (entry.source?.source !== "local" || entry.source?.path !== expectedPath) {
    fail(
      `Codex plugin "${entry.name}" must use local source path "${expectedPath}".`,
    );
  }
  if (entry.policy?.installation !== "AVAILABLE") {
    fail(`Codex plugin "${entry.name}" must be AVAILABLE.`);
  }
  if (!new Set(["ON_INSTALL", "ON_USE"]).has(entry.policy?.authentication)) {
    fail(`Codex plugin "${entry.name}" has invalid authentication policy.`);
  }
  if (!entry.category) fail(`Codex plugin "${entry.name}" needs a category.`);
}

const baseIndex = process.argv.indexOf("--base");
const base = baseIndex === -1 ? null : process.argv[baseIndex + 1];
if (baseIndex !== -1 && !base) fail("--base requires a git ref.");

if (base) {
  for (const entry of entries) {
    if (!pluginChanged(base, entry.name)) continue;
    const manifest = readJSON(
      join(repoRoot, entry.source, ".claude-plugin", "plugin.json"),
    );
    const previous = readBaseManifest(base, entry.name);
    if (!previous) {
      if (manifest.version !== "1.0.0") {
        fail(
          `New plugin "${entry.name}" must start at 1.0.0, found ${manifest.version}.`,
        );
      }
      continue;
    }
    if (!semver.test(previous.version ?? "")) {
      fail(
        `Base version for "${entry.name}" is not semantic: ${previous.version}.`,
      );
    }
    if (compareVersions(manifest.version, previous.version) <= 0) {
      fail(
        `Plugin "${entry.name}" changed but version ${manifest.version} is not greater than ${previous.version}.`,
      );
    }
  }
}

process.stdout.write(
  `Validated ${entries.length} dual-platform plugin${entries.length === 1 ? "" : "s"} in the Claude and Codex marketplace catalogs${base ? ` against ${base}` : ""}.\n`,
);
