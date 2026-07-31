---
name: zapier-limits-and-cost
description: Explains Zapier limits, cost tradeoffs, and safer alternatives in plain language, always verifying current pricing, task usage, and per-app rules against live Zapier and third-party documentation instead of memory.
metadata:
  version: 1.2.0
---

# Zapier Limits and Cost

## Platform compatibility

When running in ChatGPT or Codex, read `../../references/codex-compatibility.md` before inspecting connectors or proposing scheduled work. Describe only the apps and MCP tools actually available in the current conversation.

Use this skill when the user's request may not fit the current platform's scheduled-task feature, may not be possible through Zapier, or may cost more than expected. This skill is Zapier-specific; do not apply Zapier task costs to direct/native platform connectors.

Keep the explanation short and plain, but never quote a limit, price, task count, or capability from memory.

Inside the Inbox Assistant plugin the routing is fixed, and it changes the cost story: **mail reads come from the native Gmail or Outlook connector first, and every write goes through Zapier.** Native reads spend nothing. Zapier-routed reads, which are the fallback whenever a native connector does not cover a mailbox, spend tasks like any other Zapier call, and so does every Zapier write. **So the count that matters is Zapier-routed calls, reads-as-fallback included, never runs.** A daily brief reading natively spends Zapier tasks on the drafts it saves and on nothing else; the same brief reading a mailbox through Zapier spends tasks on those reads as well; a read-only setup on native connectors, where drafts print in the brief instead of saving into the mailbox, spends none at all. See `references/connector-matrix.md` for which capability takes which route.

**Cost follows the actions that are turned on.** Every action starts off, so a member on stage 1 spends nothing in Zapier no matter how many runs they have. Once actions are on, a run spends one task per action it takes, so the arithmetic is the volume of mail that qualifies, times the runs per month. Read which actions are on and what each one's `Scope` covers out of the `## Action controls` section in `Task Settings` rather than assuming, because the scope is what decides how much mail qualifies. When a member wants a cheaper month, narrowing a scope or switching an action off through `/inbox-assistant:tune` is the most direct lever there is, one sentence each. Widening a scope back or re-enabling an action goes through the ritual in `/inbox-assistant:setup stage-2`. See `references/action-controls.md`.

## This Skill Is Process-Only: Verify Every Current Fact

Zapier's pricing, task accounting, plan limits, supported clients, and the capabilities of each connected app all change frequently. This skill carries NO authoritative numbers or capability claims. Before you state any of the following as current fact, verify it against live documentation inside this chat:

- How many tasks an action uses, what counts as a task, or what does not count.
- Plan limits, allowances, or prices.
- Whether an app or capability is supported through Zapier, and any per-app rule (templates, windows, rate limits, posting-only access).
- Whether something "can" or "cannot" be done through Zapier.
- Setup, MCP support, or the choice between a scheduled task, a regular Zap, and a Zapier Agent.

Fail closed: if web search / browsing is unavailable in this chat, say you cannot verify the current guidance and ask the user to enable web search or paste the relevant doc. Never guess a number or recite a remembered one.

### Where to verify

Start at Zapier's documentation index, then open the relevant page:

```text
https://docs.zapier.com/llms.txt
```

Common pages: `https://docs.zapier.com/mcp/home`, `https://docs.zapier.com/mcp/quickstart`, `https://docs.zapier.com/mcp/usage`. For pricing and task accounting, find Zapier's current pricing / plans and task-usage docs from the index.

For an app-specific rule, also check that app's OWN current docs, because the platform owns the rule and Zapier mirrors it:

- WhatsApp / Messenger / Instagram: Meta's current Business / Platform policy.
- LinkedIn: LinkedIn's current developer / marketing API docs.
- Twilio / SMS: Twilio's current docs and messaging policy.
- Google (Gmail, Sheets, Drive): Google's current Workspace / API docs.
- Microsoft (Outlook): Microsoft's current Graph / Outlook docs.
- Any other app: that vendor's current docs, plus the Zapier app page for that integration.

## Claim-Type Matrix: What to Check Before Each Kind of Answer

Match the user's question to a claim type and verify with the listed sources before answering. State that your answer reflects what the docs say right now.

