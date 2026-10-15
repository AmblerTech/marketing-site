# App screens on master (b4eebe5, 2026-10-15)

## Confirm — artist rights card (`features/artist/registrations/components/flow/rights-card.tsx`)
- Titles: "Master Rights" · "Publishing Rights"
- Row labels: "Master rights" · publishing compact label "Performance & Mechanical" (`PUBLISHING_COMBINED_LABEL`)
- Subtitle (accept/counter mode): "Rights are suggested by the label you can accept or counter it"
- Provenance: "Suggested by {label}" (publishing compact: "Same share for both · Suggested by {label}")
- Buttons: "Counter" · "Accept" ("Accept both" when publishing is split)
- Confirmed: ✓ "Accepted" (+ "Edit" button)
- Card backgrounds: master `linear-gradient(136.8deg, rgb(245,247,250) 0%, rgb(230,237,249) 100%)`, publishing `… rgb(235,230,249) 100%`; percentage in `#004EEB` bold

## Ship — registration card (`features/registrations/components/registration-card.tsx`)
- Shows: title (`displayTitle ?? name`) · "{artist} • {trackCount} tracks" · status badge · progress bar (gradient-linear-17) with % label
- Does NOT show: artwork/cover, ISRC
- Card: rounded-xl, border, faint brand-gradient tint background, padding 16
- Badge map (`registration-status-badge.tsx`): Draft gray · Sent to Artist blue · Contributor Input purple · Pending Approval warning · Ready to Ship success · Package Prepared success · Shipped success

## Differences vs the current demo
- Confirm: none.
- Ship: demo rows use "Kayo · Single" and no progress bar → switch to "{artist} • {n} track(s)" + progress bar. Demo planned covers → not in the app.
