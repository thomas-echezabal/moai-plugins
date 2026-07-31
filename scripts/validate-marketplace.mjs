#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
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
if (!existsSync(pluginsRoot)) fail("plugins/ is missing.");

const marketplace = readJSON(marketplacePath);
if (!kebabCase.test(marketplace.name ?? ""))
  fail("Marketplace name must be kebab-case.");
if (!marketplace.owner?.name) fail("Marketplace owner.name is required.");
if (!Array.isArray(marketplace.plugins))
  fail("Marketplace plugins must be an array.");

const directories = readdirSync(pluginsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => entry.name)
  .sort();
const entries = [...marketplace.plugins].sort((a, b) =>
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
  const changelogPath = join(pluginRoot, "CHANGELOG.md");
  const readmePath = join(pluginRoot, "README.md");
  if (!existsSync(manifestPath))
    fail(`Plugin "${entry.name}" is missing plugin.json.`);
  if (!existsSync(changelogPath))
    fail(`Plugin "${entry.name}" is missing CHANGELOG.md.`);
  if (!existsSync(readmePath))
    fail(`Plugin "${entry.name}" is missing README.md.`);

  const manifest = readJSON(manifestPath);
  if (manifest.name !== entry.name) {
    fail(
      `Plugin directory "${entry.name}" has manifest name "${manifest.name}".`,
    );
  }
  if (!semver.test(manifest.version ?? "")) {
    fail(`Plugin "${entry.name}" must declare an X.Y.Z semantic version.`);
  }
  const changelog = readFileSync(changelogPath, "utf8");
  if (
    !new RegExp(`^## ${manifest.version.replaceAll(".", "\\.")}$`, "m").test(
      changelog,
    )
  ) {
    fail(
      `Plugin "${entry.name}" changelog is missing "## ${manifest.version}".`,
    );
  }
}

const entryNames = entries.map((entry) => entry.name);
if (JSON.stringify(directories) !== JSON.stringify(entryNames)) {
  fail(
    `Marketplace directories and entries differ. Directories: ${directories.join(", ") || "(none)"}; entries: ${entryNames.join(", ") || "(none)"}.`,
  );
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
  `Validated ${entries.length} plugin${entries.length === 1 ? "" : "s"} in ${relative(process.cwd(), marketplacePath) || marketplacePath}${base ? ` against ${base}` : ""}.\n`,
);
