# Development and release checklist

This standalone repository is the development source and backup for Cheatsheets Remastered. A GitHub push or release does not publish an update to the Raycast Store.

## Current baseline

The published **Metadata and Markdown Import** update comes from [Raycast PR #33143](https://github.com/raycast/extensions/pull/33143), at merge commit [`32c5ba98af4dc3162dfd0ff3e8d8e3ef35b8fe94`](https://github.com/raycast/extensions/commit/32c5ba98af4dc3162dfd0ff3e8d8e3ef35b8fe94). [Raycast confirmed publication on 5 November 2026](https://github.com/raycast/extensions/pull/33143#issuecomment-6649076226). Runtime source, tests, assets, screenshots, dependency lock and published changelog match that revision.

Start new work from current remote `main`. Historical feature and release branches are retained for reference; do not use `raycast-extension` as the current source. The old branch-to-main sync workflow has been removed.

Raycast uses descriptive release headings and does not require a manifest `version`. The previous standalone tag is `v1.2.0`; this sync does not create a tag or GitHub release. A future tag should identify a verified standalone commit and describe its relationship to the accepted Store update.

## Develop locally

Use macOS with Raycast and Node.js supported by the locked Raycast CLI (Node.js 22.22.2 or later).

```bash
git switch main
git pull --ff-only
git switch -c feat/your-change
npm ci
npm test
npm run typecheck
npm run lint
npm run check-format
npm run build
node tests/check-distribution.cjs
git diff --check
```

Run `npm run dev` when you want to import the development extension into Raycast. Use an isolated development registration and synthetic data for QA; preserve personal data and avoid running old and new builds against the same storage.

Edit code in `src/` and bundled references in `assets/cheatsheets/`. Keep the index, [attribution](ATTRIBUTION.md) and bundled notices accurate when changing redistributed content. Raycast generates `raycast-env.d.ts`; keep it untracked. The icon helper is `node scripts/normalize-icons.js`.

`check-format` covers source, tests and current project documentation. `.prettierignore` excludes `CHANGELOG.md` to preserve published entries byte-for-byte. Format new changelog text separately and review its diff; do not format the whole file or repository.

## Prepare a change

- [ ] Keep changes within the agreed scope and preserve unrelated local work.
- [ ] Add unreleased changes above the published history in `CHANGELOG.md`.
- [ ] Keep README focused on commands and setup; put operational details in [repository behavior and recovery](docs/migration.md).
- [ ] Check the [roadmap](ROADMAP.md) against shipped behavior before starting work.
- [ ] Run the checks above and test affected commands in Raycast. Record native, OAuth and offline checks separately; automated tests do not prove them.
- [ ] Review the complete diff, lockfile and notices before committing.

## Prepare a Store submission

Follow the current [Store preparation guidance](https://developers.raycast.com/basics/prepare-an-extension-for-store), [manifest reference](https://developers.raycast.com/information/manifest) and [publishing instructions](https://developers.raycast.com/basics/publish-an-extension). These references were checked on 5 November 2026; recheck them for each submission.

- [ ] Fetch current upstream and prepare a focused update under `extensions/cheatsheets-remastered/` in a separate Raycast submission checkout.
- [ ] Preserve every published changelog entry exactly. Add a concise descriptive heading with `{PR_MERGE_DATE}` for the new entry; Raycast supplies its merge date.
- [ ] Check the current API version and compatibility. Keep the npm lockfile and use US English for Store-facing copy.
- [ ] Keep standalone `.github/`, roadmap, checklist and historical review notes here. Use absolute repository links for supporting documentation in the Store README.
- [ ] Run all applicable checks and test the distribution build in Raycast. Use current PNG screenshots in `metadata/`; README media belongs outside that folder.
- [ ] Use the documented publish command or manual PR route when delivery is authorized. `npm run publish` opens or updates an upstream PR; it is not a validation command.
- [ ] Keep the PR description brief: what changed, useful validation and genuine limitations. Address review comments in the existing PR.
- [ ] After acceptance, verify the publication report, reconcile this repository with the accepted source and close issues only when their requested behavior is shipped.

Pushing, opening or updating a PR, merging, publishing, tagging and releasing are separate actions: carry out only the delivery steps authorized for that task. No legacy branch merge or sync workflow is needed.
