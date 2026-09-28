# Optional authentication for visual captures

Protected routes may redirect to login without a session. To capture authenticated shells **without weakening app security**:

1. Log in manually in Chrome once.
2. Export storage (example with Playwright codegen or a one-off script):

```bash
pnpm exec playwright codegen http://localhost:3010/login --save-storage=packages/visual-regression/auth/admin-storage.json
```

3. Run audit with:

```bash
set VISUAL_ADMIN_STORAGE_STATE=packages/visual-regression/auth/admin-storage.json
pnpm visual:test
```

Repeat for `VISUAL_BRANCH_STORAGE_STATE`, `VISUAL_CUSTOMER_STORAGE_STATE`, `VISUAL_STUDENT_STORAGE_STATE` as needed.

Do not commit real session files. Add `auth/*.json` to gitignore.
