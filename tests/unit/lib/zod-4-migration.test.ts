import { describe, expect, it } from "vitest";
import { z } from "zod";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema } from "@/lib/schemas/auth";
import { userSchema } from "@/lib/schemas/user";
import { getSchemaDefaults } from "@/lib/utils/get-schema-defaults";

// LACA-2801. The zod 3 to 4 upgrade had three ways to change behaviour without
// failing `tsc --noEmit` or `next build`, so each one is pinned here:
//
//   1. `required_error` was removed. zod 4 ignores the unknown key silently
//      instead of erroring, so our copy would have degraded to zod's own
//      wording with nothing in the build to show it.
//   2. `ZodError.formErrors` was removed, so readers of `.fieldErrors` throw
//      on the error path only, which a happy-path smoke test never reaches.
//   3. `ZodError.errors` is gone in favour of `.issues`.

const messagesFor = (schema: z.ZodType, value: unknown) => {
  const result = schema.safeParse(value);
  if (result.success) {
    return [];
  }
  return result.error.issues.map((issue) => issue.message);
};

describe("zod 4 migration", () => {
  describe("required messages survive the required_error removal", () => {
    it("keeps our copy when a sign-in field is missing", () => {
      expect(messagesFor(signInSchema, {})).toEqual(["Email is required", "Password is required"]);
    });

    it("keeps our copy when a reset-password field is missing", () => {
      expect(messagesFor(resetPasswordSchema, {})).toEqual([
        "Reset token is required.",
        "Password is required",
        "Please confirm your password.",
      ]);
    });

    it("keeps our copy for the user schema password", () => {
      expect(messagesFor(userSchema, {})).toContain("Password is required");
    });

    it("still reports the length rule when the value is present but too short", () => {
      expect(messagesFor(signInSchema, { email: "a@b.co", password: "abc" })).toEqual([
        "Password must be at least 4 characters.",
      ]);
    });

    it("falls back to zod's own message for a wrong type rather than the required copy", () => {
      const messages = messagesFor(signInSchema, { email: "a@b.co", password: 123 });
      expect(messages).toHaveLength(1);
      expect(messages[0]).not.toBe("Password is required");
      expect(messages[0]).toContain("expected string");
    });

    it("reports the email format message for a malformed address", () => {
      expect(messagesFor(signInSchema, { email: "nope", password: "abcd" })).toEqual([
        "Please enter a valid email address.",
      ]);
    });

    it("accepts a valid payload", () => {
      expect(signInSchema.safeParse({ email: "a@b.co", password: "abcd" }).success).toBe(true);
    });

    it("cross-field refinement still fires on mismatched passwords", () => {
      expect(
        messagesFor(resetPasswordSchema, {
          token: "t",
          password: "abcd",
          passwordConfirm: "efgh",
        })
      ).toEqual(["Passwords do not match."]);
    });
  });

  describe("error-shape readers", () => {
    it("exposes issues, and no longer exposes the removed zod 3 accessors", () => {
      const error = signInSchema.safeParse({}).error;
      expect(error).toBeDefined();
      expect(Array.isArray(error?.issues)).toBe(true);
      // Guards the two call sites that used to read `formErrors.fieldErrors`:
      // if a future zod restores these, the replacements below are still right,
      // but a regression back to them would not be silent.
      expect((error as unknown as { formErrors?: unknown }).formErrors).toBeUndefined();
      expect((error as unknown as { errors?: unknown }).errors).toBeUndefined();
    });

    it("flattenError gives the fieldErrors shape the form readers rely on", () => {
      const error = signInSchema.safeParse({}).error;
      expect(error).toBeDefined();
      const flattened = z.flattenError(error as z.ZodError<z.infer<typeof signInSchema>>);
      expect(flattened.fieldErrors.email).toEqual(["Email is required"]);
      expect(flattened.fieldErrors.password).toEqual(["Password is required"]);
    });

    it("forgotPasswordSchema keeps only the email field", () => {
      expect(messagesFor(forgotPasswordSchema, {})).toEqual(["Email is required"]);
      expect(forgotPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    });
  });

  describe("getSchemaDefaults after the ZodEffects removal", () => {
    it("returns a blank string per field for the sign-in form", () => {
      expect(getSchemaDefaults<typeof signInSchema>(signInSchema)).toEqual({
        email: "",
        password: "",
      });
    });

    it("reads a default value, which zod 4 turned from a getter into a plain value", () => {
      const schema = z.object({ role: z.string().default("member") });
      expect(getSchemaDefaults<typeof schema>(schema)).toEqual({ role: "member" });
    });

    it("unwraps optional and nullable wrappers to reach the default", () => {
      const schema = z.object({
        tier: z.string().default("free").optional(),
        note: z.string().nullable(),
      });
      expect(getSchemaDefaults<typeof schema>(schema)).toEqual({ tier: "free", note: "" });
    });

    it("walks through a transform, which is now a ZodPipe rather than a ZodEffects", () => {
      const schema = z.object({ email: z.string() }).transform((value) => value);
      expect(getSchemaDefaults<typeof schema>(schema)).toEqual({ email: "" });
    });

    it("starts array fields empty", () => {
      const schema = z.object({ tags: z.array(z.string()) });
      expect(getSchemaDefaults<typeof schema>(schema)).toEqual({ tags: [] });
    });
  });

  describe("z.record now needs an explicit key schema", () => {
    it("accepts a string-keyed record of unknown values", () => {
      const schema = z.record(z.string(), z.unknown()).optional();
      expect(schema.safeParse({ a: 1, b: "two" }).success).toBe(true);
      expect(schema.safeParse(undefined).success).toBe(true);
    });
  });
});
