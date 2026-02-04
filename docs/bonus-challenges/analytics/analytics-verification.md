# Analytics Verification Guide

This guide covers how to set up and verify **all three** analytics challenges:

- **Challenge 1:** Google Analytics 4 (GA4) setup in the Next.js app  
- **Challenge 2:** Client-side conversion tracking (micro- and macro-conversions)  
- **Challenge 3:** A/B testing (variant assignment, persistence, outcome tracking)

You can verify conversion tracking **without** GA (using debug logs), or **with** GA (using Network tab and GA4 reports).

---

## How debug mode and the GA key work

| Env var | Effect |
|--------|--------|
| **`NEXT_PUBLIC_ANALYTICS_DEBUG=true`** | Logs every analytics event to the **browser console** (e.g. `[Analytics] listing_view ad_slot_id=...`). Does **not** send data anywhere by itself. Use this to confirm that the right events fire at the right time. |
| **`NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...`** | Loads the GA4 script in the app and **sends** events (and page views) to **Google Analytics**. Without this key, events are never sent to any server—they only run in your code (and appear in the console if debug is on). |

**In "actual" (production) use:**

- **Without the GA key:** Events are fired in code but never leave the browser. No data in GA. Debug mode is the only way to see them (console).
- **With the GA key:** Events are sent to Google Analytics. You see them in GA4 (Reports, DebugView). You can still turn on debug to see the same events in the console while developing.

**Do both challenges need the GA key?**

- **Challenge 1 (GA setup):** Yes. The challenge is to integrate GA4 and track events there. Without a Measurement ID, GA is not integrated and Challenge 1 is not fully satisfied.
- **Challenge 2 (Conversion tracking):** The *implementation* (events, hooks, timing, data) is complete either way. You can verify behavior with debug mode only. For conversion events to **actually reach GA4**, you need the key. So: Challenge 2’s code is done without the key; to see conversions in GA you need the key.

---

## Part 1: Google Analytics setup (Challenge 1)

### What's implemented

- **GA4** is integrated via `@next/third-parties` (`GoogleAnalytics` in the root layout).
- The script loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
- **Page views** are sent automatically by the GA script.
- **Custom events** are sent via `sendGAEvent()` from `@next/third-parties/google`, used by `lib/analytics.ts`.

### Setup (required only if you want GA)

