## 2025-08-28 — /draw stability + next actions

**Status**
- `/draw` is stable with **Option A** syncing.
- No loopbacks or duplicate updates observed.

**Next**
1) **Mini Control Panel — Background**
   - Color: solid background with hex input and picker.
   - Pattern: grid or dots toggle.
   - Density: slider (4–40 px).
   - Opacity: slider (0–100%).
   - Snap: toggle snap-to-grid.
   - Reset: restore defaults.
   - Persist per doc via store and URL state.

2) **Throttle + Diff for `syncAll`**
   - Throttle outbound scene sync to ~60–120 ms.
   - Compute minimal diff by element `id` + `version` to cut payload.
   - Skip network if no diff.
   - Debounce persistence saves to ~500 ms idle.

3) **Wire NextAuth (remove bypass)**
   - Protect `/draw` and related API routes with session checks.
   - Add `middleware.ts` to guard app routes.
   - Replace client-side bypass with `useSession()` + redirect.
   - Verify CSR + API both reject unauthenticated calls.

**Acceptance Criteria**
- Control panel updates background instantly without touching element layer.
- Network inspector shows throttled `syncAll` calls and smaller payloads on minor edits.
- Unauthed user is redirected to `/auth/signin` and all API calls return 401.

**Implementation Notes**
- `MiniControls` component (client):
  - Lives at `components/workspace/MiniControls.tsx`
  - Props: `{ value, onChange }`
  - Store keys:  
    ```ts
    background: {
      kind: "solid" | "grid" | "dots",
      color: string,            // #111827, etc.
      density: number,          // px
      opacity: number,          // 0–1
      snap: boolean
    }
    ```
- Diff + Throttle sketch:
  ```ts
  // keep last snapshot hash by id->version
  const makeIndex = (els) => Object.fromEntries(els.map(e => [e.id, e.version]));
  let lastIndex = {};

  const calcDiff = (curr) => {
    const nextIndex = makeIndex(curr);
    const changed = curr.filter(e => lastIndex[e.id] !== e.version);
    lastIndex = nextIndex;
    return changed;
  };

  const throttledSyncAll = throttle((scene) => {
    const changed = calcDiff(scene.elements);
    if (changed.length === 0) return;
    post("/api/syncAll", { elements: changed, appState: scene.appState });
  }, 80); // 80–120 ms feels good
