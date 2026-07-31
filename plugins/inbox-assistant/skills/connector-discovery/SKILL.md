---
name: connector-discovery
description: Helps the assistant explain which connected apps it can actually use before designing a scheduled task, always verifying connector setup, capabilities, and per-app rules against live documentation rather than memory.
metadata:
  version: 1.2.0
---

# Connector Discovery

## Platform compatibility

When running in ChatGPT or Codex, read `../../references/codex-compatibility.md` before inspecting connectors or proposing scheduled work. Describe only the apps and MCP tools actually available in the current conversation.

Use this skill when the user wants to know what the current assistant can do with connected apps, or before designing any scheduled task that uses app connectors. Two layers are usually in play: the current product's native connectors and Zapier. Survey both.

Your job is to inspect the capabilities actually visible in the current chat, explain them in plain language, and flag anything missing, without ever stating a time-sensitive fact from memory.

Inside the Inbox Assistant plugin the two layers have fixed jobs, and the inventory follows that split: **mail reads come from the native Gmail or Outlook connector first, with Zapier find actions as the fallback, and every write goes through Zapier only.** So a survey here answers three questions rather than one long list: can it read mail, can it save a draft, can it tidy a thread. The first is usually native. The other two are always Zapier. See `references/connector-matrix.md` for the routing table this maps onto.

**A visible tool is not a permitted action, and saying so is part of the report.** Setup has two stages: stage 1 connects the reading, stage 2 turns on individual actions one at a time. All seven actions start off, and a discovery survey never changes that. So when a Zapier write tool is visible, report it as visible and say plainly that whether it may be used is a separate question answered in `references/action-controls.md`, not by this survey. A member on stage 1 with five Zapier write tools exposed still has zero actions turned on, and that is the expected state rather than a gap.

`/inbox-assistant:status` is the member-facing version of this survey. It checks each route with one live read, lists which actions are actually turned on, and points at the right screen for each fix. Point the owner there rather than re-running a discovery conversation, and use this skill when you need the inventory yourself or when something the owner says is connected is not showing up.

## Treat Setup, Capabilities, and App Rules as Live: Never Static

Connector setup steps, which apps and capabilities are supported, and per-app rules all change frequently. This skill carries NO authoritative values for any of them. Before you state any of the following as current fact, verify it against live documentation inside this chat:

- How to connect or configure Zapier or Zapier MCP, or where to do it.
- Whether a given app or capability is available through Zapier or a direct connector.
- Any per-app limit, policy, or restriction (approved templates, messaging windows, posting-only vs reading, rate limits).
- Anything the user says "changed," "stopped working," or "isn't showing up."

Fail closed: if you cannot verify because web search / browsing is unavailable in this chat, say so plainly and ask the user to enable web search or paste the current doc. Do not guess and do not recite a remembered value.

### Where to verify

Start at Zapier's documentation index, then open the relevant page:

```text
https://docs.zapier.com/llms.txt
```

Common pages: `https://docs.zapier.com/mcp/home`, `https://docs.zapier.com/mcp/quickstart`, `https://docs.zapier.com/mcp/usage`.

For any app-specific rule, also check that app's OWN current docs. Zapier's behavior usually mirrors the underlying platform's rules, and the platform owns the rule. Use the source that owns it:

- Gmail / Sheets / Drive: Google's current Workspace / API docs.
- Outlook / Microsoft 365: Microsoft's current Graph / Outlook docs.
- WhatsApp / Messenger / Instagram: Meta's current Business / Platform messaging policy.
- LinkedIn: LinkedIn's current developer / marketing API docs.
- Twilio / SMS: Twilio's current docs and messaging policy.
- Slack, Notion, HubSpot, or any other app: that vendor's current docs, plus the Zapier app page for that specific integration.

Once you have checked, keep the answer plain and short.

## First Step Every Time

Look at your available tools. Identify:

- Direct/native connectors, such as Gmail, Outlook, Google Drive, Slack, Notion, GitHub, or other app-specific tools. For mail these are the read route, so check for them first.
- Zapier-connected capabilities, often named with a Zapier prefix such as `mcp__zapier__`. Sort what you find into reads, which are a fallback, and writes, which are the only route for saving a draft or tidying a thread.
- Missing or unclear capabilities needed for the user's goal.

