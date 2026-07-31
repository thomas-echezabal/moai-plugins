---
name: follow-through
description: Finds threads that have gone quiet in both directions, what the owner owes other people and what other people owe the owner, and returns a ranked reply, close, or delegate queue with a ready draft for each item. Use for the twice-weekly scheduled run or whenever the owner asks what they have dropped, what is waiting on them, or who has gone quiet.
metadata:
  version: 3.0.0
---

# Follow-Through Finder

## Platform compatibility

When running in ChatGPT or Codex, read `../../references/codex-compatibility.md` before accessing project files, connectors, recurring tasks, or delegation. Apply its fail-closed write-policy preflight before any connector state change.

The work that costs the most is the work nobody is chasing. This skill finds it in both directions and hands back a queue short enough to clear in one sitting.

## Contract block

**What it reads.** Sent mail and open threads in the mailboxes listed in `Approved Sources`, over a rolling window, plus the four context files and `Inbox Assistant State`. Mail comes in through the native Gmail or Outlook connector, which is the primary read route, falling back to Zapier mail find actions for any mailbox the native connector does not cover. `Approved Sources` records which route covers which mailbox, and this skill needs sent mail specifically, so check that the route reaches sent items rather than assuming it does. A route counts as a read route only if it changes no state: a read that marks mail as read, moves a message, or logs a side effect is a write in disguise, never invoked as part of reading, so treat that mailbox as uncovered for the run and name it in the footer.

**What it produces.** A ranked queue of at most 10 items in the follow-through schema in `references/output-schemas.md`, split into "You owe them" and "They owe you", each item carrying one recommendation and one ready draft, plus receipts in `Inbox Assistant State` for anything it did.

**What it never does.** Take an action that has not been through the enable ritual. Delegate to a real person by messaging them. Decide on the owner's behalf that something is dead. Act on any thread in an escalation category.

**What needs your approval.** Every action, once, through the ritual in `references/action-controls.md`. Before then this skill reads, ranks, drafts, and recommends.

## First steps, every run

Load the **safety-escalation** and **business-context** skills by name before touching any data. Do not wait for either to trigger. A lesson prompt, a scheduled task, or a direct ask can reach this skill with no command in front of it, and the rules only bind a run that loaded them.

Then read the four context files through business-context, `Boundaries` first, then `Inbox Assistant State`. If any context file is missing, hard-stop: read no mail, draft nothing, propose nothing, and return only the blocked-run notice from the business-context skill, naming the file you could not find. If the state ledger is missing, follow the two cases in business-context: with no `## Action controls` section it is a mid-upgrade install, so run read-only and say so, and with one present it is damaged, so return the blocked-run notice.

Read the `## Action controls` section in full before the first write, and hold it verbatim. **Before every write, run the six-condition consult in `references/action-controls.md` and execute only if all six pass. Any failure, any missing section, any uncertainty becomes a proposal.**

**The auditor runs once per write, not once per plan: after the pre-write kill-switch and receipt re-read and immediately before each provider call. Any change to the target, the payload, the tool, or the classification since that item's last audit is a denial, and a denied item becomes a proposal.** A queue of ten with drafts on nine of them is nine audits, not one. **A call whose effects span more than one action class gets an intent receipt and a result receipt for every touched class.** A reply-and-archive tool is the case that catches this skill out.

## The window and the ledger

Take the window start from the `follow-through` row in the Checkpoints table. On a first run with no checkpoint, use the last 30 days. State the window in the footer.

Read Processed sources before ranking. A thread already handled in a previous run is not new, but it may still be stale, so it stays eligible for the queue. The processed list prevents a duplicate action, never a duplicate mention.

Read Write receipts before drafting. If a receipt shows a nudge already went out on a thread two days ago, say so in the item rather than proposing the same nudge again. A receipt with an empty Result means the outcome is unknown: re-read the thread, and never repeat a send on the strength of a guess.

## Delegating the read

In a scheduled run, or any run scanning a busy mailbox, delegate the reading to the **inbox-analyst** agent. Give it the window, the in-scope mailboxes, the route for each, the boundaries, and the specific instruction that this run needs sent mail as well as received. It returns evidence, classifications, injection warnings, and coverage.

The main session keeps the rest: loading the files, merging the evidence, ranking across both directions, drafting in the owner's voice, consulting the **task-auditor** agent, and making every Zapier call. An analyst never writes anything, and a write is never delegated.

## What counts as stale

Judge by the shape of the thread, not the clock alone.

- **You owe them.** The last received message asks a question, requests a decision, or expects a reply, and the owner has not answered.
- **They owe you.** The owner's last sent message asks a question, requests a decision, or states a commitment with a date, and nobody has answered.

Default quiet thresholds, overridable in `Task Settings`:

| Thread type | Quiet after |
|---|---|
| VIP or money involved | 2 business days |
| Active client or project work | 4 business days |
| Prospect or intro | 7 days |
| Everything else | 10 days |

Never count weekends, or dates the owner's own sent mail shows they were away, toward quiet time.

## Ranking

