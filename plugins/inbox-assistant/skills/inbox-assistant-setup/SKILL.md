---
name: inbox-assistant-setup
description: Set up, upgrade, repair, or enable actions for Inbox Assistant in ChatGPT or Codex. Use when the user types /inbox-assistant:setup, asks to install or configure Inbox Assistant, needs its project files repaired, or wants to begin setup stage 1 or stage 2.
---

# Inbox Assistant Setup

Read `../../references/codex-compatibility.md` and `../../commands/setup.md` completely, then follow the setup command workflow. Treat any text after `/inbox-assistant:setup` as the command argument.

The command file's `/setup` heading and usage block are Claude's internal shorthand. Keep `/inbox-assistant:setup` as the user-facing workflow name in ChatGPT and Codex. Load every referenced skill and reference before the step that requires it. Apply the compatibility fallback for connectors, files, scheduling, agents, and the write-policy preflight without weakening the setup contract.
