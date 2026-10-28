"use server";

import { z } from "zod";
import { BASE_URL } from "@/config/base-url";
import { STATUS_CODES } from "@/config/status-codes";
import { env } from "@/env";
import { isBetterAuthActive } from "@/lib/auth/auth-strategy";
import { resend } from "@/lib/resend";
import { forgotPasswordSchema, resetPasswordSchema, signInActionSchema } from "@/lib/schemas/auth";
import type { ActionState } from "@/lib/utils/validated-action";
import { AuthService } from "@/server/services/auth-service";
import { betterAuthCredentials } from "@/server/better-auth/facade";
import type { UserRole } from "@/types/user";

export interface AuthOptions {
  redirectTo?: string;
  redirect?: boolean;
  protect?: boolean;
  role?: UserRole;
  nextUrl?: string;
  errorCode?: string;
  email?: string;
}

export const signInWithOAuthAction = async ({
  providerId,
  options,
}: {
  providerId: string;
  options?: AuthOptions;
}) => {
  return await AuthService.signInWithOAuth(providerId, options);
};

/**
 * First validation message, for actions that report a single error string.
 */
const firstIssueMessage = (error: z.ZodError) => error.issues[0]?.message ?? "Invalid input data";

export const signInAction = async (input: z.infer<typeof signInActionSchema>) => {
  const parsed = signInActionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  const { email, password, redirect, redirectTo } = parsed.data;

  if (isBetterAuthActive()) {
    await betterAuthCredentials.signIn({
      email,
      password,
      redirect: redirect ?? true,
      redirectTo,
    });
    return { ok: true };
  }
  await AuthService.signInWithCredentials({ email, password, redirect, redirectTo });
  return { ok: true };
};

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  redirect: z.boolean().optional(),
  redirectTo: z.string().optional(),
});

type SignInCredentialsInput = z.infer<typeof CredentialsSchema>;

export const signInWithCredentialsAction = async (input: SignInCredentialsInput) => {
  // Validate input using the schema (optional but good practice)
  const parsed = CredentialsSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid input to signInWithCredentialsAction:", parsed.error);
    return { ok: false, error: "Invalid input data" };
  }

  const { email, password, redirect, redirectTo } = parsed.data;

  if (isBetterAuthActive()) {
    // Redirects throw past this action on purpose; only the non-redirect
    // result needs the same `{ ok, url | error }` shape as the Auth.js path.
    return betterAuthCredentials.signIn({
      email,
      password,
      redirect: redirect ?? false,
      redirectTo,
    });
  }

  try {
    const result = await AuthService.signInWithCredentials({
      email,
      password,
      redirect: redirect ?? false, // Use provided redirect, default to false
      redirectTo,
    });

    if (!result.ok) {
      return { ok: false, error: result.error ?? "Unknown sign-in error" };
    }

    return { ok: true, url: result.url };
  } catch (error: any) {
    // Check if it's an AuthError from next-auth
    if (error.type === "CredentialsSignin" || error.code === "CredentialsSignin") {
      return { ok: false, error: STATUS_CODES.CREDENTIALS.message };
    }

    // Known credential errors don't need extra logging
    if (error.message === STATUS_CODES.CREDENTIALS.message) {
      return { ok: false, error: error.message };
    }

    console.error("Error in signInWithCredentialsAction:", error);
    return { ok: false, error: error.message ?? "Sign in failed" };
  }
};

export const signUpWithCredentialsAction = async (_prevState: ActionState, formData: FormData) => {
  const parsed = CredentialsSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { ok: false, error: "Invalid form data" };
  }
  if (isBetterAuthActive()) {
    // Better Auth hashes the password, creates the rows and sets the session
    // cookie; verification email (when Resend is configured) is sent by its config.
    return betterAuthCredentials.signUp(parsed.data);
  }
  try {
    const result = await AuthService.signUpWithCredentials(parsed.data);

    if (!result.ok || !result.user) {
      return { ok: false, error: result.error ?? "Sign up failed" };
    }

    // Send verification email (moved from auth service for clarity)
    try {
      if (!resend) {
        console.warn("Resend client not initialized - skipping verification email");
      } else {
        const RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "noreply@example.com";
        await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: parsed.data.email,
          subject: "Welcome to Our App - Verify Your Email",
          html: `
							<p>Welcome! Your account has been created.</p>
							<p>You can now sign in and start using the app:</p>
							<a href="${BASE_URL}/sign-in">Sign In</a>
						`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send verification email", emailError);
      // Proceed with sign-up even if email fails, but log the error
    }

    return { ok: true, user: result.user }; // Only return necessary info
  } catch (error: any) {
    console.error("Error in signUpWithCredentialsAction:", error);
    return { ok: false, error: error.message ?? "Sign up failed" };
  }
};

export const signOutAction = async (options?: AuthOptions) => {
  return await AuthService.signOut(options);
};

export const forgotPasswordAction = async (input: z.infer<typeof forgotPasswordSchema>) => {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  try {
    if (isBetterAuthActive()) {
      await betterAuthCredentials.forgotPassword(parsed.data.email);
      return { ok: true };
    }
    await AuthService.forgotPassword(parsed.data.email);
    return { ok: true };
  } catch (error) {
    console.error("Error in forgotPasswordAction:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : STATUS_CODES.AUTH_ERROR.message,
    };
  }
};

export const resetPasswordAction = async (input: z.infer<typeof resetPasswordSchema>) => {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  try {
    if (isBetterAuthActive()) {
      await betterAuthCredentials.resetPassword(parsed.data.token, parsed.data.password);
      return { ok: true };
    }
    await AuthService.resetPassword(parsed.data.token, parsed.data.password);
    return { ok: true };
  } catch (error) {
    console.error("Error in resetPasswordAction:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : STATUS_CODES.AUTH_ERROR.message,
    };
  }
};
