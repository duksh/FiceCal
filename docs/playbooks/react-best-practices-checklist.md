# React Performance Checklist (Top 10 for FiceCal)

Use this checklist for PRs that touch React/Next.js UI code (for example `apps/web/*`).

## Scope and intent

- Goal: prevent common performance regressions early in PR review.
- Applies to: new components, refactors, data fetching changes, bundle-impacting changes.
- Source intent: distilled from widely used React/Next performance guidance and adapted for FiceCal review workflow.

## Top 10 checks

1. **No async waterfalls for independent work**
   - Parallelize independent async calls (`Promise.all`) instead of serial `await` chains.

2. **Server-first data fetching by default**
   - Prefer server/data-layer fetching over client `useEffect` fetches unless interactivity requires client fetch.

3. **Avoid oversized initial bundles**
   - Lazy-load heavy or non-critical UI/code via dynamic import.

4. **Avoid barrel imports in hot paths**
   - Import directly from module paths when barrel files pull unnecessary code.

5. **Cache/dedupe repeated server fetches**
   - Reuse/cached fetches per request path where safe to avoid duplicate backend calls.

6. **Minimize client component boundaries**
   - Keep client components small and focused; avoid passing large object graphs as props.

7. **Do not derive state in effects when render derivation is possible**
   - Compute derived values during render/memoization instead of effect-driven state syncing.

8. **Prevent unnecessary re-renders**
   - Use stable props/handlers, functional `setState`, and `useRef` for non-render state.

9. **Optimize long/large list rendering**
   - Use pagination/virtualization/windowing for large lists and avoid rendering hidden rows.

10. **Keep hydration and event handling predictable**
   - Avoid avoidable hydration mismatches and use passive listeners for scroll/touch where appropriate.

## PR evidence expectations

For user-facing React changes, include at least one of:

- before/after performance note (bundle size, load time, render behavior), or
- rationale for why checklist items are not applicable.

## Review quick-pass

- If any of items 1-4 fail, treat as high-priority performance remediation before merge.
- Items 5-10 should be resolved or explicitly documented with rationale in PR.
