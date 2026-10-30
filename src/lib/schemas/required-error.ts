/**
 * zod 3 had a `required_error` key that fired only when a value was missing.
 * zod 4 removed it in favour of one `error` key covering every issue on the
 * schema, and it ignores `required_error` silently rather than failing, so a
 * plain rename would have quietly replaced our copy with zod's own wording.
 *
 * This narrows `error` back to the missing-value case: the custom message is
 * used only when the input was absent, and returning `undefined` hands any
 * other issue (wrong type, too short, bad format) back to zod's default
 * message, which is what `required_error` did.
 */
export const requiredError = (message: string) => ({
  error: (issue: { input: unknown }) => (issue.input === undefined ? message : undefined),
});
