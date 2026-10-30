import { z } from "zod";
import { requiredError } from "@/lib/schemas/required-error";

export const signInSchema = z.object({
  email: z.string(requiredError("Email is required")).email("Please enter a valid email address."),
  password: z.string(requiredError("Password is required")).min(4, {
    message: "Password must be at least 4 characters.",
  }),
});

export const signInActionSchema = signInSchema.extend({
  redirectTo: z.string().optional(),
  redirect: z.boolean().optional(),
});

export const signUpSchema = signInActionSchema;

export const forgotPasswordSchema = signInSchema.pick({ email: true });

export const resetPasswordSchema = z
  .object({
    token: z.string(requiredError("Reset token is required.")),
    password: z.string(requiredError("Password is required")).min(4, {
      message: "Password must be at least 4 characters.",
    }),
    passwordConfirm: z.string(requiredError("Please confirm your password.")),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match.",
    path: ["passwordConfirm"],
  });
