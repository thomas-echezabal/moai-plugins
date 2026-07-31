## Release summary

<!-- What changed and which plugin versions are included? -->

## Plugin release checklist

- [ ] Every new plugin starts at `1.0.0`; every changed plugin has a strictly
      higher semantic version in both platform manifests.
- [ ] Each changed plugin has a matching `## X.Y.Z` changelog entry.
- [ ] No Claude or Codex marketplace entry contains a plugin `version`.
- [ ] Member documentation retains Claude Auto-update setup, session reload
      behavior, and the separate Codex upgrade/reinstall path.
- [ ] The plugin relies on native marketplace updates and contains no self-updater,
      SessionStart network version check, or stale-version blocker.
- [ ] Claude-specific capabilities have explicit safe Codex fallbacks.
- [ ] `node scripts/validate-marketplace.mjs --base origin/main` passes.
- [ ] `claude plugin validate . --strict` passes.
- [ ] Clean installation and the relevant update/migration paths were tested in
      both Claude and Codex.
