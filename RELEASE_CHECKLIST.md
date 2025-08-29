# Release Cycle Checklist

A reusable checklist for each new Cheatsheets Remastered release.  
Target cadence: every ~5 weeks.

---

## 1. Development
- [ ] Create milestone in GitHub with version (e.g. `v1.2.0`)
- [ ] Create release branch (`release/v1.2.0`)
- [ ] Implement scoped features (must-have first, stretch later)
- [ ] Ensure linting/formatting passes (`prettier --write .`)
- [ ] Run tests and smoke test commands locally
- [ ] Update internal roadmap (`ROADMAP.md`) if scope changed

---

## 2. Documentation
- [ ] Update `README.md` with new features (short “Next Up” block)
- [ ] Update `ROADMAP.md` (move milestone into ✅ Released if complete)
- [ ] Write `CHANGELOG.md` entry with summary + features/fixes
- [ ] Prepare GitHub Release description (copy from roadmap style)

---

## 3. Pre-Release / Beta
- [ ] Push release branch to GitHub
- [ ] Share pre-release build (Raycast test flight / internal testers)
- [ ] Collect feedback and fix high-priority issues
- [ ] Bump version in extension manifest (`package.json`)

---

## 4. Tag & Release
- [ ] Merge release branch → `main`
- [ ] Tag release (`git tag v1.2.0 && git push --tags`)
- [ ] Create GitHub Release with notes (link to roadmap milestone)
- [ ] Confirm CI/build passes

---

## 5. Publish
- [ ] Submit updated extension to Raycast Store
- [ ] Verify listing shows new version & features
- [ ] Announce release (Slack, Twitter, README badge, etc.)
- [ ] Close milestone in GitHub and roll tasks forward if needed

---

## 6. Post-Release
- [ ] Open new milestone (e.g. `v1.3.0`)
- [ ] Seed issues/tasks from roadmap
- [ ] Note any carry-overs from previous cycle
- [ ] Start new release branch when development begins

---