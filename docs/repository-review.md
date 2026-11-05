# Documentation and repository review

Initial review on 4 November 2026 against `fix/repository-frontmatter` at `06f191d3d5642b995f8c31cc31023f1f5f93a1a1` in `smcnab1/cheatsheets-remastered`.

## Maintenance update: 5 November 2026

[Raycast PR #33143](https://github.com/raycast/extensions/pull/33143) merged at `32c5ba98af4dc3162dfd0ff3e8d8e3ef35b8fe94` and [publication was confirmed](https://github.com/raycast/extensions/pull/33143#issuecomment-6649076226). This repository now carries the accepted runtime, tests, screenshots, API 2.11.0 dependency lock and exact published changelog. The Store review corrections include shared `useForm` validation and import field placeholders.

README, recovery guidance and roadmap now describe the released features. The obsolete workflow that copied `raycast-extension` over `main` has been removed, and the release issue template follows the current checklist. Historical branches are retained for reference. New development starts from current `main`.

The review below is historical evidence, including its original scope and approval boundaries. It is not the current release status. Dependency advisories and repository settings were not changed by this sync; there is still no test/build PR workflow. Current development and submission instructions are in [RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md).

## Delivery update: 4 November 2026

The original review below records the earlier preparation state. [Feature PR #51](https://github.com/smcnab1/cheatsheets-remastered/pull/51) merged using a merge commit at `bc037e2dd863e1f7dce1b6ef6436acf1a6a1fe3c`, preserving the accepted implementation and `bc089e40f13290a7f08705b7188c6cec28165a87`, a native-QA correction that displays full descriptions as wrapped plain text. The correction passed 155 automated tests, typecheck, lint, formatting, build, distribution integrity and one independent review with no actionable findings. Native QA used a separate synthetic extension namespace; cached content and personal records were preserved. Repository management was checked only as far as the GitHub sign-in screen; no OAuth grant or network sync was performed.

Documentation delivery is authorized after that feature merge. The original documentation commit `fc071972884e9b9e3fd136f163e679ddc9ab397f` and `fix/repository-documentation` remain unchanged. `fix/repository-documentation-delivery` starts from the verified merge commit and replays only that documentation change, resolving README/changelog overlap and updating this delivery evidence. The final diff contains only the five documentation files; the merged description implementation is unchanged. The documentation PR requires separate merge approval.

Native screenshots are retained outside the repository. The QA development runtime emitted a React navigation warning; no associated functional failure was observed. API upgrades, the 22 moderate local audit findings, Store submission and repository settings remain separate maintenance work. GitHub also reported 63 default-branch dependency alerts (34 high, 28 moderate and one low) on push; those aggregate alerts have not been triaged or accepted here.

## Scope and baseline

This delivery replays the five-file documentation commit onto merged feature baseline `bc037e2dd863e1f7dce1b6ef6436acf1a6a1fe3c`. Changes are limited to README, changelog, the existing recovery guide, the release checklist and this review. Extension source, tests, manifests, dependencies, assets and workflows remain unchanged. The owner authorized pushing and opening the documentation PR; merging it requires separate approval.

The completed independent review checked the frontmatter path in `src/markdown.ts`, `src/service.ts`, `src/search.ts` and `src/show-cheatsheets.tsx`, with the corresponding tests. Metadata remains a read-time projection of cached Markdown. Typed fields, bounds, invalid-input fallbacks, original-source preservation, search and unchanged stored identities are covered by the passing suite. That review was not repeated during delivery preparation; this documentation commit adds no feature behavior.

## Documentation changes

| File                        | Change                                                                                                                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                 | Replace the long operational overview with a concise user guide: installation, four commands, GitHub setup, OAuth disclosure, offline limits and help. Use first person for my maintenance role.         |
| `CHANGELOG.md`              | Use `[1.2.0]`, `[1.1.0]` and `[1.0.0]` release headings with their existing dates; retain frontmatter under `[Unreleased]`. Use US English under the owner decision without renaming interface controls. |
| `docs/migration.md`         | Retain recovery guidance and move the detailed frontmatter contract, sync limits, local-data notes and troubleshooting here.                                                                             |
| `RELEASE_CHECKLIST.md`      | Retain source provenance and development setup; distinguish local validation, standalone delivery and Store submission. Document the legacy workflow hazard and approval boundaries.                     |
| `docs/repository-review.md` | Record evidence, discrepancies, separate decisions and delivery advice.                                                                                                                                  |

## Raycast requirements

The original documentation review checked the live [manifest reference](https://developers.raycast.com/information/manifest), [JSON schema](https://www.raycast.com/schemas/extension.json), [Store preparation guidance](https://developers.raycast.com/basics/prepare-an-extension-for-store), [CLI reference](https://developers.raycast.com/information/developer-tools/cli) and [submission guidance](https://developers.raycast.com/basics/publish-an-extension) on the review date. Delivery preparation rechecked the official pages, documentation links, changelog format and publishing instructions without repeating the independent code review. API-version, audit and protection observations below are retained evidence from the earlier review, not new delivery checks.

| Check                                   | Verified result                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required metadata                       | Name, title, description, author handle `smcnab1`, MIT license, icon, categories and platform are present. All four command entry points exist; command modes and preference definitions match the documented shapes. No required-field discrepancy found.                                                                                                      |
| Icons and screenshots                   | `assets/logo.png` is 512 × 512 PNG. All three Store screenshots are 2000 × 1250 PNG, within the six-image limit. Their current visual accuracy was not assessed.                                                                                                                                                                                                |
| Dependencies and build                  | npm lockfile is present. The installed CLI validates the manifest, icons and metadata; the distribution build succeeds. macOS remains the only declared platform.                                                                                                                                                                                               |
| API currency — discrepancy              | Store preparation asks for the latest API. The lockfile and installed package use `@raycast/api` 2.10.1; `npm view @raycast/api version engines --json` returned 2.11.0, requiring Node.js ≥22.22.2. The declared `^2.10.1` range permits 2.11.0, but the lockfile does not select it. Leave both unchanged pending a separately approved compatibility update. |
| Language — owner decision resolved      | Store guidance explicitly requires US English. On 4 November 2026 the owner adopted US English for this project. These five documentation files now follow that decision; no UI or manifest strings were changed.                                                                                                                                               |
| Description — minor guidance difference | The manifest description uses two sentences; Store guidance asks for one concise sentence. This is editorial guidance, not a schema failure. Leave metadata unchanged in this review.                                                                                                                                                                           |
| Version history                         | Raycast accepts bracketed H2 titles followed by a date or `{PR_MERGE_DATE}`; SemVer is the repository convention, not a mandatory Raycast version field. The proposed released headings follow both. `[Unreleased]` is a local holding section; convert it to an agreed version and merge-date placeholder only at submission.                                  |

The recorded 1.2.0 source provenance was independently confirmed: Raycast PR #33061 is merged, with merge commit `ae62d5b76541ad0f5eb481d2730a89004aedcb10` on 4 November 2026. That does not establish Store acceptance for the later frontmatter commit.

## Actionable maintenance findings

| Priority | Evidence and consequence                                                                                                                                                                                                                                                                      | Recommended next step                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| P2       | `.github/workflows/sync-raycast-extension.yml` copies historical source and manifests directly to `main` without current tests. The release issue template still sends work through that branch. A push or dispatch can overwrite the accepted implementation and separate it from its tests. | Use the revised checklist now; reconcile the workflow and issue template in a separate approved change. Neither was edited or run.             |
| P3       | `ROADMAP.md` still presents several shipped capabilities as future work, including manual refresh and repository identities.                                                                                                                                                                  | Reconcile it against the changelog in a focused planning update; do not infer missing implementation from these entries.                       |
| P3       | The repository has issue automation and legacy sync, but no checked-in test/build PR workflow. `check-format` also omits the roadmap and release checklist.                                                                                                                                   | Continue running local checks and explicitly format edited Markdown. Consider CI and format coverage in a separately approved workflow change. |

No feature-code refactoring or dependency change is justified by this documentation review.

## Decision 1: dependency audit

**Disposition: record and defer remediation. No risk acceptance or security change.**

The earlier `npm audit --json` run reported 22 moderate affected-package entries, no high or critical findings, rooted in one [minimatch advisory, GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Installed affected copies are 10.2.6 and 5.1.9; the advisory marks versions below 11.0.1 as affected. Paths run through Raycast's CLI/oclif and lint tooling. A production dependency label alone does not establish an exploitable path in the extension commands.

The audit offers major-version downgrades of Raycast packages for some paths and no fix for others. No compatible complete fix or extension-specific exploit was established here. I will keep remediation separate from the accepted feature and documentation changes. Dependencies, overrides and lockfile remain unchanged; no `npm audit fix` was run.

## Decision 2: unprotected main

**Disposition: record and defer repository settings. No policy acceptance or settings change.**

The earlier read-only GitHub branch endpoint check reported `protected: false` and protection disabled for `main`. The effective branch-rules endpoint returned `[]`. That review used `gh api` against the explicitly named repository for these reads. This leaves direct pushes, including the legacy sync workflow, without a branch-protection gate at the time checked.

I will use a reviewed PR for delivery after approval. Any protection/ruleset configuration, required checks or workflow retirement needs a separate decision and approval.

## Decision 3: project language

**Resolved by the owner on 4 November 2026: use US English for this project, following [Raycast’s language requirement](https://developers.raycast.com/basics/prepare-an-extension-for-store).**

This supersedes the earlier proposal to retain UK English and defer the decision. US English is applied to these five documentation files. A wider wording pass through other project files remains outside this delivery; source, UI strings and manifests are unchanged.

## Validation

Delivery validation runs against the five-file diff from merged `main`: tests, typecheck, lint, formatting, distribution build and distribution-content checks, plus local links, anchors and changelog headings. Official Raycast documentation links were checked during the earlier review on the same date. Dependency-audit and GitHub-protection observations remain earlier evidence and were not re-investigated.

| Check                                                                   | Result                                                                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm test`                                                              | 155 passed; zero failed, canceled or skipped, including frontmatter and service preservation cases. |
| `npm run typecheck`                                                     | Passed.                                                                                             |
| `npm run lint`                                                          | Passed: manifest, icons, extension metadata, ESLint and source formatting.                          |
| `npm run check-format`                                                  | Passed after documentation edits.                                                                   |
| Explicit Prettier check of all five changed Markdown files              | Passed.                                                                                             |
| `npm run build`                                                         | Passed: distribution build of four commands.                                                        |
| `node tests/check-distribution.cjs`                                     | Passed: four commands, 355 byte-matching assets and 30 dependency notices.                          |
| Local documentation links, anchors and changelog headings               | Passed.                                                                                             |
| `git diff --check` and implementation comparison with the target commit | Passed; only the five documented Markdown files differ.                                             |
| Dependency audit                                                        | Earlier result retained: 22 moderate affected-package entries; not rerun for this delivery.         |

The installed linter's manifest validation passed. During the earlier review, an additional attempt to validate the downloaded live draft-2020-12 schema directly could not run with the installed Ajv 6 validator; no dependency was added to work around that tooling limitation. Live requirements were also checked manually. Feature PR #51 subsequently completed native synthetic-data QA and screenshot capture, as recorded above. No real OAuth grant, network repository sync or Store submission was performed during that QA or this documentation delivery.

## Delivery sequence

Both PRs target `smcnab1/cheatsheets-remastered`. This standalone delivery does not publish to the Raycast Store.

| Change                                          | State                                                   | Verified baseline                                       |
| ----------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| Repository frontmatter and native-QA correction | PR #51 merged with both feature commits preserved       | Merge commit `bc037e2dd863e1f7dce1b6ef6436acf1a6a1fe3c` |
| Five-file documentation follow-up               | Separate delivery branch; owner merge approval required | The same merged `main`; no feature implementation diff  |

1. Preserve `fix/repository-documentation` and original commit `fc071972884e9b9e3fd136f163e679ddc9ab397f`.
2. Replay only its documentation changes onto `fix/repository-documentation-delivery`, starting at the verified feature merge. Retain the merged description fix when resolving README/changelog overlap.
3. Confirm exactly five documentation files against updated `main`, run validation and inspect the GitHub diff.
4. Assign the documentation PR to `smcnab1` and mark it ready after checks pass. Obtain separate approval before merging it. No tag, release or Store publication is part of this delivery.

### Remaining maintenance limits

- The old unrelated local `main` was preserved as `fix/preserved-local-main-20261104`; local `main` now tracks the verified remote merge. The original documentation branch and feature commits remain intact.
- The historical `raycast-extension` and `release/v1.2.0` branches remain reference branches. Pushing the former can trigger the legacy overwrite workflow.
- API currency, dependency findings, repository protection, workflow/template reconciliation and Store screenshot accuracy remain separate maintenance or release work. No dependency, workflow or GitHub setting was changed by this documentation delivery.
- No PR validation workflow is checked in. Local validation and available GitHub checks are separate evidence; neither implies Store acceptance.
