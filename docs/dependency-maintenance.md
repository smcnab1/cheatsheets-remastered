# Dependency maintenance

Reviewed on November 5, 2026, for the next update.

## Minimatch

Dependabot alert #88 reports [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). It affects minimatch versions `>=7.0.0 <11.0.1` when a caller processes an untrusted glob with `optimizationLevel >= 2`.

The lockfile contained minimatch 10.2.6 through oclif, ESLint and TypeScript ESLint. The version-scoped override `minimatch@^10` selects 11.0.4 for those consumers. It leaves filelist's minimatch 5.1.9 dependency unchanged; that version is outside this advisory's affected range. No extension command directly imports minimatch, and no inspected tooling caller enables optimization level 2. This fixes vulnerable dependency presence without claiming a demonstrated exploit in an extension command.

The dependency regression tests exercise the reported pattern-amplification case with a process timeout, check default and explicit expansion limits, and preserve ordinary CLI/lint matching and filelist inclusion/exclusion behavior. Version 10.2.6 timed out on the amplification input before the update. Build, typecheck, application tests and Raycast lint remain required before merging.

Use a current supported Node version for development. Minimatch 11.0.4 supports Node 20 or 22 and newer; the maintenance checks use Node 26.12.1.

Remove the override when the owning packages support a patched minimatch release themselves, then rerun these checks and `npm audit`. Do not replace it with an override for every minimatch version.

## Existing bot PRs

- PR #50 proposes axios 1.13.5. The baseline lockfile already resolves axios 1.20.0.
- PR #49 proposes js-yaml 3.14.2. The baseline lockfile no longer contains js-yaml. Application frontmatter uses the separate `yaml` package.

Neither PR needs to be applied or downgraded into this branch. GitHub alerts and PRs remain open until reconciled separately; a fix on this branch does not clear an alert on the default branch.