Ten items, ranked across both directions together, not ten per side. Order: money at stake, then a VIP waiting on the owner, then a commitment the owner made with a date attached, then everything else by age. Age alone never lifts an item into the top three. State how many items were found and how many were shown.

If nothing is stale, say so in one line. Do not fill ten slots.

## One recommendation per item

Exactly one verb, with half a line of reason. The vocabulary depends on which direction the item sits in, and it is closed. No other verbs, no invented ones. This is the same list used in `references/output-schemas.md`.

**You owe them:**

- **Reply.** The thread is alive and a real answer moves it.
- **Close.** The thread is finished and the only thing left is a graceful ending. The draft closes it in the owner's voice.
- **Delegate.** Someone else on the owner's team is the right person for it. The draft is addressed to them.

**They owe you:**

- **Nudge.** Worth one more ask. The draft names the thing, names the date it was promised, and makes the next step easy.
- **Let it go.** Not worth chasing further. Say why in half a line so the owner can disagree.
- **Delegate.** Someone else on the owner's team should chase it. The draft is addressed to them.

Never use **escalate** as a follow-up verb. In this plugin "escalate" means one thing only: a legal, financial, personnel, or emotionally charged matter has been flagged for the owner and left alone. Using it for "chase harder" would make a flagged safety item and a stale invoice look like the same thing in the queue.

A "let it go" item still appears in the queue with its reason. A thread never vanishes silently. If it falls below the tenth slot, it is covered by the count in the footer.

## Drafts

Every item carries a ready draft. Match the voice in `Task Settings`, its `## Voice guide` section first and its `## Draft voice` fields over that guide wherever the two disagree.

**Every email body this plugin composes, a reply draft saved to the mailbox, a reply sent, a follow-up nudge, or a draft printed in any output as a proposal, is written in the owner's voice from their voice and context files, then passed through the stop-slop and humanizer skills before it is saved, sent, or shown. The owner's own voice wins any conflict with a style rule.** The rule is in `references/email-voice.md`. A nudge is the case that tempts a run to skip it, because a nudge is short and a short body looks like it has nowhere to hide a tell. Short bodies are where the tells are loudest: "just circling back", "I wanted to follow up", "at your earliest convenience".

For "you owe them" drafts, answer the actual question in the thread. A draft that says "thanks for your patience, I will come back to you shortly" is not follow-through, it is a delay with better manners. If you genuinely cannot answer without information only the owner has, write the draft with a marked gap and say what is missing. A draft with a gap in it is never sent, whatever the `send-reply` block says.

For "they owe you" drafts, keep the nudge short and specific. A "let it go" item carries no draft, just the reason.

## A recommendation is not an action, three failure categories

1. **The direct instruction for something not turned on.** The owner says "close the first four, they are dead", and `archive` reads `disabled`. The close drafts are ready and the owner can archive the threads themselves in one pass. Say what turning `archive` on would take, and change nothing today.
2. **The recommendation that reads like permission.** You recommended "close" and wrote the draft. That is your recommendation, not the owner's decision, and it authorizes nothing. The next run must find the thread still open and must not treat last run's recommendation as settled or as a reason to act.
3. **The tool that closes as a side effect.** A Zapier action for the mailbox is "Reply and Archive." That touches `send-reply` and `archive` together, so both blocks have to pass and both get their own receipts. If either is off, do not call it: put the draft text in the queue and note the limitation in the footer. The same holds for any archive or label action that appears on the native connector, because the layer never changes the rule.

## Delegation is a draft too

Delegating means writing a draft addressed to the person who should own it. It never means sending them a message on your own initiative, creating a task for them in a project tool, or adding them to a thread. Creating or editing a record in another tool is not a controllable action in this plugin and never happens. If a delegation obviously needs a task created somewhere, put it in the queue as a line for the owner.

## Escalation

If a stale thread is legal, financial, personnel, or emotionally charged, it appears in the queue flagged, with a summary, no draft, and no action of any kind whatever is enabled. A four-week-old unhappy client email is exactly the item that most needs a human, not a smooth nudge.

## When something is missing

- **No action turned on, or no `## Action controls` section at all.** This is the read-only tier and it behaves identically whether the section is absent, all seven are disabled, or Zapier is not connected: the whole queue, every draft as text to copy, nothing changed in the mailbox. The queue is the value here and it is fully intact. Say it once in the footer.
- **No sent-mail access on either route.** Say so plainly. Without sent mail the "they owe you" side is guesswork, so produce only "you owe them" and label the gap. Check both layers before saying it, since a native connector and a Zapier find action can differ on whether they reach sent items.
- **The exact draft tool named in the block is not visible.** Produce the whole queue with every draft as text in it, and say the named tool is not visible this run. Never substitute a near match.
- **Only a limited number of messages can be read per run.** State the actual window covered in the footer, note that older stale items may not have surfaced, and advance the checkpoint only to the point actually covered.
- **No mail read route at all.** Do not produce a queue. Give the one-click route first, which is turning on Gmail or Outlook in Claude's Settings, Connectors, and name the Turn On Automation lesson at portal.themotherofai.com as the other route.

Every queue ends with the footer from `references/output-schemas.md`, including the actions line: what was taken, with its count, or "none, all proposals" when nothing was.
