---
description: Stage, commit, and push all AcaDiet changes to GitHub (origin). Optional argument is used as the commit message.
---

Commit and push the current changes in `/Users/jasonlin/AcaDiet` to GitHub. Follow these steps:

1. Show what's pending:
   ```
   git -C /Users/jasonlin/AcaDiet status --short
   ```
   If there are **no** uncommitted changes AND nothing to push (`git -C /Users/jasonlin/AcaDiet status -sb` shows the branch is not "ahead"), report "Nothing to commit or push — already up to date." and stop.

2. Stage everything (the SQLite db and `.claude/settings.local.json` are gitignored, so this is safe):
   ```
   git -C /Users/jasonlin/AcaDiet add -A
   ```

3. Commit:
   - If the user passed an argument to this skill, use it verbatim as the commit message.
   - Otherwise, look at `git -C /Users/jasonlin/AcaDiet diff --cached --stat` and write a concise, descriptive message (a short summary line; add a brief body if several areas changed).
   - **Always end the commit message with this trailer** (exactly):
     ```
     Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
     ```
   - Commit with `git -C /Users/jasonlin/AcaDiet commit -m "..."` (use a heredoc for multi-line messages).

4. Push the current branch to origin:
   ```
   git -C /Users/jasonlin/AcaDiet push origin HEAD
   ```
   - If the push is rejected as **non-fast-forward** (remote has newer commits), run `git -C /Users/jasonlin/AcaDiet pull --rebase origin HEAD`, then retry the push once. If it still fails, stop and show the user the error.

5. Report the result: the commit hash + summary line, the branch, and confirmation it reached `origin`. Include the GitHub repo URL (`https://github.com/JasonLin0705/AcaDiet`).

Notes:
- This pushes whatever branch is currently checked out (often `main` for this repo — direct pushes are intended here).
- Never `git add` or force-commit the database file or `node_modules`; they are gitignored and must stay out of version control.
- Do not use `git push --force` unless the user explicitly asks for it.