Do not run any app-changing tool just to discover capabilities. Only inspect the tool list.

Report the two layers separately when both are present. "Gmail read through your Claude connector, drafts through Zapier" tells the user which screen fixes which problem. A merged list of nine tool names does not.

If the user names specific apps or says those tools are connected in Zapier, do a targeted second check for those exact app names and likely aliases before saying anything is missing.

Examples:

- Gmail may appear as Gmail, email search, find email, or Zapier Gmail.
- WhatsApp may appear as WhatsApp, WhatsApp Business, or send message.

Do not treat "I have not verified it yet" as "it is missing." Say:

```text
I have not verified that one yet. Let me check the named tools specifically before I write the prompt around it.
```

## Fetch Safe Options When Helpful

After you know a safe read/list/search capability exists, use it to gather specific options the user would otherwise have to guess.

This applies across apps, not just Zapier:

- Notion: list/search databases, pages, boards, task lists, or relevant workspaces when available.
- Slack: list/search channels or users when available.
- Google Sheets: list/search spreadsheets, worksheets, or sample rows when available.
- Gmail: list labels/folders or search sample messages when available.
- CRM tools: list pipelines, stages, owners, lists, or recent records when available.
- Project/task tools: list workspaces, projects, boards, sections, task lists, or assignees when available.
- Drive/file tools: list folders or search files when available.

Keep it narrow. Fetch enough to help the user choose, not every record in the account.

Show a short list:

```text
I found these likely Notion targets:
1. Product Roadmap
2. Personal Tasks
3. Client Follow-ups

Which one should the scheduled task use?
```

If the only available path is Zapier, remember that successful reads/searches can count as Zapier usage. Whether they do, and how much, can change. If the user asks about cost, verify against Zapier's current docs rather than asserting a number. Still fetch when it materially helps, but prefer direct connectors for read-only discovery when available and avoid broad scans.

## What to Tell the User

Summarize what you can see in plain English. List only capabilities you actually verified in the tool list just now. The lines below are an example of the format, not defaults to copy:

```text
I checked what I can see from your connected tools. Right now I can work with:

- Gmail directly in Claude: find and read emails
- Slack through Zapier: post messages to channels
- Google Sheets through Zapier: add new rows

I will only design the scheduled task around what is actually available here.
```

If the exact tool names are useful, put them after the plain-English version, not before it. Usually they are not useful for non-technical users.

```text
For reference, the visible connector entries are:
- mcp__zapier__gmail_find_email
- mcp__zapier__slack_send_channel_message
```

## If Nothing Is Visible

Say:

```text
I do not see connected app capabilities in this chat yet. That means I can still help write the task prompt, but we need to be careful because I cannot verify what Claude will be able to use.

Before creating the scheduled task, attach the connectors Claude needs. That could be a direct app connector, Zapier, or both.
```

Then ask what apps the user expects to use.

Name where each fix lives, because they are two different screens. Native connectors are turned on inside claude.ai, in Settings, then Connectors, as a one-click sign-in. Zapier is connected separately, and inside the Inbox Assistant plugin that step is the Turn On Automation lesson at portal.themotherofai.com. Do not send someone to a lesson to fix a native connector, and do not walk someone through Claude's settings to fix a missing Zapier write.

If they want Zapier setup help, do not recite setup steps from memory. The setup flow changes. Check Zapier's current MCP/setup docs first (start at `https://docs.zapier.com/llms.txt`), then walk them through the current steps in plain language.

## How to Describe Capabilities

Use plain app-centered phrases:

- "find emails" instead of "search endpoint"
- "send a message" instead of "call an action"
- "add a row" instead of "write to a table"
- "look up a contact" instead of "query a record"
- "post a team update" instead of "execute a Slack tool"

Avoid words like trigger, action, webhook, payload, schema, API, OAuth, cron, and field mapping unless the user used them first.

## Connector Choice

When both a direct connector and Zapier are available for the same app:

