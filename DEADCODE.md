# Dead Code Audit Report

## Summary

Confirmed dead code candidates that can be safely deleted now:
- **0 full source files** (no complete TS/TSX runtime file is unreferenced)
- **0 classes**
- **2 TypeScript interfaces** unused across the codebase
- **1 build-time define value and related unused dependency/doc/env scaffolding** that is not consumed by runtime/app code

## Files to Delete

No full code files are conclusively safe to delete at this time.

## Functions/Methods to Delete

No functions or methods are conclusively dead.

## Classes to Delete

No classes are present.

## Variables/Constants to Delete

1. `ConnectionDetails` (interface) in `src/types.ts`
   - Exported but never imported or referenced anywhere in the repo.
   - No indirect runtime impact (type-only).

2. `TableItem` (interface) in `src/types.ts`
   - Exported but never imported or referenced anywhere in the repo.
   - No indirect runtime impact (type-only).

3. Vite define key `'process.env.GEMINI_API_KEY'` in `vite.config.ts`
   - Injected at build time, but there are no code references to `process.env.GEMINI_API_KEY` in `src/` or server plugin code.
   - Can be removed together with related unused Gemini scaffolding below.

4. Unused dependency and scaffolding tied to unused key above:
   - `@google/genai` in `package.json`
   - `GEMINI_API_KEY` setup guidance in README and `.env.example`
   - These are currently documentary/build leftovers with no callsites.

## Verification Notes

Audit used six perspectives:

1. **Static analysis**
   - Enumerated repository files and traced imports/usages.
   - Verified `src/main.tsx` entry imports only `App` + CSS.
   - Verified `vite.config.ts` references `testDbConnectionPlugin` and plugin is active.

2. **Entry point analysis**
   - UI entry: `src/main.tsx` -> `src/App.tsx`.
   - API entry: Vite plugin middleware in `testDbConnectionPlugin.ts` via `vite.config.ts` plugin registration.
   - All exported runtime functions are reachable from these roots.

3. **Configuration analysis**
   - Checked `package.json`, `vite.config.ts`, `.env.example`, and README.
   - Found Gemini env/dependency wiring not consumed by actual code.

4. **Test analysis**
   - No formal test suite files found.

5. **Dynamic/runtime dispatch analysis**
   - No reflection-style symbol lookup for the two interfaces (type-only).
   - No string-based runtime lookup of `GEMINI_API_KEY` beyond config/docs.

6. **Documentation analysis**
   - README/.env mention Gemini key, but no corresponding runtime usage exists.

Conservative exclusions (not marked dead):
- `metadata.json` not referenced by code, but could be consumed by external platform tooling (AI Studio metadata), so not deleted.
- `testDbConnectionPlugin.ts` is fully wired via Vite plugin and is active runtime code.

## Estimated Impact

Approximate removable footprint:
- `src/types.ts`: ~17 lines (two interfaces)
- `vite.config.ts`: 1 define line (plus optional `loadEnv` use simplification)
- `package.json` / `package-lock.json`: dependency tree reduction for `@google/genai`
- README + `.env.example`: small doc cleanup

Estimated total: **~25–60 lines of direct source/docs**, plus lockfile shrink from removing one unused package.
