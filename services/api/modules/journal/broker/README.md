# Journal broker sync (XTS)

Pulls a customer's executed trades from their broker's XTS system into the Journal, so they don't upload statements.

```
cron-job.org ──▶ POST /api/trigger-broker-sync ──▶ for each active, consented, Pro customer:
                                                      XTS TradeBook ──▶ broker_fills (raw, once each)
                                                                     ──▶ pair fills into trades ──▶ journal_trades (source = 'xts')
```

Everything is **off** until you turn it on, and nothing is read for a customer until an admin has approved their link.

## Where things are

| | |
|---|---|
| `roundTrips.ts` | Turns fills into completed trades (flat to flat, VWAP in and out). Pure; heavily tested. |
| `xts/` | The real XTS adapter: `http.ts` (pacing, retries), `session.ts` (login), `mapper.ts` (TradeBook rows), `diagnose.ts` (connection test). |
| `syncService.ts` | One customer's sync; `syncLinks` runs many and isolates failures. |
| `broker.runner.ts` | The daily run (one-at-a-time lock, heartbeat, consent and Pro checks, failure email). |
| `broker.scheduler.ts` | The timetable and the catch-up after a restart. |
| `backfill.ts`, `backfillFile.ts` | Adding earlier history from a file, and correcting the trades derived without it. |
| `xts/egress.ts` | The outbound address lookup and the optional fixed-address proxy. |
| `broker.controller.ts` / `broker.admin.controller.ts` | Customer and admin APIs. Routes are in `broker.routes.ts`. |
| `consent.ts` | The consent wording and its version. |
| `mockAdapter.ts` | Sample data for trying the pipeline. Refused in production. |
| `database/migrations/0019`, `0020` | Tables and review columns. |

## Turning it on

All in the server's environment (Render). Defaults are off.

| Variable | |
|---|---|
| `XTS_SYNC_ENABLED=true` | Master switch. |
| `XTS_ADAPTER=xts` | Use the real adapter (`mock` is for local trials and is ignored in production). |
| `XTS_BASE_URL` | The Interactive API **including its path prefix**, e.g. `https://host/interactive`. Not needed with host lookup. |
| `XTS_APP_KEY`, `XTS_SECRET_KEY` | The key pair from the broker. **XTS allows one session per pair**: a second login, from anywhere, ends the first. Never use the same keys on a laptop and the live server at once. |
| `XTS_HOSTLOOKUP_URL`, `XTS_ACCESS_PASSWORD`, `XTS_API_VERSION` | Only if the broker's setup uses host lookup. |
| `CRON_SECRET_TOKEN` | Already used by other cron triggers. Only needed for the outside trigger. |
| `DISABLE_BROKER_SYNC_CRON=true` | Turns the in-process timetable off on this process (for example on the web service when a worker does it). |
| `XTS_PROXY_URL` | Optional fixed-address proxy for broker traffic (see below). |
| `ADMIN_EMAILS` | Who can approve links (plus `xtincapital@gmail.com`). |

## Scheduling the daily run

The server schedules the sync itself (`broker.scheduler.ts`) once `XTS_SYNC_ENABLED=true`; no outside scheduler is needed. TradeBook only returns **today's** trades, so a missed run can't be made up the next day. Every run is safe to repeat (each trade is added once), so there are three:

| IST, Mon to Fri | Why |
|---|---|
| 15:45 | After the equity and F&O close. |
| 17:30 | Retry for anything the first run missed or failed on. |
| 23:45 | After the MCX close. Keep it before midnight: the trade book is for the day, so it is expected to be empty afterwards (to confirm with the broker). |

**Catch-up.** Ninety seconds after the process starts, it checks whether the latest cutoff (15:45 or 23:45) has been covered by a sync that succeeded or is still running, and if not, runs one. This rescues a host that sleeps or restarted during a deploy. It does nothing at weekends or after midnight.

**One sync at a time, across processes.** XTS allows one login per key pair, so a second sync would log the first one out. Every attempt writes a row in `broker_sync_runs` and then only the earliest live row carries on; the others mark themselves *skipped*. A running sync writes a heartbeat (customers done of total) about every 15 seconds, and one that has been silent for 15 minutes is taken to have crashed. So the web service, a worker, an outside trigger and the admin button can all be on together.

