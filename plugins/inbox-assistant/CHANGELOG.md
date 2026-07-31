# Changelog

## 3.5.1

Inbox Assistant now documents Claude's native marketplace update behavior
explicitly.

- Installation turns on Auto-update for MOAI Plugins because Claude leaves it off
  by default for third-party marketplaces.
- Update guidance explains that checks happen after startup and that the active
  session keeps the plugin version it loaded until a new session or, in Claude
  Code, `/reload-plugins`.
- Codex keeps its separate marketplace upgrade and reinstall path. Claude's
  Auto-update toggle does not update a Codex installation.
- The plugin contains no self-updater, SessionStart network version check, or
  stale-version blocker; Claude's native updater remains the only Claude update
  mechanism.

## 3.5.0

Inbox Assistant now installs and runs as a native ChatGPT/Codex plugin as well as a Claude Cowork plugin.

- Added the Codex plugin manifest and MOAI Codex marketplace catalog.
- Added Codex skill adapters for setup, test, schedule, status, tune, and pause. Each adapter delegates to the existing command workflow so both platforms use the same safety rules and behavior.
- Added platform-aware guidance for namespaced commands, connector availability, project files, scheduled tasks, and agent fallbacks.
- Added release validation that requires Claude and Codex manifests to match, requires both marketplace catalogs to contain every plugin exactly once, and installs every plugin through both CLIs in CI.

## 3.4.0

Inbox Assistant now ships from the MOAI Plugins marketplace instead of as a file to download and upload.

### What changes

Install the MOAI Plugins marketplace from `https://github.com/thomas-echezabal/moai-plugins`, then install Inbox Assistant from that marketplace. Cowork can check marketplace-installed plugins for new versions, so later fixes and improvements no longer depend on downloading another file.

### If you installed the downloaded file

Remove the uploaded Inbox Assistant, add the MOAI Plugins marketplace, and install Inbox Assistant from it. Then start a new Cowork session and run `/inbox-assistant:status`.

The plugin name, `/inbox-assistant:` commands, project files, action controls, ledger, and scheduled-task prompts are unchanged. Do not keep the uploaded and marketplace copies installed together.

### What did not change

Every action still starts switched off. The enable ritual, the auditor, receipts, kill switch, escalation categories, email-only scope, and voice guide work exactly as they did in 3.3.1.

## 3.3.1

Your Inbox Assistant stopped deciding your gender.

### What happened

The voice guide 3.3.0 introduced is a document about how one person writes, and the fastest way to write one is in the third person. So some guides came out describing you rather than talking to you, and picking a gender to do it. Once that language was sitting in a file it spread: briefs, file sections, and instructions all picked it up from the surface around them. Nobody was asked. It was inferred.

### The rule

Everything this plugin writes about you now speaks to you in the second person, or says "the owner" and "they". It never assigns you a gender. A gendered word about you appears in something it writes only when you have said it yourself, and never because of a name, a photo, or a "thanks, ma'am" somebody typed in an email. The rule is written down in `references/email-voice.md` alongside the voice rule it belongs next to, and it is cited from the two places that write your files: the voice read in setup, and the file-writing step of the setup command.

### The sweep

Every instruction file in the plugin was rewritten to match, because a model writes what the prose around it modelled. Commands, skills, agents, references, and the write-policy guard all now address you directly or stay neutral, and the example correspondents in them are neutral too. Nothing about behaviour moved: the six-condition consult, the enable ritual, the voice read, the receipts, and the escalation categories all read exactly as they did. A regression test in the portal repo fails the build if a gendered pronoun reappears.

The two vendored writing skills, stop-slop and humanizer, keep their upstream wording. Their generic style examples are somebody else's sample prose, not a description of you, and the sections this plugin wrote inside them were swept like everything else.

### If your files already read that way

Nothing to run and nothing to clean up. The next time a run edits a section of one of your files, it rewrites the owner-referring gendered language in that section as it goes. Sections it does not touch stay as they are, and there is no sweep and no announcement.

