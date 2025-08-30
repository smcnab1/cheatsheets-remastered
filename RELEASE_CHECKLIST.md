# Release Cycle Checklist

A reusable checklist for each new Cheatsheets Remastered release.  
Target cadence: every ~5 weeks.

---

## 1. Development
- [ ] Create milestone in GitHub
- [ ] Create release branch (`release/vX.Y.Z`)
- [ ] Implement scoped features (must-have first, stretch later)
- [ ] Run linting/formatting (`prettier --write .`)
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
- [ ] Bump version in `package.json`

---

## 4. Tag & Release
- [ ] Merge release branch → `main`
- [ ] Tag release (`git tag vX.Y.Z && git push --tags`)
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
- [ ] Open new milestone (e.g. `vX.Y+1.0`)
- [ ] Seed issues/tasks from roadmap
- [ ] Note any carry-overs from previous cycle

---