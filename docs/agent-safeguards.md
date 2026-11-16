# Project safeguards

Project-specific safety and product constraints below remain binding. Current
authority, execution, verification classification and release procedures are in
[the authored contract](agent-contract.md), which resolves any old process wording.
Past approvals are not permission; verify dated claims against current code.
Read relevant sections before changing their subsystem.

## Non-negotiable approval and authorization gates
1. **Read-only discovery first.** Confirm repository contents, branch/worktree, existing instructions, app stack, tests, hosting, databases, routes, and actual UI. Do not infer their existence from these design documents.
2. **HIGH-FIDELITY UI APPROVAL GATE:** Before changing or implementing any public/admin UI, create inspectable, high-fidelity desktop and mobile mockups (including Arabic RTL), present them to the user, and **STOP until explicit approval**. Approval of this file or the general project plan is NOT mockup approval. Repeat if revisions are requested.
3. After approval, the agent may make routine implementation decisions and execute approved work autonomously while respecting scope, tests and recovery.
4. Stop for major cost commitments, production launch/configuration, personal-data publication, account ownership/permissions changes, irreversible operations, legal/credential claims needing confirmation, and unresolvable blockers. Never fake authorization.
5. Do not alter another repository or account merely because it is owned by the same user. Preserve unrelated work. Never force-push, reset, destroy data, or silently change a production environment.