| Claim type | Example question | Verify against | Report |
|---|---|---|---|
| Cost / task usage | "How much will this cost?" "Is it still 2 tasks per action?" | Zapier's current pricing + task-usage docs | The current rule, then do the math live (see below) |
| App capability | "Can Zapier read my Slack channel?" | The Zapier app page for that app + the app's own docs | What is currently supported, plainly |
| App policy / limit | "Will a scheduled WhatsApp message send?" | The app's current policy docs (e.g. Meta) + the Zapier app page | The current rule and what it requires now |
| Setup / MCP | "How do I connect Zapier to Claude?" | Zapier's current MCP / setup docs | The current steps, in plain language |
| Routing (scheduled task vs Zap vs Agent) | "Should this be a scheduled task or a Zap?" | Zapier's current docs on Zaps / Agents + scheduled-task behavior | The current best fit, with the current tradeoffs |

## Core Boundaries (confirm current behavior before promising)

Claude.ai with Zapier helps work with connected apps, but acting on the user's behalf through Zapier is not the same as administering Zapier itself. As a rule of thumb, Claude in chat cannot manage the user's Zaps for them (create, edit, turn on, or read Zap history), and a scheduled task only has the connectors the user attaches to it. Treat these as hypotheses to verify, not fixed facts. Confirm the exact current behavior in Zapier's docs before making a firm promise.

Say:

```text
I can help write the task prompt, but I cannot create or turn on the scheduled task from here. You will paste the prompt into a Claude scheduled task and attach the needed connectors. Let me confirm the current setup steps from Zapier's docs.
```

## Other Connectors Outside Zapier

The user may also have direct/native connectors available in Claude, such as Gmail, Outlook, Drive, Notion, Slack, GitHub, or another app connector. For mail reads these are the primary route, not an alternative to consider.

When direct connectors exist:

- Prefer direct connectors for every read they cover. This is the default rather than an optimization.
- Use Zapier for the writes, and for any read a direct connector does not cover. Saving a draft and tidying a thread are Zapier-only, so those tasks are not avoidable by switching layers.
- Explain Zapier task usage only for Zapier-powered steps, and verify the current task rule before quoting it.
- Do not tell the user to add something in Zapier if a direct connector already covers it. Reading mail is the common case: if the native Gmail connector is on, adding Gmail in Zapier buys nothing and spends tasks.
- Explicitly minimize Zapier calls. For example, use direct Gmail reads when available, then use Zapier only for the capability nothing else covers.
- When the user wants a cheaper version, the lever is usually fewer Zapier-routed calls, fallback reads and writes alike, rather than fewer runs. A daily brief on native reads whose drafts print in the output costs nothing in Zapier tasks and still lands every morning.

Use direct connectors for safe discovery/listing when available. If only Zapier can fetch the options, a focused Zapier list/search may be worth it, but avoid broad scans.

## When a Scheduled Task Is Not the Best Fit

The choice between a Claude scheduled task, a regular Zap, and a Zapier Agent depends on Zapier's current product behavior. Verify against Zapier's current docs before steering the user, since these products change.

As rough intuition only, and verify against Zapier's current docs before committing:

- Work that should happen the moment something new appears (a new email, form response, row, payment, contact) often points toward an event-triggered Zap rather than a scheduled task.
- Background work that needs judgment each time may point toward a Zapier Agent.
- Work that should happen on a clock (every morning, every Monday) fits a Claude scheduled task.

Plain wording (after checking):

```text
Based on Zapier's current docs, this sounds like it should run whenever something new arrives rather than at a set time, which usually points to a regular Zap. Want me to outline that instead?
```

## Zapier MCP Edge Cases

Handle these calmly and plainly. Where a cause involves current setup or limits, verify before asserting.

### Claude Cannot See Any Zapier Tools

Likely causes: Zapier is not connected to this chat, no app capability was added to the Zapier server, or the connector is not enabled here. Check first whether a native connector already covers what the user wants, since a missing Zapier server only blocks writes when reads are coming in natively. Confirm the current setup steps in Zapier's docs, then say:

```text
I cannot see any Zapier-connected app access here yet. Let me check Zapier's current setup docs, then we will confirm the connection, that at least one app capability is added, and that the connector is enabled for this chat or scheduled task.
```

### Claude Can See the App, but Not the Needed Capability

Example: Slack is available for sending messages, but not reading channel messages. Say what is missing and avoid designing around it. Before declaring a named capability missing, re-check by exact app name and common aliases. If the user says it is connected, treat that as a cue to re-check, not as a disagreement.

### Permission or Connection Error

If an app says the connection expired or access is denied, the user needs to reconnect or reauthorize that app in Zapier. Do not tell the scheduled task to keep retrying risky steps.

### Missing Required Details