- **For a read, prefer the direct connector.** It is the primary route for mail reads, and it spends no Zapier tasks.
- **For a write, use Zapier.** The native Gmail and Outlook connectors read. They do not save drafts and they do not archive, move, or label, so every one of those goes through Zapier. If a native write action ever does appear, do not quietly route a write through it to avoid reporting a gap: say what you found and let the plugin's own rules decide.
- Use Zapier for a read only if the direct connector is missing that capability, or if the app is only available through Zapier.
- If one connector can read and the other can write, explain that the scheduled task will use both.
- Do not mention a direct connector fallback unless a direct connector is visible or the user says they will attach one.
- Only apply Zapier cost warnings to steps that use Zapier, and verify current Zapier cost behavior before quoting any figure.
- In the final plan, name the source for each app: "Gmail directly in Claude" or "Slack through Zapier."

Before finalizing, make a cost-minimizing pass:

```text
Can any of these Zapier steps be handled by a direct connector instead?
```

If yes, use the direct connector for that step and leave Zapier for the remaining missing capability.

## Spot Missing Pieces

Compare what the user wants with what you can see.

Examples:

- If they want a Gmail summary but you only see Gmail send through Zapier, tell them they also need a way for Claude to find or read emails, either directly or through Zapier.
- If they want to post to Slack but no Slack posting capability is visible, tell them to add Slack posting through a direct connector or Zapier.
- If they want to update HubSpot records but only search is visible, tell them update capability is missing.

Use this format:

```text
We are missing one piece: I can see Gmail, but not Slack posting. For the scheduled task to post the summary, enable a Slack message capability, either directly in Claude or through Zapier.
```

## Apps That Often Have Special Rules: Verify Before Designing

Some apps constrain what an automation can do (approved templates, messaging windows, posting-only access, rate limits), and both the platform's rules and Zapier's support for them change over time. Do NOT assert any specific limit from memory. When any of these apps is involved, check the app's current docs AND the current Zapier app page for that integration before you design around it, then state only what you verified:

- WhatsApp Business / WhatsApp Notifications: Meta's current messaging policy (templates, session windows).
- SMS by Zapier / Twilio: current number, volume, and content rules.
- Facebook Messenger: current messaging-window rules.
- Telegram: current bot permission / webhook rules.
- Instagram for Business: current publishing and messaging capabilities.
- LinkedIn: current available actions and triggers.
- Facebook Lead Ads: current permission and form requirements.

Do not infer account-specific options that are not visible, such as an approved template name, a specific label name, a Slack channel, or a sheet tab. Ask or leave a placeholder.

Right behavior:

```text
LinkedIn's automation options change, so let me check what's currently supported before I promise anything.
[checks LinkedIn's current docs and the current Zapier LinkedIn app page]
Based on the current docs, here is what is possible right now: ...
```

## Worked Examples (verify first, every time)

- "Can Claude auto-reply to my LinkedIn messages?" → Don't answer from memory. Check LinkedIn's current API docs and the current Zapier LinkedIn app page, then answer with what is supported right now.
- "Why can't Claude see my Zapier tools?" → Check Zapier's current MCP/setup docs, then walk through the current steps.
- "Will this WhatsApp message send on a schedule?" → Check Meta's current WhatsApp messaging-window and template policy, then explain what is required now.
- "How do I add more app capabilities to Zapier?" → Check Zapier's current docs for the current flow before describing it.

In every case, the first move is to verify against live docs, never to recite a remembered answer.

## Safety

Discovery should not change anything in the user's apps.

Do not send emails, post messages, update records, delete data, charge money, issue refunds, or create public/customer-facing content while discovering capabilities.

Listing available tools and reading documentation do not change anything. Successful work through Zapier in external apps does. Whether reads/searches count toward Zapier usage, and by how much, can change. Verify against Zapier's current docs if the user asks about cost.

Successful test calls also count and may make real changes, so do not run tests unless the user knowingly asks for one.

If the user corrects you and says a tool exists, acknowledge it plainly, re-check, and revise the setup checklist. Do not leave stale fallback wording in the final prompt.

## Output

End with one focused question:

```text
What would you like this task to do on its schedule?
```

or, if they already gave the goal:

```text
What time and how often should this run?
```
