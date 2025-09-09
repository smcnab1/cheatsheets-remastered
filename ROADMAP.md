# Cheatsheets Remastered · Roadmap

This document tracks planned updates and ideas for future versions of **Cheatsheets Remastered**.
Timelines are indicative and may shift based on feedback and usage.

---

## 1.2.0 — Caching & Search

Build on user repos with caching, offline-first behaviour, and search integration.

**Content & Offline**

* 📡 Offline cache per repo, namespace isolated
* 🔄 Manual refresh action
* ⏳ Background update (opt-in) with frequency preference

**Search**

* 🔍 Include repo sheets in title/slug search
* 🔎 Full-text search across cached repo content (case-insensitive, 2+ chars)

**Errors & Limits**

* 🔑 Support optional GitHub token per repo and global fallback
* 🛡️ Handle network timeouts with fallback to cache

---

## 1.3.0 — Advanced Repo Features

Introduce richer repo management, metadata, and error resilience.

**UX Enhancements**

* 🔄 Per-repo Refresh & Remove in Repos Manager
* 🏷️ Repo icon display in results

**Data & Schema**

* 🗂️ Schema extended with `{ subdir, addedAt, lastSyncAt }`
* 📅 Show “Last synced” metadata in repo list

**Errors & Limits**

* ⏳ Rate-limit aware backoff with retry UI
* 🛡️ More robust error categorisation (unauthorised, missing repo, invalid branch)

---

## 1.4.0 — Metadata & Tags

* 🏷️ Parse optional frontmatter (`title`, `tags`, `description`, `icon`)
* 🔀 Merge frontmatter metadata with derived tags

---

## 1.5.0 — Preferences & Controls

* ⚙️ Centralised preferences: tokens, offline sync frequency, indexing toggles
* 🧹 Clear caches & rebuild index actions

---

## 1.6.0 — Slugging & Collisions

* 🧩 Deterministic slugging for nested folders (`subdir/foo`)
* 🛡️ Collision detection across assets, repos, and customs
* 🔖 Disambiguation with source prefixes

---

## 🔮 Later / Nice-to-have

* 🔗 Two-way sync for custom sheets (gists or private repos)
* 🗂️ Multi-select actions (offline download, favourite, export)
* 🎨 Smarter icon inference + optional per-repo icon directory

---

## ✅ Released

## 1.1.0 — User Repository Basics

Introduce user-specified GitHub repositories of Markdown cheatsheets with core management.

**UX & Data**

* 📂 Repos Manager command: list/add/remove repositories
* ➕ Add repo form: `owner/repo`, optional branch (default `main`/`master`)
* 💾 Persist repo configs in `LocalStorage`

**Fetching**

* 🌐 Fetch repo file list via GitHub API
* 🛑 Apply basic exclusions (non-`.md`, admin files)

**Content**

* 🧭 Resolution order: local → repo cache → network
* 🏷️ Label sheets with `Repo: <name>`

**Acceptance**

* ✅ Add a repo and see its sheets appear in Search
* ✅ Remove a repo and see its sheets disappear

---

### v1.0.0 — Local-first Foundations

* ✨ Local-first defaults: prefer `assets/cheatsheets` over remote
* 🔍 Content search across local defaults in Search view
* 📝 Attribution moved to action menu for local sheets
* 🔄 GitHub Actions sync job to pull upstream DevHints into `assets/cheatsheets`

---

💡 Got an idea or request? [Open an issue](https://github.com/smcnab1/cheatsheets-remastered/issues/new) with context and acceptance criteria.
