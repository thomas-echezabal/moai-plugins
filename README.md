# MOAI Plugins

The official Mother of AI plugin marketplace for Claude Cowork and ChatGPT/Codex. Every release carries both platform manifests, shares one plugin source, and is install-tested through both CLIs.

## Add the marketplace in Cowork

1. Open **Cowork**, then open **Customize** → **Plugins**.
2. In **Personal plugins**, select **+** → **Add marketplace**.
3. Choose **Add from a repository** and enter:

   `https://github.com/thomas-echezabal/moai-plugins`

4. Open **MOAI Plugins** and turn on its **Auto-update** toggle. Claude leaves
   automatic updates off by default for third-party marketplaces, so this is a
   one-time setup step.
5. Install the plugin you want, then start a new Cowork session so it loads.

## Add the marketplace in ChatGPT/Codex

From Codex CLI, add the Git marketplace and install Inbox Assistant:

```bash
codex plugin marketplace add thomas-echezabal/moai-plugins
codex plugin add inbox-assistant@moai-plugins
```

Then start a new Codex task so its skills load. In the Codex app, the same marketplace entry appears as **MOAI Plugins**. ChatGPT/Codex users can invoke the six workflows by intent or select the corresponding `$inbox-assistant-*` skill; typing the familiar `/inbox-assistant:setup` text also routes to the setup skill.

Before this release reaches `main`, administrators can test the staged build with `codex plugin marketplace add thomas-echezabal/moai-plugins --ref preview`.

## Inbox Assistant

Inbox Assistant reads your email, prepares a morning brief, finds stalled follow-ups, and writes replies as drafts. Every mailbox action starts switched off and must be enabled and tested individually.

After installation, run `/inbox-assistant:setup` in a Cowork session to set it up, or `/inbox-assistant:status` if you are moving an existing installation.

### Moving from the downloaded plugin

If you previously installed Inbox Assistant by uploading a file:

1. Open **Customize** → **Plugins** and uninstall the uploaded Inbox Assistant.
2. Add this marketplace using the steps above.
3. Install **Inbox Assistant** from MOAI Plugins.
4. Start a new Cowork session and run `/inbox-assistant:status`.

The marketplace version uses the same plugin name, command namespace, and workspace files. Do not leave both copies installed.

## Updates

Claude's native marketplace updater is the supported update path. Do not install a
separate updater or a SessionStart version-check hook. Once **Auto-update** is on
for MOAI Plugins, Claude checks the marketplace after startup and downloads newer
plugin versions in the background. Third-party marketplace auto-update is off by
default, so adding the marketplace alone is not enough.

The check can take several minutes, and a session keeps the plugin version it
loaded at launch. Start a new session after an update; in Claude Code you can use
`/reload-plugins` to load most plugin changes without restarting. If you customized
a plugin locally, Claude warns you before replacing those edits.

If an update does not appear, confirm **Auto-update** is enabled, open
**Customize** → **Plugins**, open MOAI Plugins, and select **Update**. Then start a
new session.

For ChatGPT/Codex, refresh the Git marketplace, reinstall the plugin, and start a new task:

```bash
codex plugin marketplace upgrade moai-plugins
codex plugin add inbox-assistant@moai-plugins
```

Claude's Auto-update toggle does not update Codex installations.

## Troubleshooting

- **Marketplace does not appear:** confirm the repository URL is exactly `https://github.com/thomas-echezabal/moai-plugins`, then try adding it again.
- **Two Inbox Assistant entries appear:** uninstall the uploaded copy and keep the marketplace copy.
- **Commands are missing after an update:** start a new Cowork session so the updated plugin is loaded.
- **A slash command does not appear in Codex:** select the matching `$inbox-assistant-*` skill or ask for the workflow in plain language; the Claude slash command and Codex skill use the same source workflow.
- **Inbox Assistant cannot read mail:** reconnect Gmail or Microsoft 365 under Claude **Settings** → **Connectors**, then run `/inbox-assistant:setup` again.

For Academy support, use the Help Center or weekly office hours in the Mother of AI portal.

## Copyright

Source available. All rights reserved. No permission is granted to copy, modify, redistribute, or sublicense this repository or its plugins without written authorization from Mother of AI.
