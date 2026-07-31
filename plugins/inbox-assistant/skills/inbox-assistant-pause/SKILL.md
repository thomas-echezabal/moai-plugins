---
name: inbox-assistant-pause
description: Pause, resume, list, or remove Inbox Assistant recurring tasks in ChatGPT or Codex. Use when the user types /inbox-assistant:pause, asks to stop everything, wants one task paused or resumed, or needs the Inbox Assistant kill switch applied safely.
---

# Inbox Assistant Pause

Read `../../references/codex-compatibility.md` and `../../commands/pause.md` completely, then follow the pause command workflow. Treat any text after `/inbox-assistant:pause` as the command argument.

The command file's `/pause` heading and usage block are Claude's internal shorthand. Keep `/inbox-assistant:pause` as the user-facing workflow name in ChatGPT and Codex. Use only recurring-task controls actually available in the current product, preserve the command's pause-before-ledger ordering, and never report a task as paused or resumed unless the platform confirms it.