1. Create a **GA4 property** in [Google Analytics](https://analytics.google.com/) and copy the **Measurement ID** (e.g. `G-XXXXXXXXXX`).
2. In your **project root**, add to **`.env`** or **`.env.local`** (not `.env.example`—that file is not loaded at runtime):
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Restart the dev server so the env var is picked up.

### Verify GA is loaded

1. Open the app in the browser and open **DevTools → Network**.
2. Filter by **"google"** or **"gtag"** or **"collect"**.
3. Reload the page. You should see requests to `https://www.googletagmanager.com/...` (script) and to **google-analytics.com** / **googletagmanager.com** (e.g. `collect` or `g/collect`) for page views.
4. Optional: In GA4, use **Admin → Data Streams → [your stream] → DebugView** and enable debug mode (e.g. via the browser extension or `gtag('config', 'G-XXX', { 'debug_mode': true })`). You should see `page_view` and, when you trigger actions, custom events in real time.

If you see the GA script and collect requests, Challenge 1 (GA setup) is working.

---

## Part 2: Conversion tracking verification (Challenge 2)

### Option A: Verify without GA (debug logs)

You can confirm that conversion events fire correctly **without** configuring Google Analytics.

1. In **`.env`** or **`.env.local`** add:
   ```bash
   NEXT_PUBLIC_ANALYTICS_DEBUG=true
   ```
2. Restart the dev server.
3. Open the app and **DevTools → Console**.
4. Perform the actions in the checklist below. You should see single-line logs like:
   - `[Analytics] listing_view ad_slot_id=abc ad_slot_name=My Slot user_type=guest`
   - `[Analytics] newsletter_signup`
   - `[Analytics] conversion_newsletter_signup`

Remove `NEXT_PUBLIC_ANALYTICS_DEBUG` or set it to `false` when you're done.

### Option B: Verify with GA (Network + GA4)

If you've completed Part 1 and set `NEXT_PUBLIC_GA_MEASUREMENT_ID`:

1. Open **DevTools → Network** and filter by **"google"** or **"collect"**.
2. Perform the actions below; you should see requests whose payload includes the event names (e.g. `en=listing_view`, `en=cta_book_click`).
3. In GA4 (**Reports → Engagement → Events**, or **DebugView**): after a short delay (or in real time in DebugView), you should see the same event names.

---

## Checklist: what to do and what should fire

Use **Console** (debug on) and/or **Network** (GA configured) and confirm the following.

### 1. Listing view (micro-conversion)

| What you do | What should fire (once per page) |
|-------------|----------------------------------|
| Open marketplace, click an ad slot to open its **detail page** | `listing_view` with `ad_slot_id`, `ad_slot_name`, `user_type` |
| Click another ad slot (same tab, client-side nav) | A **new** `listing_view` for the new slot |
| Refresh the same detail page | One `listing_view` again (no duplicate from the same load) |

**Where:** Marketplace → click any listing → detail page.  
**Console:** Look for `[Analytics] listing_view ...`.  
**Network (GA):** Request payload should include `en=listing_view`.

---

### 2. "Book this placement" (micro + macro)

| What you do | What should fire |
|-------------|------------------|
| On an ad slot **detail page**, click **"Book this placement"** | `cta_book_click` (micro) with `ad_slot_id`, `ad_slot_name` |
| Complete the booking (submit and succeed) | `conversion_placement_booked` (macro) with same ids |

**Where:** Marketplace → [any listing] → "Book this placement" → fill form and submit.  
**Console:** First `cta_book_click`, then after success `conversion_placement_booked`.

---

### 3. "Request a quote" (micro + macro)

| What you do | What should fire |
|-------------|------------------|
| On an ad slot **detail page**, click **"Request a quote"** (modal opens) | `cta_quote_click` (micro) |
| Submit the quote form successfully | `quote_submitted` and `conversion_quote_submitted` (macro) |

**Where:** Marketplace → [any listing] → "Request a quote" → fill and submit.  
**Console:** `cta_quote_click` when opening modal; `quote_submitted` and `conversion_quote_submitted` on success.

---

### 4. Newsletter signup (macro)

| What you do | What should fire |
|-------------|------------------|
| Submit the **newsletter** form (e.g. in footer) successfully | `newsletter_signup` and `conversion_newsletter_signup` |

**Where:** Any page that has the footer (e.g. home or marketplace) → footer newsletter form → submit.  
**Console:** `newsletter_signup` and `conversion_newsletter_signup`.

---

### 5. Dashboard actions (optional)

| What you do | What should fire |
|-------------|------------------|
| **Sponsor:** Create a campaign | `campaign_created` |
| **Publisher:** Create an ad slot | `ad_slot_created` |

**Where:** Dashboard (sponsor or publisher) → create campaign / create ad slot → submit.

---

## Summary: events you should see

| Event name | When it fires |
|------------|----------------|
| `listing_view` | View ad slot detail page (once per page/navigation) |
| `cta_book_click` | Click "Book this placement" |
| `cta_quote_click` | Click "Request a quote" (modal opens) |
| `quote_submitted` | Quote form submitted |
| `conversion_placement_booked` | Placement booking completed |
| `conversion_quote_submitted` | Quote form submitted (macro) |
| `conversion_newsletter_signup` | Newsletter form submitted (macro) |
| `newsletter_signup` | Newsletter form submitted |
| `campaign_created` | Sponsor created a campaign |
| `ad_slot_created` | Publisher created an ad slot |

If you see these in the **Console** (with debug on) or in the **Network** tab / GA when you do the matching actions, both analytics setup (Challenge 1) and conversion tracking (Challenge 2) are working as intended.

---

## Part 3: A/B testing (Challenge 3)

### What's implemented

- **`lib/ab-test.ts`**: `getOrAssignVariant()`, `useABTest()` hook. Variant is stored in **localStorage** (key `ab_<testId>`) so the same user sees the same variant. Supports **multiple tests** (different test ids) and **percentage-based splits** via `weights`.
- **Example test:** Marketplace CTA button text — test id `cta-button-text`. Variant **A**: "Request This Placement"; Variant **B**: "Get Started Now".
- **Tracking:** `ab_exposure` fires **once per page view** when you open a marketplace listing detail (experiment_id, variant). Quote CTA click and quote conversion events include `ab_variant` so outcomes can be measured per variant in GA.
- **Debug override:** Force a variant via env, e.g. `NEXT_PUBLIC_AB_DEBUG_CTA_BUTTON_TEXT=A` or `=B`. No external account required.

### Verify A/B testing (code first, then GA)

**Step 1 – Confirm the code fires (browser console)**  
Set `NEXT_PUBLIC_ANALYTICS_DEBUG=true` in `.env`, restart the dev server, open DevTools → **Console**. Go to **Marketplace** → open **any ad slot detail page**. You should see a line like:

`[Analytics] ab_exposure experiment_id=cta-button-text variant=A` (or `variant=B`).

If you see that, the event is being sent. If you don’t, the problem is in the app, not GA.

**Step 2 – Where to see it in Google Analytics**  
GA4 does **not** show an “ab_” section or filter. The event appears under its **exact name**:

- In GA4 go to **Reports** → **Realtime** (or **Realtime** in the left nav).
- In the Realtime report, find the card **“Event count by Event name”** (or **“Events”**).
- In that list, look for the event named **`ab_exposure`** (the full event name, not a prefix).
- Each time you open a listing detail page, the count for `ab_exposure` should go up.

To see **parameters** (experiment_id, variant): use **DebugView** (Admin → Data Streams → your stream → **DebugView**; enable debug mode with the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) extension), or **Reports** → **Engagement** → **Events** (data can be delayed).