If an app capability requires a channel, sheet, recipient, folder, database, or pipeline, ask for the exact destination. If the user does not know, tell the scheduled task to stop and report the missing detail. Do not invent account-specific details such as template names, channel IDs, label names, or spreadsheet tabs.

## Apps With Special Rules: Verify, Never Assert

Some apps constrain automations (approved templates, messaging windows, posting-only access, rate limits). The platform owns these rules and they change, as does Zapier's support for each app. Do NOT state any specific limit from memory. When any of these appears, check the app's current policy docs AND the current Zapier app page, then state only what you verified:

- WhatsApp Business / Notifications: Meta's current messaging policy (templates, session windows, length).
- SMS by Zapier / Twilio: current number, volume, and content rules.
- Facebook Messenger: current messaging-window rules.
- Telegram: current bot permission / webhook rules.
- Instagram for Business: current publishing and messaging capabilities.
- LinkedIn: current available actions and triggers.
- Twilio: current send/receive and media rules.
- Facebook Lead Ads: current permission and form requirements.

Right behavior:

```text
This app has delivery rules that change, so I do not want to promise a specific behavior yet. Let me check the app's current policy and the current Zapier app page first.
```

### Too Many Results

If a scheduled task might scan or update lots of records, cap the run. Examples: "Check the newest 20 emails." "Summarize matching records instead of updating all of them." "Only draft follow-ups; do not send them."

### Duplicate Outputs

If a scheduled task sends, posts, creates, or updates, include a duplicate-prevention rule. If duplicate prevention is not possible, recommend a read-only or internal-only first version.

### Partial Completion

If one step succeeds and another fails, the scheduled task should report what happened and stop. It should not repeat customer-facing, money-related, or bulk work without review.

## "Can Zapier even do this?": Verify Before Saying No

Whether a specific automation is possible through Zapier depends on the current app integration and the platform's current rules, both of which change. Do not declare something impossible from memory. Check the Zapier app page for that app AND the app's own current docs first. Only then give a verified yes/no, and if it is currently not possible, offer an alternative.

```text
Let me check whether that is currently possible through Zapier for this app before I say yes or no.
[checks the current Zapier app page + the app's own docs]
Based on the current docs: [verified answer]. If it is not possible right now, a better path would be [alternative].
```

## Cost Explanation: Look Up the Rate, Then Do the Math

Never quote Zapier's task-per-action rate, plan allowances, or prices from memory. First verify the current rule from Zapier's pricing / task-usage docs, then apply this method:

1. Count only the Zapier-powered steps in the task (direct Claude connectors do not use Zapier tasks).
2. Multiply by how often the task runs (daily, weekdays, weekly) to get runs per month.
3. Apply the current per-action task rule you just verified to get tasks per month.
4. Compare against the user's current plan allowance (also verified, not remembered).

Frame it as a method, with the current numbers filled in only after you have checked them:

```text
Here is how the cost works out, using Zapier's current task rule from their docs:
- Zapier steps per run: [n]
- Runs per month: [from the schedule]
- Current tasks per action: [verified from Zapier docs]
=> roughly [n x runs x rate] tasks/month, against your plan's current allowance.
```

Reduce cost by using direct connectors first and Zapier only for what nothing else covers. Note that successful test calls can also count and can make real changes, and that what does and does not count toward usage is itself a thing to verify in Zapier's current docs rather than assert.

## Safer Version 1

For anything risky, recommend a safer first version (this guidance is stable):

- customer emails -> draft and summarize first
- public posts -> send an internal preview first
- CRM updates -> produce a review list first
- deletes -> never in version 1
- money changes -> never in version 1

```text
For the first version, I would have Claude prepare a review list instead of changing records automatically. Once you trust the output, you can make it more active.
```

## Worked Examples (verify first, every time)

- "Is it still 2 tasks per action?" → Don't confirm or deny from memory. Check Zapier's current task-usage docs, then state the current rule.
- "Estimate my monthly WhatsApp cost." → Verify the current task rate AND Meta's current WhatsApp rules, then run the math method above.
- "Can I auto-reply to LinkedIn messages?" → Check the current Zapier LinkedIn app page + LinkedIn's docs, then answer with what is supported now.
- "How do I set up Zapier MCP?" → Check Zapier's current MCP/setup docs, then give the current steps.

In every case, the first move is to verify against live docs, never to recite a remembered number or capability.

## Output Pattern

When redirecting, use:

```text
Best fit: [Claude scheduled task / regular Zap / Zapier Agent / different tool]

Why: [one plain sentence, based on what you just verified]

What I can still do here: [write the task prompt / write a Zap plan / suggest the right setup]
```
