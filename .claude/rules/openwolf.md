---
description: OpenWolf protocol enforcement — active on all files
globs: **/*
---

- Check .wolf/anatomy.md before reading any project file
- Check .wolf/cerebrum.md Do-Not-Repeat list before generating code
- After writing or editing files, update .wolf/anatomy.md and append to .wolf/memory.md
- After receiving a user correction, update .wolf/cerebrum.md immediately (Preferences, Learnings, or Do-Not-Repeat)
- LEARN from every interaction: if you discover a convention, user preference, or project pattern, add it to .wolf/cerebrum.md. Low threshold — when in doubt, log it.
- BEFORE fixing any bug or error: read .wolf/buglog.json for known fixes
- AFTER fixing any bug, error, failed test, failed build, or user-reported problem: ALWAYS log to .wolf/buglog.json with error_message, root_cause, fix, and tags
- If you edit a file more than twice in a session, that likely indicates a bug — log it to .wolf/buglog.json
- When the user asks to check/evaluate UI design: run `openwolf designqc` to capture screenshots, then read them from .wolf/designqc-captures/
- When the user asks to change/pick/migrate UI framework: read .wolf/reframe-frameworks.md, ask decision questions, recommend a framework, then execute with the framework's prompt
- PRIVACY: the .wolf/ directory is committed to a PUBLIC git repo. NEVER write secrets, credentials, API keys, tokens, .env contents, or personal data into any .wolf/ file (cerebrum.md, memory.md, anatomy.md, buglog.json, …).
- In .wolf/ files always use repo-relative paths (e.g. `src/lib/pdf/load.ts`), NEVER absolute home-directory paths (those under the user's home folder) that leak the username/machine layout.
- The machine-generated runtime-state files (.wolf/hooks/_session.json, .wolf/token-ledger.json, .wolf/suggestions.json, .wolf/designqc-report.json, .wolf/cron-state.json, .wolf/designqc-captures/) are gitignored on purpose — do not force-add them.
