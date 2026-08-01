# Creating and releasing MOAI plugins

This is the required workflow for every plugin in the MOAI Git marketplace. It
keeps releases discoverable and updateable in Claude Cowork, Claude Code, and
ChatGPT/Codex without putting a self-updater inside the plugin.

## The distribution contract

1. The Git marketplace is the only supported Claude distribution path. Do not
   create a ZIP release or duplicate the canonical plugin source in another app.
2. Claude's native marketplace updater owns Claude updates. Members enable
   **Auto-update** for MOAI Plugins once; third-party marketplaces default to off.
3. A plugin never checks the network for its own version, edits its installed
   files, blocks a workflow because it is stale, or adds a SessionStart update
   hook. The marketplace can publish updates, but it cannot override an
   individual member's Claude preference or reload an active session.
4. The semantic version in each platform manifest is the release signal. Every
   content change requires a strictly higher version and a matching changelog
   heading. Never put a plugin version in either marketplace catalog.
5. Claude and Codex share one plugin source, but each gets its own manifest and
   update instructions. Claude's Auto-update toggle does not update Codex.

Anthropic documents the toggle and session behavior in
[Discover and install plugins](https://code.claude.com/docs/en/discover-plugins),
the optional managed setting in
[Claude Code settings](https://code.claude.com/docs/en/settings), and the version
signal in
[Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces).

## 1. Scaffold the plugin

From the repository root, run:

```bash
node scripts/new-plugin.mjs <plugin-id> "Display name" "One-sentence description"
```

The plugin ID must be unique kebab-case. The command creates:

```text
plugins/<plugin-id>/
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
├── skills/<plugin-id>/
│   ├── SKILL.md
│   └── agents/openai.yaml
├── CHANGELOG.md
└── README.md
```

It also registers the directory exactly once in both marketplace catalogs. New
plugins always begin at `1.0.0`. Do not hand-create a second entry or add a
`version` field to a marketplace entry.

## 2. Build one cross-platform source

- Put the canonical workflow in `skills/`. Claude commands may delegate to those
  skills, and Codex skill adapters may delegate to Claude command workflows, but
  do not maintain two independent copies of the same instructions.
- Keep `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` names and
  versions synchronized.
- Give every Claude-only connector, hook, scheduled-task API, file API, or agent a
  documented Codex fallback. Missing capabilities fail closed and are reported to
  the user; they are never silently replaced with a weaker action.
- Do not add a self-updater. In particular, do not use SessionStart to fetch a
  version, require network access, rewrite the plugin, or block the user's work.
- Test the real install in both products. A valid manifest is necessary but does
  not prove the workflow loads or behaves correctly.

## 3. Keep the member README complete

The scaffold writes the minimum required member documentation. Preserve and
customize these sections:

- `## Install in Claude Cowork`: repository URL, plugin name, the one-time
  **Auto-update** toggle, installation, and a new-session instruction.
- `## Updates`: third-party auto-update defaults to off; checks happen after
  startup; the active session keeps its loaded version; manual Update plus a new
  session is the recovery path; Claude Code may use `/reload-plugins`.
- `## Install in ChatGPT/Codex`: marketplace add, plugin install, marketplace
  upgrade, reinstall, and start-a-new-task commands.
- Product-specific capability differences and safe fallbacks.
- Migration steps whenever an earlier plugin name, namespace, or ZIP install can
  coexist with the marketplace copy.

Repository validation rejects a plugin README that drops any of the three update
and installation sections or its plugin-specific Codex install command.

## 4. Version every release

Use semantic versioning and update both manifests together:

- Patch: fixes or compatible workflow/instruction improvements.
- Minor: backward-compatible capabilities or workflows.
- Major: incompatible commands, state, setup, or behavior.

Then add `## X.Y.Z` at the top of `CHANGELOG.md`. The release version must be
strictly greater than the comparison branch or commit. Pull requests compare
against their base branch, and branch pushes compare against the immediately
previous commit, so multiple preview releases cannot reuse a version. An update
with unchanged plugin content needs no release; changed plugin content with an
unchanged version will be rejected and may be skipped by Claude.

Rollbacks are forward-only: restore the previous behavior in a new patch version.
Never lower, delete, or reuse a version users may have installed.

## 5. Validate before opening a pull request

Fetch the current release baseline and run:

```bash
git fetch origin main
node scripts/validate-marketplace.mjs --base origin/main
node scripts/test-inbox-assistant-hook.mjs
claude plugin validate . --strict
```

Then install the marketplace and the changed plugin through Codex:

```bash
codex plugin marketplace add "$PWD"
codex plugin add <plugin-id>@moai-plugins
codex plugin list
```

Use a clean Claude/Cowork profile for the Claude install test. For an update test,
install the prior release, publish the higher version on a test branch, enable
Auto-update, restart Claude, allow the background check to finish, and confirm the
new version loads in a new session or after `/reload-plugins` in Claude Code.

For a migration test, use a separate profile with real saved project state. Confirm
there is only one installed copy and that commands, files, settings, connectors,
and scheduled tasks still work.

## 6. Release through a pull request

Every change merges through a pull request. The marketplace validation check must
pass. Do not force-push or delete `main`, and do not bypass the required check.

Before merge, verify:

- The plugin appears exactly once in both catalogs.
- Both manifest versions match and the changelog contains that version.
- No marketplace entry contains a plugin version.
- The member README still covers Claude Auto-update and Codex updates.
- Claude and Codex clean installs pass.
- Update and migration tests pass when the release changes existing behavior or
  state.

## Managed Claude Code organizations

An administrator who controls members' Claude Code managed settings may set
`autoUpdate: true` for the MOAI marketplace in `extraKnownMarketplaces`. That is
an organization deployment option, not a publisher capability and not a promise
we make to individual Cowork members. Individual members still follow the
one-time Auto-update step in the plugin README.
