# Modernisation Plan

## Decisions

| Decision | Choice |
|---|---|
| Build tool | Vite |
| Module format | ES modules, drop UMD |
| jQuery | Replace with native APIs |
| Bootstrap | Keep, move CDN → npm import |
| Language | TypeScript |
| Architecture | Classes with constructor injection |
| Test runner | Vitest (migrate from Jest) |
| `IView` contract | `load`, `showError`, `onAction` only |
| `IService` contract | `async load(): Promise<{a,b}>`, `set`, `undo` |
| Folder structure | Flat `src/` |
| Weights | Injected into `Scorer` and `BootstrapView` via constructor |
| Composition root | `main.ts` — only file that knows concrete classes |
| Delivery | Incremental PRs, CI green at each step |

---

## Target File Structure

```
src/
  types.ts              ← IService, IView, Item, Candidate, Match, ActionEvent
  scorer.ts             ← Scorer class (getCandidates, getWeight, isSameWs, doesContain)
  reconciler.ts         ← Reconciler class (controller)
  bootstrapView.ts      ← BootstrapView class (view)
  sampleDataService.ts  ← SampleDataService class
  main.ts               ← composition root (wires all concrete classes)
index.html              ← Vite entry point
vite.config.ts
tsconfig.json
```

---

## PR Sequence

### PR 1 — Vite Scaffolding

Add `vite.config.ts`, `tsconfig.json`, update `package.json` scripts (`dev`, `build`, `preview`). Move `index.html` to project root (Vite default). Existing JS files untouched. CI runs `npm run build` to confirm Vite wires up.

### PR 2 — TypeScript + Classes + Interfaces

Rename source files to `.ts`. Define `types.ts` with the following interfaces and types:

```ts
interface IService {
    load(): Promise<{ a: Item[], b: Item[] }>;
    set(aId: string, bId: string): void;
    undo(aId: string, bId: string): void;
}

interface IView {
    load(matchItem: Item, candidates: Candidate[], listA: Item[], listB: Item[], memento: Match[]): void;
    showError(status: unknown): void;
    onAction(type: ActionType, listener: (e: ActionEvent) => void): void;
}
```

Convert:
- `reconcile.js` → `Reconciler` class implementing constructor injection of `IService`, `IView`, and `Scorer`
- `reconcileBootstrapView.js` → `BootstrapView` class implementing `IView`; internal event dispatchers (`next`, `prev`, `undo`, `match`) removed from public API
- `reconcileTestService.js` → `SampleDataService` class implementing `IService`

`main.ts` replaces the inline `<script>` block in `index.html` and is the single place all concrete classes are instantiated and wired.

### PR 3 — Extract `Scorer`

Move `getCandidates`, `getWeight`, `isSameWs`, `doesContain` out of `Reconciler` into a dedicated `Scorer` class. Weights injected via `Scorer` constructor, satisfying OCP — scoring strategy is configurable without modifying `Scorer` or `BootstrapView`. A single `WEIGHTS` constant is defined in `main.ts` and passed to both `Scorer` and `BootstrapView`.

```ts
const WEIGHTS = { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 };
const scorer = new Scorer(WEIGHTS);
const view = new BootstrapView(container, WEIGHTS);
const controller = new Reconciler(service, view, scorer);
```

### PR 4 — Replace jQuery with Native APIs

Remove jQuery from all three modules:

- **`BootstrapView`** — `document.createElement`, `addEventListener`, `classList` replace all `$()` DOM calls
- **`SampleDataService`** — `async load()` with a plain object return replaces `$.Deferred`
- **`Reconciler`** — `await service.load()` replaces `$.when().then()`

jQuery removed from `package.json`. The `__mocks__/jquery.js` stub is no longer needed once Vitest is in place (PR 5).

### PR 5 — Migrate Jest → Vitest

Replace `jest` with `vitest` in `package.json`. Update `vite.config.ts` with a `test` block. Migrate all test files:

- `jest.fn()` → `vi.fn()`
- `jest.resetModules()` → no longer needed (class instances replace module-level singletons)
- Delete `__mocks__/jquery.js`

Add direct unit tests for `Scorer` — previously the scoring functions were private to the controller module and required `jest.resetModules()` gymnastics to test indirectly. As a standalone class, `Scorer` is testable with a simple `new Scorer(WEIGHTS)`.

---

## SOLID Violations Addressed

| Principle | Violation | Fix |
|---|---|---|
| SRP | `reconcile.js` combined state, algorithm, orchestration, and event wiring | Extract `Scorer`; `Reconciler` owns only state + orchestration |
| OCP | `WEIGHTS` hardcoded in source; changing scoring requires editing `Scorer` | Weights injected via constructor |
| LSP | Service and view contracts implicit; wrong object silently breaks at runtime | `IService` and `IView` TypeScript interfaces enforced at every injection site |
| ISP | `BootstrapView` exposed internal event dispatchers (`next`, `prev`, `undo`, `match`) on its public API | `IView` exposes only `load`, `showError`, `onAction` |
| DIP | Controller and view depended on concrete jQuery; service wired via setters | Constructor injection throughout; jQuery removed; all dependencies flow through interfaces |
