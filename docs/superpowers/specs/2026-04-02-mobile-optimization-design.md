# Mobile Optimization — Design Spec
**Date:** 2026-04-02

## Summary

Fix 3 real bugs and add 2 UX improvements to make the app feel fully native on iOS. No new features; only targeted changes to existing components.

---

## Changes

### 1. Fix `safe-top` padding bug — `workout-header.tsx`

**Problem:** `py-3 safe-top` — the `safe-top` class (`padding-top: env(safe-area-inset-top)`) overrides the `py-3` top padding. On non-notch devices `env()` resolves to 0, removing all top padding. On notch iPhones there is no 12px baseline added on top of the inset.

**Fix:** Replace `py-3 safe-top` with `pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]` so the baseline padding and safe area combine instead of one overriding the other.

---

### 2. Fix bottom nav clipping — `layout.tsx`

**Problem:** `main` has `pb-20` (80px). The bottom nav height is `min-h-[56px]` + `safe-bottom` (adds `env(safe-area-inset-bottom)` ≈ 34px on iPhone X/11/12+). Nav grows to ~90px; content at the bottom of the page is hidden behind it.

**Fix:** Change `pb-20` to `pb-[calc(5rem+env(safe-area-inset-bottom,0px))]` so main padding always matches actual nav height.

---

### 3. Fix small tap target — `progress-view.tsx`

**Problem:** The `ExerciseChart` expand/collapse button uses `px-4 py-3` with no minimum height. At small font sizes this can fall below the 44px minimum touch target.

**Fix:** Add `min-h-[44px]` to the button's class list.

---

### 4. Add scroll snap to `WeekPills` — `week-pills.tsx`

**Problem:** Horizontal scroll on the day pills has no snap points. On mobile, a light swipe can stop between pills, requiring precise positioning.

**Fix:** Add `snap-x snap-mandatory` to the scroll container and `snap-start` to each pill button. Use `scroll-padding-left` on the container to account for the left edge gap.

---

### 5. Auto-scroll to current day on mount — `week-pills.tsx`

**Problem:** If the program has 5 days and the user is on Day 4, the current day pill may be off-screen when the page loads.

**Fix:** Add a `useRef` on the active pill and call `scrollIntoView({ behavior: 'instant', inline: 'nearest', block: 'nearest' })` in a `useEffect` on mount. Use `'nearest'` so it doesn't over-scroll on earlier days.

---

## Files Changed

| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Fix `pb-20` → safe-area-aware padding |
| `src/components/workout-header.tsx` | Fix `py-3 safe-top` → combined padding |
| `src/components/week-pills.tsx` | Add scroll snap + auto-scroll to current day |
| `src/components/progress-view.tsx` | Add `min-h-[44px]` to ExerciseChart expand button |

## Out of Scope

- No layout redesigns
- No new features
- No changes to chat page (already correct with `h-[100dvh]`)
- No changes to `globals.css` (fix is per-component, not systemic)
