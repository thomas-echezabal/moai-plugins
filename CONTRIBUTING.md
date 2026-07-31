# Releasing MOAI plugins

Every plugin release goes through a pull request. Direct releases from a working tree are not supported.

## Add a plugin

Run:

```bash
node scripts/new-plugin.mjs <slug> "Display name" "One-sentence description"
```

The scaffold starts at `1.0.0`, creates synchronized Claude and ChatGPT/Codex manifests, adds the plugin to both marketplace catalogs, and creates the required skill, README, and changelog. Replace the generated placeholder workflow, then validate the whole repository.

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

## Roll back a release

Revert the behavior in a new patch release and increase the version. Never lower, reuse, or delete a version that users may already have installed.