## 3.3.0

Your drafts sound like you now. Setup reads how you actually write and writes it down, and every email goes through two editing skills before you see it.

### Setup learns your voice

Stage 1 gained a step, and it asks you nothing. While it is drafting your files, it reads 30 or more of your own sent emails and writes a `## Voice guide` section into your `Task Settings`: your register with clients against vendors against your own team, your sentence rhythm, the greetings and sign-offs you really use, your punctuation and emoji habits, the phrases you reach for, the phrases you never use, how you open an ask, and how you say no. Every rule in it carries a real line of yours underneath it.

It reads your words and nothing else. Quoted threads, forwarded blocks, and other people's signatures are stripped before a message counts as a sample, so nobody else's writing shapes how you sound. If you have fewer than 30 sent emails it uses what is there and tells you the count. If your sent folder cannot be reached it says so and falls back to the defaults.

**Reading your mail for voice never changes what the plugin is allowed to do.** The voice read writes one section and one section only. It cannot add a VIP, widen a scope, or put a line in your `Boundaries`, and an instruction sitting in somebody's email is still not an instruction.

Anything you told it directly still wins. If you tuned your sign-off to "Talk soon" last week, that beats whatever your old mail shows.

### Every email goes through two editing skills

Two writing skills ship inside the plugin: **stop-slop**, which cuts filler phrases, formulaic structures, passive voice, and em dashes, and **humanizer**, which cuts inflated significance, promotional language, hedging, and the rest of the tells catalogued on Wikipedia's "Signs of AI writing" page. Every reply draft, every follow-up nudge, and every body printed in a brief as text to copy passes through both before it is saved, sent, or shown to you.

Your voice is still the authority. The skills strip the tells that make writing sound machine-made. They never overwrite a sign-off, a greeting, or a turn of phrase your own sent mail shows you actually use: where one of their rules and your recorded voice disagree, your voice wins. The pass itself is silent, so what lands in your brief is the finished body and nothing else.

Your voice guide is the first thing they read, so the two skills are stripping tells rather than deciding how you sound. Where one of their rules and your own writing disagree, your writing wins.

The rule is written down in `references/email-voice.md` and cited from every place that composes an email: the daily brief, the follow-through queue, the setup run's first drafts, the test run, and the prompt inside every scheduled task.

Your internal reports are not touched by this. The brief, the queue, and the Friday page keep their own shape and their own schemas.

### If you set up before this version

Nothing to run. The next time setup touches your files, whether that is turning on an action or a maintenance check, it does the voice read, shows you the summary, and appends the guide with your yes. Your other four files are not re-drafted and nothing else in `Task Settings` is touched.

### Attribution

