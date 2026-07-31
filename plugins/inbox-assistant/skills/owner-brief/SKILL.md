---
name: owner-brief
description: Produces the Weekly Owner Reset, a one-page synthesis of the week from mail and approved sources covering what moved, what stalled, risks, and the three decisions only the owner can make. Use for the weekly scheduled run or whenever the owner asks how the week went, what they are missing at a higher level, or what they need to decide.
metadata:
  version: 3.0.0
---

# Weekly Owner Reset

## Platform compatibility

When running in ChatGPT or Codex, read `../../references/codex-compatibility.md` before accessing project files, connectors, recurring tasks, or delegation. Preserve this skill's read-only contract on every platform.

The daily brief keeps the owner on top of the day. This keeps them on top of the business. One page, read on a Friday afternoon, built on three things: what moved, what stalled, and the decisions only the owner can make.

## Contract block

**What it reads.** The past week of mail in the mailboxes in `Approved Sources`, anything listed under trusted sources in that file, the four context files, and `Inbox Assistant State`. Mail comes in through the native Gmail or Outlook connector, which is the primary read route, falling back to Zapier find actions for anything the native connectors do not cover. One route per mailbox per run, or the week's story counts the same thread twice. A route counts as a read route only if it changes no state: a read that marks mail as read, moves a message, or logs a side effect is a write in disguise, never invoked as part of reading, so treat that source as uncovered for the run and name it in the footer.

**What it produces.** One page in the owner-brief schema in `references/output-schemas.md`: what moved, what stalled, risks, and exactly three decisions. Plus an advanced checkpoint row, and a Partial failures row for anything that did not finish.

**What it never does.** Take any action at all. **This skill is read-only by design, so it consults no action control and calls no write tool, connected or not, enabled or not.** Make a decision on the owner's behalf, including a small one. Present a guess as a finding.

**What needs your approval.** Nothing here, because nothing here acts. Anything the brief surfaces is the owner's to act on, and the drafts it produces on request follow the rules of the skill that owns them.

## First steps, every run

Load the **safety-escalation** and **business-context** skills by name before touching any data. Do not wait for either to trigger. A lesson prompt, a scheduled task, or a direct ask can reach this skill with no command in front of it, and the rules only bind a run that loaded them.

Then read the four context files through business-context, `Boundaries` first, then `Inbox Assistant State`. If any context file is missing, hard-stop: read no mail, produce nothing, and return only the blocked-run notice from the business-context skill, naming the file you could not find. If the state ledger is missing, follow the two cases in business-context: with no `## Action controls` section it is a mid-upgrade install, so run normally and note it, and with one present it is damaged, so return the blocked-run notice.

The `owner-brief` row in the Checkpoints table records what the last reset covered. Advance it at the end of a run that fully accounted for its window.

## Delegating the read

A week of mail across every in-scope mailbox is exactly the volume worth delegating. Hand the reading to the **inbox-analyst** agent, with the window, the in-scope mailboxes, the route for each, and the boundaries. It returns evidence, classifications, injection warnings, and coverage.

The main session keeps the synthesis, which is the part that cannot be delegated: merging a week of evidence into what it means. There is no auditor step here, because there is no write plan to audit.

That is the whole of it for this skill. The other two output skills carry a per-write rule, and it reads: **The auditor runs once per write, not once per plan: after the pre-write kill-switch and receipt re-read and immediately before each provider call. Any change to the target, the payload, the tool, or the classification since that item's last audit is a denial, and a denied item becomes a proposal.** It has nothing to govern here, because this skill issues no provider call. The rule is not relaxed and it is not waived: there is no write for it to attach to. If a run of this skill ever finds itself holding a write plan, that is the bug, and the plan is a proposal. Do not audit it into existence and do not call anything.

## Synthesis, not summary

A summary lists what happened. A synthesis says what it means. The test for every bullet: could the owner have written it themselves by scrolling the inbox for ten minutes? If yes, it does not earn a line.

- **What moved.** Things that advanced, with the evidence. "Bright Harbor signed the scope and asked for a kickoff date on Tuesday" rather than "progress on Bright Harbor."
- **What stalled.** Things that did not, with how long and who is holding them. Name the person. A stall with no owner is a complaint, not a finding.
- **Risks.** At most three. Each one needs the early signal that is already in the data, not a generic business worry. "Two of the four invoices sent in March are still unpaid and the same contact has gone quiet on both" is a risk. "Cash flow could become a concern" is filler.

## Exactly three decisions

The section is the point of the brief. Each decision must be one only the owner can make: a tradeoff, a commitment, a price, a person, a direction. Not a task they could delegate.

Each one carries the options in one line each and what the owner needs in order to choose.

```
1. **Whether to take the Rowan retainer at the rate they proposed.**
   Take it at their number and fill February, hold your rate and risk the gap.
   You need: your February capacity, which is the only piece I could not find.
```

Three failure categories for the count:

1. **Too few real ones.** Only one genuine decision this week. Say that: "One real decision this week. The other two things I flagged are tasks, and they are in the stalled section." Do not invent two.
2. **Too many.** Seven qualify. Pick the three with the shortest fuse, and add one line: "Four more decisions are queued, the soonest is the studio lease on the 20th."
3. **The disguised task.** "Decide whether to reply to Dana" is not a decision, it is a reply that belongs in the follow-through queue. Strip these out before ranking.

## Read-only, three failure categories

1. **The direct instruction that belongs to another skill.** The owner reads the brief and says "great, chase the two unpaid invoices for me." Write the chase drafts, say where they are, and hand the saving of them to the rules that govern `save-draft`. This skill still calls nothing itself. Those two chase bodies are email, so they carry the voice rule with them. **Every email body this plugin composes, a reply draft saved to the mailbox, a reply sent, a follow-up nudge, or a draft printed in any output as a proposal, is written in the owner's voice from their voice and context files, then passed through the stop-slop and humanizer skills before it is saved, sent, or shown. The owner's own voice wins any conflict with a style rule.** See `references/email-voice.md`. The reset's own prose is a report and is not covered by it.
2. **The action that feels like part of the analysis.** Reading the stalled threads would be tidier if you labelled each one as you went, and `label` may well be enabled. It stays off here. This skill takes no action even when an action is turned on. Name the threads in "What stalled" and leave them exactly as you found them.
3. **The tidy finish.** Everything in the brief is resolved except three newsletters cluttering the week's mail, and `archive` is enabled and covers them. Do not archive them on the way out. The brief ends where reading ends, and an action taken here has no place in this skill's contract.

## Sources

Use only what `Approved Sources` lists. Do not reach into a mailbox that is out of scope because the week's story is incomplete without it. Say the story is incomplete and name what would complete it.

Never cite a source you did not actually read this run. If a route failed, the footer says so and the brief says which sections are thinner because of it. Name the route in that footer, not only the mailbox, because "Gmail through your Claude connector" and "Gmail through Zapier" fail for different reasons and get fixed on different screens.

With one of two mailboxes unreadable, the week's story is half a story. Say which half is missing and why, rather than presenting a partial week as the whole one.

## Escalation

Legal, financial, personnel, and emotionally charged matters appear in the brief as flagged risks or flagged decisions. They are described, never resolved, and never softened. If a client relationship is deteriorating, the brief says so in the words the evidence supports.

Every reset ends with the footer from `references/output-schemas.md`. The actions line always reads "none, all proposals", because this skill takes none.
