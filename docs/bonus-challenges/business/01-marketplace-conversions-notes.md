# Bonus Business #1: Marketplace Conversions — Notes

## Problems identified

1. **Grid → Detail (click-through)**  
   - Cards looked flat: basic border, no hover feedback, no clear “this is clickable” cue.  
   - Price and availability were easy to miss.  
   - No visual hierarchy to make one listing stand out over another.

2. **Detail → Booking (conversion)**  
   - Value proposition (“why book”) was missing; buyers had to infer benefits.  
   - Price was plain text; it didn’t feel like a clear offer.  
   - CTAs were small and looked secondary.  
   - No urgency or trust copy (e.g. “reserve your spot”, “direct partnership”).

3. **Unauthenticated / errors**  
   - 401 showed a generic “check your connection” message, so users didn’t know they needed to sign in.  
   - Sign-in action was easy to miss (low contrast).

## Hypothesis

- Making grid cards more like “listings” (shadow, hover lift, “View details →”) will increase click-through.  
- Adding a short value prop and a highlighted price on the detail page will reduce hesitation.  
- Making the primary CTA (Book / Request quote) larger and clearer will increase conversions.  
- Telling unauthenticated users to “Sign in” with a visible button will reduce drop-off from 401s.

## Changes implemented

- **Grid:** Card polish (rounded-xl, shadow, hover lift, border highlight), clearer hierarchy (title, type pill, publisher, description, availability + price), “View details →” link.  
- **Detail:** Value line (Direct partnership · Clear pricing · No hidden fees), highlighted price block, “Available — reserve your spot”, section “Book or get a quote” with supporting copy, larger primary/secondary CTAs with shadow and active state.  
- **Errors:** ApiError with status; 401 → “Sign in to view the marketplace” + prominent “Sign in” button; other errors → “Unable to load marketplace” + “Try again”.

## How to measure

- **Events (e.g. GA4 or custom):**  
  - `marketplace_view` (grid page load)  
  - `listing_click` (click to detail, with `listing_id`)  
  - `detail_view` (detail page load, with `listing_id`)  
  - `cta_quote_click` / `cta_book_click` (with `listing_id`)  
  - `quote_submitted` / `placement_booked` (with `listing_id`)  
- **Funnel:** Grid views → Listing clicks → Detail views → CTA clicks → Quote/Book completions.  
- **Compare:** Click-through rate (listing_click / marketplace_view), detail conversion (quote or book / detail_view), and 401 → sign-in rate before/after the copy and Sign in button changes.