- **stop-slop** by Hardik Pandya (https://hvpandya.com), MIT licensed. Vendored at `skills/stop-slop/`, licence at `skills/stop-slop/LICENSE`.
- **humanizer** v2.5.1 by Siqi Chen (https://github.com/blader/humanizer), MIT licensed. Vendored at `skills/humanizer/`, licence at `skills/humanizer/LICENSE`.

Both bodies are upstream's wording. The plugin changes only the frontmatter, a section naming where the owner's writing sample comes from in this plugin, and a note that the pass runs silently.

### What did not change

Every action still starts off. The enable ritual, the six-condition consult, the per-write auditor, the receipts, the kill switch, and the escalation categories are all untouched. A body that reads beautifully still passes every one of those gates before it goes anywhere, and the pass never fills a marked gap: a missing rate or date stays a marked gap.

## 3.2.0

The per-run limits are gone. Every action you have turned on now runs on everything that qualifies, instead of stopping at a number.

### Why

The numbers were a proxy for trust, and they were the wrong proxy. A limit of ten did not make archiving safer, it made a finished job look unfinished: ten messages cleared, twenty-four listed underneath as a proposal, and the same list waiting again tomorrow. Sending and deleting were capped at one a run for a different reason, duplicate protection, and that job belongs to the rules that guard against duplicates: write-enabled scheduled tasks are never allowed to overlap, and every action is written down before it happens.

So the ceiling came off all seven actions. What decides how much an action does is now the same thing that decides what it may touch at all: its `Scope`, its `Restrictions`, and whether you turned it on.

### What did not change

The one-time enable ritual lost only its limit step and keeps everything else: one action at a time, the exact tool named, the change shown on your real data first, the typed `ENABLE <ACTION> UNATTENDED`, and a real test you approve before anything is live. Sending and deleting still carry their extra risk sentence, which you read and confirm before the ritual goes any further. The kill switch, `/inbox-assistant:pause all`, the per-write auditor, the receipts, the escalation categories, and the list of things this plugin will never do are all untouched.

`/inbox-assistant:tune` keeps two powers over an action: narrow where it applies, or switch it off. Both are immediate and neither needs a ritual. Turning something back on is still the full ritual, including a fresh test.

### If you turned actions on before this version

Your `Task Settings` blocks may still carry a `Per-run limit:` line. Runs ignore it, so there is nothing to do and nothing you will notice. Setup removes the line the next time it edits that block for another reason.

## 3.1.0

Your Inbox Assistant is email only now. Everything to do with your calendar has been removed.

### Why

The module this plugin ships with teaches one thing: your mail, running through Zapier. The calendar half was a second surface with its own connectors, its own review, its own five actions, and its own ways to fail, and it was pulling attention away from the part people actually use every morning. One surface, done well, beats two done adequately. So the calendar review, the calendar reading, and every calendar action are gone, and what is left is the daily brief, the follow-through queue, and the weekly owner brief.

Three jobs instead of four. The brief is your mail. The queue is your mail. The Friday page is what moved, what stalled, and the three decisions only you can make.

### What happens to the calendar actions you already turned on

Nothing is deleted from your settings file. If you turned on `event-create`, `rsvp`, or any of the other three, those blocks stay exactly where they are in your `Task Settings`, with everything you recorded in them.

They are retired rather than disabled. A retired block is never read during a run, never checked before a write, never offered by the enable ritual, never testable, and never tunable. Setup mentions them to you once, in a sentence, the first time it meets your file, and then never again. There is nothing for you to do and nothing to clean up.

### Your Zapier server

Google Calendar and Outlook Calendar can simply be disconnected there. Your Inbox Assistant will never call them again, so leaving them connected costs you nothing but removing them is one less tool exposed for no reason. Gmail or Microsoft Outlook stays exactly as it is.

### What did not change

Every action still starts off. The enable ritual is unchanged. The auditor still runs once per write. The kill switch still works the same way. `/inbox-assistant:pause all` still stops everything. The escalation categories are still written into your `Boundaries` file whether or not you mention them. Your scheduled tasks for the brief, the queue, and the weekly reset keep running as they are.

## 3.0.1

Setup's VIP question now always prints the drafted names, each with a word on why it is there, in the message itself before asking whether anything should change. A question widget cannot carry the list, and you should never be asked to approve a list you have not seen.

## 3.0.0

New name, new command namespace, and a setup that does the work before it asks you anything.

### It is called Inbox Assistant now

The jobs are the same: your daily brief, your follow-through queue, and your weekly reset. Two things changed. The name on it, with a new prefix on every command, and setup itself, which now drafts your files before it asks you anything and is covered further down. `/moai-chief-of-staff:setup` is now `/inbox-assistant:setup`, and the same for `test`, `schedule`, `status`, `tune`, and `pause`.

**If you had the old plugin, this is a separate install.** Remove **MOAI Chief of Staff**, install **Inbox Assistant**, and run `/inbox-assistant:setup`. The commands moved namespaces, so the old prefix stops being the way in.

Your saved files come across. The old plugin wrote them with a prefix in the name, and setup finds those, renames them, and changes nothing inside them:

| Old file                  | New file              |
| ------------------------- | --------------------- |
| MOAI Business Profile     | Business Profile      |
| MOAI Approved Sources     | Approved Sources      |
| MOAI Boundaries           | Boundaries            |
| MOAI Task Settings        | Task Settings         |
| MOAI Chief of Staff State | Inbox Assistant State |

Your VIPs, your boundaries, your tuning history, your last-tested records, and every action you had turned on all survive the rename. Setup says in one line that it renamed them, and moves on. Scheduled tasks created from here carry the new name prefix, and an old one gets recreated rather than renamed.

Leaving both plugins installed is worth avoiding: two plugins means two schedules and two ledgers, and the old one's tasks would be looking for files that no longer exist under those names.

### Setup got much shorter

Stage 1 used to be eight questions asked one at a time, then five files read back and approved one at a time. It is now draft-first:

- **It drafts everything before it asks you anything.** From the business context you already gave the academy, plus one bounded read of your real mail: recent senders point at your VIPs and your approved sources, and your own sent mail shows your voice. Everything else takes a sensible default, and every default is named in the summary so you can move it.
- **Two questions, at most.** When your Daily Brief should arrive, and anyone who should be a VIP that your mail did not reveal. If what you already told the academy answers one of them, it does not get asked.
- **One review instead of five.** A nine-line summary of everything drafted across all five files, one "anything to adjust?", and then all five save together. No file is read back on its own.

The real brief on your real inbox at the end of stage 1 is unchanged, and it is still the point of the whole thing.

**The safety model did not move.** Every action still starts off, the enable ritual is unchanged, the auditor still runs once per write, the kill switch still works the same way, and the escalation categories are still written into your Boundaries file whether or not you mention them. One rule got sharper rather than looser: because setup now reads your mail to draft your files, it says explicitly that nothing read out of a mailbox can add or remove a boundary, touch an action control, or count as an instruction. A sender who asks to be treated as important is evidence about that sender, not a setting.

## 2.0.1

Copy only: every pointer at the Zapier lesson now uses its current title, Turn On Automation. Nothing about the commands, the safety architecture, or the actions changed.

## 2.0.0

The version where your Inbox Assistant can do things, and where every one of those things is off until you turn it on.

### The change you will feel first

**Draft-saving is now opt-in.** In 1.1.0, a run saved drafts into your mailbox whenever your Zapier account happened to have a draft tool connected. In 2.0.0 nothing writes until you have turned that specific action on and tested it, so after upgrading your drafts come to you as text in the brief until you and Claude spend two minutes turning `save-draft` on together.

Nothing else about your briefs, queues, or reviews changes. Same shape, same voice, same schedules.

### Setup is now two stages

Stage 1 is reading: the connector check, a live verification that it can really read your mail, the same eight intake questions, your files, and then a real brief on your real inbox before the session ends. Stage 2 is writing, it is optional, and it happens one action at a time.

Stage 1 on its own is the read-only tier and it is a supported way to use this indefinitely.

### Every action governed separately

`save-draft`, `send-reply`, `archive`, `delete`, `move`, `label`, `mark-read`.

Each one has its own block in your `Task Settings` file recording its status, the exact Zapier tool it uses, what it may touch, its per-run limit, the phrase you typed to enable it, and the date it was last tested. Turning one on takes the exact tool named, an example on your real data, a per-run limit, a typed `ENABLE <ACTION> UNATTENDED`, and a live test you approve. Switching one off takes one sentence.

Default limits: 5 a run for `save-draft`. 10 a run for `archive`, `move`, `label`, and `mark-read`. 1 a run for `send-reply` and `delete`, which never goes higher.

Once an action is on and tested, a scheduled run may take it. That includes sending and deleting. See the honest-limitations note below.

### Your safety ledger

Your saved files are now four context files plus one safety ledger, `Inbox Assistant State`. The four context files are unchanged and still yours. The safety ledger is new: the plugin writes it and you read it through the new `/inbox-assistant:status` command. It holds the setup stage, the safety switch, connector health, your scheduled tasks, a checkpoint per skill so a run knows where it left off, the message identifiers already handled, a receipt for every action taken, and anything that did not finish.

Identifiers and dates only. No message bodies, no credentials, no server URLs.

### New

- **`/inbox-assistant:status`.** What is connected, what is turned on, what is scheduled, when each skill last finished, and what needs your eyes. It reads and never writes.
- **`/inbox-assistant:pause all`.** Pauses every scheduled task, then sets a safety switch that stops business writes even mid-run. Resuming always asks about both.
- **`/inbox-assistant:test controls`.** Dry-runs every action you have turned on, shows the auditor's verdict on each, then offers one real smallest-possible test per action.
- **Agents.** `inbox-analyst` reads at volume with native tools only and returns structured evidence. `task-auditor` checks every write against your action controls and returns approve or deny with a reason. The main session makes every write itself.
- **A PreToolUse hook.** Independently blocks a native-connector write and any Zapier action that is not enabled and tested. The one exception it allows is the single supervised bootstrap call inside `/inbox-assistant:test controls`, which is how an action gets tested at all, and it needs your explicit yes in front of it. Defense in depth, never the load-bearing layer.

### Changed

- Scheduled task prompts carry a new preamble, marked `Preamble: v2`. The prompt-injection rule in it is unchanged from 1.1.0, word for word.
- `/inbox-assistant:schedule` now takes exactly one skill per invocation, and it enforces non-overlapping cadences: at most one write-enabled task per skill, and no two write-enabled tasks sharing a start time.
- `/inbox-assistant:tune` can now lower a per-run limit, raise one up to its ceiling, and switch an action off in one step. It can never turn one on.
- Setup now verifies each read route with one live no-side-effect read instead of trusting the tool list.
- Personal Microsoft accounts get a truthful answer at setup: the Outlook connector is built for work and school accounts and does not reach outlook.com or hotmail.com, so the route is Zapier.

### If you are upgrading from 1.1.0

Run `/inbox-assistant:setup`. It detects the upgrade and does not re-run the intake.

It will offer to pause your existing scheduled tasks first, before touching anything. Your existing tasks are safe to leave running, because the old preamble takes no action at all, which is stricter than the new one. They simply cannot use anything you turn on and they do not keep the ledger, so status will flag them as "recreate via /schedule". Recreating one creates and verifies the new task before deleting the old, never the other way round.

Your four context files are read, not rewritten. The new `## Action controls` section is appended to `Task Settings` with every action off, and nothing else in that file is touched.

### Honest limitations

The four context files and the ledger have no locking. Two runs writing at the same moment can lose a row, and a crash between a call and its receipt can leave an outcome unknown. So an action can, in a rare case, happen twice.

The mitigations are all on by default: sending and deleting are capped at one per run, write-enabled scheduled tasks are never allowed to overlap, every action is written down before it happens, and anything ambiguous is surfaced for you rather than retried.

This plugin promises an audit trail and cautious behavior on uncertainty. It does not promise exactly-once execution, and no copy in it will ever imply otherwise. If that tradeoff is not one you want, leave the writing actions off.

### About the hook

The PreToolUse hook ships only after five checks pass on a clean account: a native write is denied, an enabled and tested Zapier action is allowed, a disabled action is denied, a renamed `Task Settings` file causes a fail-closed denial, and a cloud run with the machine asleep completes with the hook demonstrably firing. Two more cases are checked alongside them: a side-effecting read tool, and a move whose destination is Trash, which has to be classified as `delete` and denied when that class is off.

If any of those five fails, the release ships without the hook and the safety model is unchanged, because the hook was never the layer holding the door.

## 1.1.0

Native connectors became the primary read route, with Zapier as the read fallback and the only write route. Added the connector matrix, the read-route-is-not-a-write-route trap, and the read-only tier as a supported configuration.

## 1.0.0

First release. The output skills, four context files, the safety contract, scheduled tasks, and Zapier for saving drafts.
