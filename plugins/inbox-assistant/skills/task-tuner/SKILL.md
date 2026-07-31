---
name: task-tuner
description: Turns the owner's plain-language corrections about an output into concrete, durable settings in their Task Settings file, and narrows where an action applies or switches it off, always showing the exact before and after. Use whenever the owner says a brief is too long, the wrong things are being flagged, drafts sound wrong, an action is reaching mail it should leave alone, or anything one of the three skills produces should be different from now on.
metadata:
  version: 3.0.0
---

# Task Tuner

## Platform compatibility

When running in ChatGPT or Codex, read `../../references/codex-compatibility.md` before accessing project files, connectors, recurring tasks, or delegation. Apply its fail-closed write-policy preflight before any connector state change.

A correction that only fixes today's output is a correction the owner has to repeat. This turns "the briefs are too long" into a line in a file that changes every future run.

## Contract block

**What it reads.** The correction in the owner's own words, the run being corrected, the current `Task Settings` including its `## Action controls` section, and `references/action-controls.md` for what tuning may touch.

**What it produces.** A concrete rule, the exact before and after of the setting, and once the owner approves, an updated `Task Settings` with a row appended to the tuning history.

**What it never does.** Change a setting without showing the before and after. Write to `Boundaries` without saying explicitly that a boundary is being changed. Turn an action on. Widen a scope. Interpret a correction about one run as a permanent rule without confirming that is what the owner meant.

**What needs your approval.** Every write to any of the owner's context files.

## The four steps

### 1. Translate the feeling into a rule

The owner's words are the input, not the output. Restate them as a rule specific enough to apply mechanically.

| The owner says | The rule |
|---|---|
| "The briefs are too long" | Daily brief capped at 350 words. Needs you today capped at 3 items. FYI capped at 3 lines. |
| "Never flag newsletters" | Any message from a sender in the known-noise list, or with a list-unsubscribe header, goes to Safe to ignore and is never counted in Needs you today. |
| "Warmer drafts" | Drafts open with the person's first name and no salutation line, use contractions, and close with "Talk soon" instead of "Best regards". |
| "Stop chasing Marcus" | Marcus Idowu is excluded from the follow-through queue in both directions. |
| "Only draft for the client mailbox" | `save-draft` scope narrowed from both mailboxes to `clients@` only. |
| "Stop archiving for now" | `archive` set to `Status: disabled`, in one step. |
| "I want the brief earlier" | Cadence change, not a settings change. Route to the schedule command. |
| "Start sending the easy ones" | Not a tuning change. Route to `/inbox-assistant:setup stage-2`. |

If the correction is ambiguous, ask one question before writing anything. "Too long" could mean fewer items or shorter items, and those are different settings.

### 2. Know exactly what you may do to an action

Two powers over the `## Action controls` section, and no others:

- **Narrow where an action applies** by taking a mailbox, a folder, or a sender out of `Scope`, or by adding a carve-out to `Restrictions`. Narrowing only ever reduces reach, so it needs no ritual.
- **Switch an action off** by writing `Status: disabled`, in one step, with no phrase to type and no waiting. Turning something off is always immediate.

Never write `Status: enabled` or `Status: pending-test`. Never touch `Zapier tool`, `Account route`, `Enabled on`, `Enable phrase recorded`, or `Last tested`. Never widen a `Scope` or remove a line from `Restrictions`. Those belong to the enable ritual, because the ritual is what tested them.

One more section is out of reach, for a different reason. **A voice correction is written into `## Draft voice`, never into `## Voice guide`.** The guide is a record of how the owner actually writes, built by setup from their own sent mail, and an instruction of theirs outranks it wherever the two disagree, so `Draft voice` is where the instruction belongs and it is already the field that wins. Editing the guide to match a correction destroys the record and leaves nothing to have outranked. If the owner wants the guide itself rebuilt, that is a fresh voice read and it belongs to `/inbox-assistant:setup`.

Three failure categories:

1. **The enable request in tuning clothes.** "Just let you send the easy ones" or "go ahead and start archiving." Say plainly that turning an action on takes the ritual in `/inbox-assistant:setup stage-2`, describe it in one line, and offer what tuning can do instead.
2. **The scope widened by a wish.** "Do the same thing for my second mailbox." The scope is what the test verified, so widening it is a setup conversation. Do not append a mailbox to a `Scope` line.
3. **The re-enable after an off.** The owner switched `archive` off last week and now wants it back. Off is one step, back on is the full ritual again, including a fresh test. Say that up front when something gets switched off, so the asymmetry is not a surprise later.

### 3. Check it against the boundaries

If the rule would relax a hard boundary or grant permission the safety contract does not allow, stop. Tuning changes ranking, filtering, length, voice, and reach. It never changes what Claude is allowed to do in kind.

Three failure categories:

1. **The rule that quietly implies permission.** "Handle the newsletters" reads like a filter but means archiving. Split it: the filter becomes a setting, and the archiving is either already on or it is a setup conversation.
2. **The correction that would silence an escalation.** "Stop flagging the Nadia thread, it is stressful." Do not write a rule that hides a flagged category. Offer the version you can do: move the flag out of the top position, keep it in the brief. Say why.
3. **The exception carved into a boundary.** "Archive the personal@ stuff too, just that one folder." `personal@` is on the never-read list, and a tuning change cannot reach across a boundary. Say which file holds that line and that changing it is a deliberate edit to `Boundaries`, not a preference.

### 4. Show the exact before and after, then save and log

Always. Never a description of the change, always the text.

```
File: Task Settings
Section: Output preferences

Before:
  Daily brief length: default
  Needs you today: up to 5 items

After:
  Daily brief length: 350 words maximum
  Needs you today: up to 3 items

This takes effect on tomorrow's brief. Want me to save it?
```

For an action change, show the block field itself:

```
File: Task Settings
Section: Action controls, save-draft

Before:
  Scope: clients@ and hello@

After:
  Scope: clients@

This takes effect on the next run. Want me to save it?
```

If the change touches `Boundaries`, say so in a separate sentence before the diff: "This one changes a hard limit, not a preference."

On approval, write the change and append to the tuning history table.

```
| 2026-08-04 | Daily brief length | default, up to 5 | 350 words, up to 3 |
| 2026-08-04 | save-draft scope | clients@ and hello@ | clients@ |
```

Then confirm in one line which skill changes and when the owner will see it. If they decline, change nothing and say so.

## One correction at a time

If the owner gives four corrections at once, translate all four, show all four diffs in one block, and let them approve or reject each. Do not batch them into a single yes.

## What tuning cannot fix

Some complaints are not settings problems, and saying so saves the owner from tuning in circles.

- **Missing data.** "The brief never mentions my Outlook mail" is a connection problem, not a setting. Point to setup, which checks whether that mailbox has a read route at all.
- **A capability that is off.** "Why are the drafts in the brief instead of in Gmail" means `save-draft` is not turned on, or its named tool is not visible. Point to `/inbox-assistant:status` to see which, then to setup stage 2.
- **Wrong cadence.** "It arrives too late" is a scheduled task problem. Point to the schedule command.
- **A capability that does not exist here.** "It should pay the invoices for me" is not a controllable action in this plugin and never will be. Say what it will do instead: surface them, with the numbers, every week.
