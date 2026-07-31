---
name: inbox-assistant-tune
description: Tune Inbox Assistant output, voice, ranking, action scope, or durable settings in ChatGPT or Codex. Use when the user types /inbox-assistant:tune, says a brief or draft is wrong, wants an action narrowed or disabled, or wants a correction applied to future runs.
---

# Inbox Assistant Tune

Read `../../references/codex-compatibility.md` and `../../commands/tune.md` completely, then follow the tune command workflow. Treat any text after `/inbox-assistant:tune` as the command argument.

The command file's `/tune` heading and usage block are Claude's internal shorthand. Keep `/inbox-assistant:tune` as the user-facing workflow name in ChatGPT and Codex. Show the exact before and after, preserve file boundaries, and apply the write-policy preflight before any connector state change.
