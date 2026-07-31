# Releasing MOAI plugins

Every plugin release goes through a pull request. Direct releases from a working tree are not supported.

The complete maintainer workflow lives in
[`docs/creating-and-releasing-plugins.md`](docs/creating-and-releasing-plugins.md).
Read it before creating or releasing a plugin.

## Update policy

MOAI plugins use the host's native marketplace updater. Never add a network
version check, self-update script, stale-version blocker, or SessionStart update
hook to a plugin.

Claude leaves automatic updates off by default for third-party marketplaces.
Every plugin README must tell members to enable **Auto-update** for MOAI Plugins
once, explain that a running session keeps the version it loaded, and name the
manual recovery path. Publishers cannot override an individual member's toggle.

Codex has a separate marketplace cache and is not affected by Claude's toggle.
Every plugin README must also include the Codex marketplace upgrade, reinstall,
and new-task steps.

## Add a plugin

Run:

```bash
node scripts/new-plugin.mjs <slug> "Display name" "One-sentence description"
```

The scaffold starts at `1.0.0`, creates synchronized Claude and ChatGPT/Codex manifests, adds the plugin to both marketplace catalogs, and creates the required skill, member-facing installation/update README, and changelog. Replace the generated placeholder workflow without removing the README's Claude auto-update or Codex update sections, then validate the whole repository.

## Update a plugin

1. Make the plugin changes.
2. Increase the version in both `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` using semantic versioning. The versions must match.
3. Add a matching `## X.Y.Z` entry at the top of the plugin's `CHANGELOG.md`.
4. Run `node scripts/validate-marketplace.mjs --base origin/main`.
5. Run `claude plugin validate . --strict`.
6. Validate the Codex manifest with the plugin-creator validator and perform an isolated Codex marketplace install.
7. Open a pull request and merge only after the required validation check passes.

Neither marketplace entry may contain a `version`. The two platform manifests are the synchronized version authorities; CI rejects a mismatch.

## Cross-platform contract

- Every plugin directory must contain both platform manifests and one shared `skills/` source.
- Claude-only command files need Codex skill adapters that delegate to those workflows instead of copying them.
- Platform-specific hooks, connectors, task schedulers, file APIs, or agents need an explicit safe fallback. Missing capabilities must be reported, never silently replaced.
- New plugins are not releasable until they install through both Claude and Codex validation in CI.
- Update behavior is platform-owned: Claude uses its native Auto-update toggle;
  Codex uses marketplace upgrade and reinstall. A plugin must not attempt to
  update its own source.

## Roll back a release

Revert the behavior in a new patch release and increase the version. Never lower, reuse, or delete a version that users may already have installed.
