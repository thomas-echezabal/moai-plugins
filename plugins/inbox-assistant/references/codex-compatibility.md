# ChatGPT and Codex compatibility

Apply these rules whenever Inbox Assistant runs in ChatGPT or Codex. The workflow files remain the single behavioral source for Claude and OpenAI products.

## Commands

Treat `/inbox-assistant:setup`, `test`, `schedule`, `status`, `tune`, and `pause` as durable workflow names. Claude exposes them as plugin slash commands. ChatGPT and Codex may invoke the matching `inbox-assistant-*` skill by intent or explicit skill selection instead. Never claim a slash-command UI is registered when the current product does not show one.

In shared workflow prose, a generic reference to Claude as the acting assistant means the assistant running the current session. A reference to a named Claude or Cowork menu, connector, Project, or Scheduled Task is product-specific and must use the platform mapping below rather than being repeated as if that UI exists in ChatGPT or Codex.

## Connectors and tools

Use only connectors, apps, and MCP tools actually available in the current conversation. Match tools by capability and full effect, never by vendor-specific display name. A missing Gmail, Microsoft 365, or Zapier connection is a missing route: explain what is unavailable and stop that branch. Do not substitute browser automation, shell access, or a different account for a missing connector.

Before every state-changing connector call in ChatGPT or Codex, apply the complete write-policy decision from `hooks/hooks.json` manually. Treat it as a fail-closed preflight: a native-connector write is denied; a Zapier write needs the matching enabled and tested action control plus an off kill switch; the supervised pending-test exception needs all of its stated evidence. The Claude hook remains defense in depth on Claude, but its absence on another runtime never weakens the policy.

## Files and projects

Keep Business Profile, Approved Sources, Boundaries, Task Settings, and Inbox Assistant State in the user-selected project or workspace. Preserve existing files in place during a cross-platform move. If the current product cannot persist or update a required file, do not pretend it did: return the proposed contents and name the missing persistence capability.

## Scheduled work

Use the current product's native recurring-task or automation feature only when it is available and can retain the complete safety preamble. If recurring execution is unavailable, prepare the exact task name, cadence, and prompt for the user without claiming it was scheduled. A platform change never authorizes a third-party scheduler silently.

## Agents

When delegation is available, follow the relevant file under `agents/`. When it is unavailable, read that agent file and perform the same audit in the current session. Do not skip the audit or reduce its checks because the runtime lacks a separate-agent feature.

## Updates

Marketplace updates load at a new-session or new-task boundary. Never edit installed cache contents as an update mechanism. Claude uses its marketplace update control; Codex uses marketplace upgrade followed by plugin reinstall when needed.
