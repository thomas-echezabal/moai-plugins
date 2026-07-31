---
name: inbox-assistant-status
description: Read and report Inbox Assistant connections, action controls, scheduled work, run history, and outstanding problems without changing anything. Use when the user types /inbox-assistant:status, asks whether Inbox Assistant is working, or wants to verify a migration between Claude, ChatGPT, or Codex.
---

# Inbox Assistant Status

Read `../../references/codex-compatibility.md` and `../../commands/status.md` completely, then follow the status command workflow. Treat any text after `/inbox-assistant:status` as the command argument.

The command file's `/status` heading is Claude's internal shorthand. Keep `/inbox-assistant:status` as the user-facing workflow name in ChatGPT and Codex. Preserve the command's read-only contract: report missing platform capabilities and connector routes, but write no file, receipt, task, or repair.