**Where to run it,** most to least robust:
1. A separate always-on **worker** (a Render Background Worker running `npx tsx worker.ts`, with the web service's environment variables). It starts this scheduler, and a long sweep isn't cut short by the web service sleeping. Then set `DISABLE_BROKER_SYNC_CRON=true` on the web service. See the commented block in `render.yaml`.
2. The web service alone, on a paid always-on plan.
3. The free tier: the web service sleeps after 15 idle minutes, so keep an outside job pinging `/health` every 14 minutes (already done for the newsletter). The catch-up covers most misses, but a sweep can still be cut short if the host goes idle part-way, which is the reason to prefer 1 once there are many customers.

**Optional outside trigger.** `POST https://<backend>/api/trigger-broker-sync?token=<CRON_SECRET_TOKEN>` from cron-job.org (no retry on failure; it answers 200 when it skips). UTC equivalents of the table: `15 10 * * 1-5`, `0 12 * * 1-5`, `15 18 * * 1-5`. It replies at once and the work continues in the background.

**By hand.** Admin → Broker links → *Run sync now*; the panel shows how far it has got.

A run takes 10 to 20 minutes for a few hundred customers (the broker allows about 1 request a second). Failures email the admins.

## The address the broker sees

If the broker only accepts calls from whitelisted addresses, Admin → Broker links → *Show our address* shows the address its requests leave from. A host like Render doesn't give one fixed address (its outbound addresses are a shared range that can change), so either ask the broker to accept the host's range, or send the broker traffic through a proxy that has a fixed address (a small server in India, or a fixed-address proxy service): set `XTS_PROXY_URL=http://user:password@host:port`. All broker calls then go through it, and *Show our address* reports the proxy's address. If the proxy is set but unreachable the calls fail; they never fall back to going direct from an address the broker hasn't accepted.

## Going live (in this order)

1. Migrations `0019` and `0020` applied.
2. Broker has given: the production URL, a test environment, the key pair, a dealer login with test clients mapped, and the enum tables.
3. Set the variables above on a **test** deployment (or locally), `XTS_SYNC_ENABLED=true`.
4. **Admin → Broker links → Test the broker connection.** First with no client code (login only), then with a test client's code on a day it has traded. Every step should pass; the failures tell you which assumption below was wrong.
5. Link a test account from Journal → Settings → Broker, approve it in Admin, press **Sync now**, and compare the trades against the broker's own trade book, entry by entry.
6. Press **Run sync now** in Admin to try the daily path, then decide where the scheduler runs (see above).
7. Agree the final consent wording with the broker and put it in `consent.ts` with a new `CONSENT_VERSION`. Do this **before** real customers link.
8. Set the variables on production.
9. Run the **pilot** below before opening it to everyone.

## Pilot and launch

Don't open sync to every customer on the first day. Try it with a few people, and judge it by their own statements. Two things in Admin → Broker links make that practical: the **Launch checklist** and **Check against a statement**.

### The launch checklist

At the top of Admin → Broker links. It works out, from the real settings and database, whether everything is in place: migrations, the switch, the adapter and its settings, the proxy, consent wording, admin emails, something to run the daily sync, how the last sync went, who can use it, requests waiting, and customers who need to re-confirm consent. Each line is **OK**, **worth a look** or **needs fixing**; only *needs fixing* blocks a launch. It never shows a key, password or address. Press *Check again* after changing a setting (Render redeploys when an environment variable changes).

"Consent wording is final" stays *worth a look* until `CONSENT_VERSION` no longer starts with `draft`. Treat it as a blocker for real customers even though the page doesn't.

### The trial group

Set `BROKER_SYNC_PILOT_EMAILS` (comma-separated, any case) and only those customers, and admins, can link a broker account or press *Sync now*. Everyone else sees "being tried with a small group first" in Settings and can still import statements. Leave it empty to open sync to every Journal Pro customer.

It only decides who may *start*. Someone already linked who is later taken off the list keeps being read by the daily run, can still disconnect, and can still confirm new consent wording, so changing the list never cuts someone off mid-trial.

### Before the pilot

1. The launch checklist shows nothing *needs fixing*.
2. The connection test (above) has passed against the broker's test environment.
3. `CONSENT_VERSION` is the agreed wording, not a draft.
4. `BROKER_SYNC_PILOT_EMAILS` lists the trial customers (3 to 5 is plenty), and `XTS_SYNC_ENABLED=true`.

### Choosing the trial customers

Pick people who are different from each other, since that is where mistakes hide: someone who trades equity intraday (MIS), someone who holds shares (CNC), someone in futures and options (NRML), and if you can, someone who trades often and someone who trades rarely. Ask each for permission to compare their journal with their own statements for the length of the trial, and say that you will see their trades.

### During the pilot (at least 5 trading days)

For each trial customer, each day:

1. Approve their link (*Check with broker* first), then let the daily run read them, or press *Run sync now*.
2. Get their tradebook for the day from the broker or from the customer (CSV or Excel).
3. Open their card → **Check against a statement** → choose the file. It compares trade by trade and changes nothing.

How to read the result:

- **Agrees** is the goal: every trade matches, and profit and loss before brokerage is the same on both sides.
- **Trades that differ** say what differs (entry price, exit price, quantity, exit date, profit and loss) with both sides shown. Prices are allowed a rounding difference of a paisa; profit and loss, a rupee.
- **In the statement, not in the journal** means the sync missed something. **In the journal, not in the statement** means it made something up. Both are serious.
- **Left out** lists what couldn't be compared, and why: trades from before the sync had any data for the customer (add them with *Add history from a file* if they matter), positions carried in from before the statement began, and trades still open after its last day. These are not failures.
- A statement needs **times**, not just dates, to be paired correctly. Executions on the same day at the same moment can't be put in order, and a buy and a sell that look simultaneous can be read as a short. Real broker tradebooks have times; a hand-made file may not.
- Brokerage isn't read from the broker yet, so profit and loss is compared *before* charges on both sides.

### Go or no-go

Go when, over the whole trial:

- Every trial customer's statements agree on every day compared, or every difference is understood and fixed (and the day compared again).
- No *in the journal, not in the statement* trades.
- The daily run succeeded on every trading day, or a failure was understood and fixed, and no customer was read twice or skipped without a reason.
- Admins got the emails for link requests and for any failure.

No-go if a disagreement has no explanation. Don't open it up while you can't say why a number differed. Note the day, customer and trade, check the broker's own trade book to see which side is right, and fix the cause before going on.

### Launch

1. Clear `BROKER_SYNC_PILOT_EMAILS` (so sync is open to every Journal Pro customer).
2. Watch the launch checklist and the last run in Admin every day for the first week; approve link requests promptly (they arrive by email).
3. Keep checking a couple of customers' statements for the first weeks, since new kinds of trades turn up.

### Rolling back

- **Stop reading everyone at once:** set `XTS_SYNC_ENABLED=false`. The daily run and *Run sync now* stand down, new links are refused, and customers see that sync isn't live. Nothing is deleted; set it back to true to resume. Days missed while it was off can't be fetched later (the broker's trade book is today only), though a tradebook file can be added as history.
- **Stop reading one customer:** *Revoke access* in their card.
- **Go back to a trial group:** set `BROKER_SYNC_PILOT_EMAILS` again. People already linked keep being read (see above); revoke any you don't want read.
- **Remove a customer's synced data:** they can choose *Disconnect → delete synced trades*, or an admin can ask them to. Trades they've written notes on are deleted too if they choose that, so it is their decision.

## What the connection test settles

These were written from the docs and have not met a live XTS server:

| Assumption | Test step |
|---|---|
| A login with just the key pair works (no browser `accessToken`) | Log in |
| `?clientID=` picks a client on TradeBook and Profile | Trade book is limited to the requested client |
| The fields we read exist | Execution rows have every field we read |
| `02-09-2026 12.58.04.072`-style times; day vs month settled by today's date | Execution times are in a format we read |
| Expired tokens come back as 401 or an error mentioning the token | Seen by the re-login tests; watch for repeated login failures in the logs |
| The base URL prefix (`/interactive` vs `/1interactive`) | Log in |

## Day to day

- **New link requests** arrive by email and in Admin → Broker links. Use *Check with broker* to compare names, then approve or reject (a note is needed to reject, and is shown to the customer).
- **Failures**: the daily run emails the admins when any customer fails or the whole run breaks; Admin shows the last run and which customers failed. Running again from Admin usually fixes a temporary problem.
- **Changing the consent wording**: edit `CONSENT_TEXT` and bump `CONSENT_VERSION`. Every existing link is paused until its owner confirms the new wording (a banner in their Settings).
- **A lapsed Journal Pro plan** pauses reading (the link stays). Days missed cannot be fetched later.
- **Cutting someone off**: *Revoke access* in Admin. Their imported trades stay unless they delete them (Disconnect → delete synced trades).

## Tradebook file import (needs no broker connection)

Journal → Trades → Import also reads a broker **tradebook file** (CSV, Excel or a PDF table with one row per buy or sell). `../fillsImport.ts` detects it, pairs the executions with the same engine the sync uses (`roundTrips.ts`), and shows the trades in the usual preview. It works for any broker whose export has a symbol, buy/sell, quantity, price and date; a file that has an exit price or P&L column is read as before.

What a file can't say, and what is done about it: with no product column, a cash-equity sale that has no earlier purchase in the file is taken to be old holdings and is **left out** (reported in the preview), not made into a short; times the file lacks are left empty; the file's own trade ids are used only when all present and all different; a newest-first file is put back in order (a single-day file can't be). A tradebook with a **product** column (MIS, NRML, CNC) is read exactly.

## Adding history (backfill)

The broker's trade book only covers today, so a customer's journal starts on the day they link, and a day the sync missed is gone. An admin can add earlier trades from the broker's own tradebook file: Admin → Broker links → open an active customer's card → *Add history from a file*.

- It reads a CSV or Excel tradebook (the same layouts as the Import dialog, above). If the file lists several clients it keeps only this customer's rows, and it refuses a file that has none of theirs.
- It shows what it would do first (executions read, trades it would add, correct or remove) and changes nothing until you press *Add this history*.
- Days the live sync already holds are left alone, so nothing is counted twice. Each execution gets an id made from its own details, so uploading the same file again, or an overlapping one, adds nothing.
- **It corrects earlier mistakes.** Earlier history can change a trade already in the journal: a position bought before the customer linked and sold after was first read as a short. The new history is combined with what is held, and each synced trade is added, corrected or removed to match. A trade is only changed or removed if nobody has touched it, which is checked against what the sync itself would have written and against the fields only the customer fills in (notes, strategy, tags, emotion, target, stop, margin). Anything touched is kept as it is and listed in the preview for someone to look at.
- If it stops part-way (a lost connection), run the same file again; it finishes the job.
- It won't run while a sync is running. A record of who added what is kept among the sync runs (source "backfill: <email>"); it never counts as a day's sync.
- PDF contract notes aren't read; use CSV or Excel.
- If the broker offers a back-office API instead of files, the only new piece is fetching executions for a date range; hand them to `planBackfill` and `applyBackfill` (`backfill.ts`).

## Known gaps

- Brokerage and taxes are not in TradeBook, so synced trades show brokerage 0 (profit before charges). Needs the broker's charges source.
- History only comes from a file an admin adds (above), or from a back-office API once the broker has one. Without it only trades from the day linking starts are there.
- Customers selling shares bought before they linked appear as "unmatched" (no trade is made) until their earlier purchases are added as history. Seeding opening positions from the broker's holdings would do it without a file, but needs real data to map the symbols.
- Ownership is checked by a person; an automatic check (e.g. an OTP) depends on what the broker offers.
- The statement check pairs trades by day, instrument, side and size, nearest prices first. A trade with the wrong size therefore shows as one trade whose quantity differs, not as one missing and one extra. It does not look at the order of trades within a day beyond that.
- Symbol parsing (strike, expiry, call/put) reads the symbol text. The MarketData instrument master would be more reliable.
