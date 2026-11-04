# Development and release checklist

I maintain this standalone repository as the source and backup for Cheatsheets Remastered. A standalone merge or GitHub release does not submit an update to the Raycast Store.

## Source baseline

The 1.2.0 baseline comes from [Raycast PR #33061](https://github.com/raycast/extensions/pull/33061), under `extensions/cheatsheets-remastered/` at commit [`ae62d5b76541ad0f5eb481d2730a89004aedcb10`](https://github.com/raycast/extensions/commit/ae62d5b76541ad0f5eb481d2730a89004aedcb10). Extension source, assets, tests, dependencies and notices were copied from that revision. Standalone documentation and project files are maintained here.

Use the current remote `main` as the starting point for new work. The historical `raycast-extension` and `release/v1.2.0` branches are retained for reference. Check the remote and base commit before preparing a PR; the local `main` may be stale.

## Develop locally

Use macOS with Raycast and a Node.js version supported by the locked Raycast CLI (currently Node.js 22.22.2 or later).

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run check-format
npm run build
node tests/check-distribution.cjs
```

Run `npm run dev` to import the development extension into Raycast. It changes the local Raycast installation, so use a development environment with appropriate data backups.

Edit extension code in `src/` and bundled references in `assets/cheatsheets/`. Keep the index, [attribution](ATTRIBUTION.md) and bundled notices accurate when changing redistributed content. The icon helper is `node scripts/normalize-icons.js`. Raycast generates `raycast-env.d.ts`; do not commit it.

`check-format` covers `docs/`, README, changelog and attribution, but not this checklist or the roadmap. Check edited Markdown explicitly with the installed Prettier CLI; avoid formatting the entire repository.

## Prepare a change

- [ ] Keep feature code and documentation changes within the agreed scope.
- [ ] Add new features to `CHANGELOG.md` under `## [Unreleased]` until Store submission.
- [ ] Keep README focused on installation, commands and essential setup; put operational detail in [repository behavior and recovery](docs/migration.md).
- [ ] Review [roadmap](ROADMAP.md) entries against the shipped changelog before treating them as outstanding work.
- [ ] Run the checks above and record any limitations. Check the affected commands in Raycast before a Store submission.
- [ ] Review the complete diff, including generated files, notices and lockfile changes.
- [ ] Keep dependency-audit and repository-protection decisions separate; see the [focused review](docs/repository-review.md).

## Prepare a Store submission

These are preparation steps. Pushing, opening PRs, publishing, merging, tagging, releasing, dispatching workflows and changing GitHub settings require separate approval for this review.

- [ ] Recheck the live [manifest requirements](https://developers.raycast.com/information/manifest) and [Store preparation guidance](https://developers.raycast.com/basics/prepare-an-extension-for-store).
- [ ] Agree the next SemVer version. Preserve released headings as `## [1.2.0] - 2026-11-04`; at submission, replace `Unreleased` with `## [X.Y.Z] - {PR_MERGE_DATE}`. Raycast supplies the merge date. Do not invent a release date in advance.
- [ ] Prepare a focused update under `extensions/cheatsheets-remastered/` in a Raycast submission checkout. Keep this repository's `.github/`, roadmap, release checklist and review notes here. Use absolute standalone-repository links for supporting documentation in the Store README.
- [ ] Use US English for project documentation and Store-facing copy, following the owner decision recorded in the [focused review](docs/repository-review.md#decision-3-project-language). Check the latest API version separately; any dependency, platform, OAuth or preference change needs its own compatibility review and approval.
- [ ] Verify the distribution build, command behavior and current screenshots. Store screenshots belong in `metadata/`; README media belongs in `media/`.
- [ ] Choose either the documented [publish command or manual PR route](https://developers.raycast.com/basics/publish-an-extension). `npm run publish` opens or updates an upstream PR; it is not a local validation command.
- [ ] Obtain approval before delivery. After an approved submission, wait for upstream acceptance and verify the Store before marking the change as shipped.

## Legacy workflow warning

`.github/workflows/sync-raycast-extension.yml` runs when `raycast-extension` is pushed or when manually dispatched. It copies selected files from that historical branch and pushes directly to `main`, including source and manifests but excluding the current tests and README. Running it can overwrite newer accepted work and leave tests out of step with source. It is unchanged by this review.

The release issue template still instructs merging through `raycast-extension`; do not follow that route for current work. Reconcile the template and legacy sync workflow in a separately approved workflow change.
