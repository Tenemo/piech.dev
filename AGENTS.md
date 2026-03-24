# General

- Preserve existing styles and behavior unless asked otherwise. In general, make sure to never remove any existing features unless asked to.
- Do not ignore/disable/hide errors, fix the underlying issue instead.
- Never use any emojis anywhere, in code, comments, documentation, anywhere.
- Never run any potentially destructive git commands or anything that could undo work. Do not rely on git, leave it to me.
- Never run any potentially destructive commands outside of the repository.

# Debugging

1. Reproduce the issue and understand the symptoms. Identify what is happening, what was expected, and under what conditions the bug occurs. Do not proceed unless you can reliably reproduce the issue.
2. IMPORTANT - find the root cause. Trace the relevant code paths, read the logic, and narrow down where the behavior diverges from expectations. DO NOT proceed until you've found the root cause.
3. Only after the root cause is confirmed, implement a fix that directly addresses it. If you stumbled upon a fix accidentally, but do not understand how it fixed the issue, DO NOT proceed, go back to 2.
4. Verify the fix works under various conditions.

- Do not apply speculative fixes. If a change happens to resolve the issue but you cannot explain exactly why it works, revert it and return to step 1.
- Do not shotgun-debug by changing multiple things at once to see what sticks. Each change should be deliberate and tied to a specific hypothesis.
- Do not suppress, swallow, or work around errors without understanding what caused them. The goal is always to fix the source of the problem, not to silence its symptoms.
- Never comment out/delete tests as a "fix" without guaranteeing that the test itself was buggy or is outdated.

# Verification

Before you declare a set of tasks is done:

1. Make sure npm installs correctly.
2. Make sure `npm run tsc` doesn't return any errors or warnings.
3. Make sure eslint passes with no errors.
4. Make sure stylelint passes.
5. Make sure the page builds for production with no errors.