**Step 3 – UI / variant**  
- Two browsers or incognito: one CTA label (“Request This Placement” vs “Get Started Now”); each browser keeps the same variant on reload.
- Clear storage to re-randomize: DevTools → Application → Local Storage → delete `ab_cta-button-text` → reload.
- Force variant: in `.env` set `NEXT_PUBLIC_AB_DEBUG_CTA_BUTTON_TEXT=A` (or `B`), restart, reload.

If the CTA label matches the stored variant and you see `ab_exposure` in console and in GA, Challenge 3 is working.

---

## Summary: events you should see

| Event name | When it fires |
|------------|----------------|
| `listing_view` | View ad slot detail page (once per page/navigation) |
| `cta_book_click` | Click "Book this placement" |
| `cta_quote_click` | Click "Request a quote" (modal opens); may include `ab_variant` |
| `quote_submitted` | Quote form submitted; may include `ab_variant` |
| `conversion_placement_booked` | Placement booking completed |
| `conversion_quote_submitted` | Quote form submitted (macro); may include `ab_variant` |
| `conversion_newsletter_signup` | Newsletter form submitted (macro) |
| `newsletter_signup` | Newsletter form submitted |
| `campaign_created` | Sponsor created a campaign |
| `ad_slot_created` | Publisher created an ad slot |
| `ab_exposure` | A/B test: one per listing detail page view (experiment_id, variant) |

If you see these in the **Console** (with debug on) or in the **Network** tab / GA when you do the matching actions, all three analytics challenges are working as intended.

---

## Environment variables reference

| Variable | Where to set | Purpose |
|----------|----------------|--------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `.env` or `.env.local` | Enables GA4; script and events are sent only when this is set. |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | `.env` or `.env.local` | Set to `true` to log all analytics events to the browser console (for verification without GA). |
| `NEXT_PUBLIC_AB_DEBUG_CTA_BUTTON_TEXT` | `.env` or `.env.local` | Force A/B test variant for the CTA button: `A` or `B`. Used to verify both variants without clearing storage. |

See `.env.example` for a template; actual values must be in `.env` or `.env.local`.
