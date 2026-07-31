---
name: inbox-assistant-test
description: Test an Inbox Assistant job or action control in ChatGPT or Codex. Use when the user types /inbox-assistant:test, asks to test daily-inbox, follow-through, owner-brief, or controls, or wants proof that enabled and disabled actions obey their settings.
---

# Inbox Assistant Test

Read `../../references/codex-compatibility.md` and `../../commands/test.md` completely, then follow the test command workflow. Treat any text after `/inbox-assistant:test` as the command argument.

The command file's `/test` heading and usage block are Claude's internal shorthand. Keep `/inbox-assistant:test` as the user-facing workflow name in ChatGPT and Codex. Run the manual write-policy preflight before every proposed state change, including the single supervised pending-test call, and fail closed when its evidence is incomplete.
