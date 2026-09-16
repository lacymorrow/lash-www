"use client";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { env } from "@/env";
import PostHogPageView from "./posthog-page-view";
export function PostHogProvider({ children }: { children: React.ReactNode }) {
	const featureEnabled = env.NEXT_PUBLIC_FEATURE_POSTHOG_ENABLED;
	const posthogKey = env?.NEXT_PUBLIC_POSTHOG_KEY;
	const posthogHost = env?.NEXT_PUBLIC_POSTHOG_HOST || "/relay-64tM";
	const canInit = Boolean(featureEnabled && posthogKey && posthogHost);

	// This effect has to run on every render path, so the guards live inside it
	// rather than in an early return above it.
	useEffect(() => {
		if (!featureEnabled) return;
		if (!posthogKey || !posthogHost) {
			console.warn("PostHog feature is enabled but keys are missing.");
			return;
		}
		posthog.init(posthogKey, {
			api_host: posthogHost,
			ui_host: "https://us.posthog.com",
			person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
		});
	}, [featureEnabled, posthogKey, posthogHost]);

	if (!canInit) {
		return children;
	}

	return (
		<PHProvider client={posthog}>
			<PostHogPageView />
			{children}
		</PHProvider>
	);
}
