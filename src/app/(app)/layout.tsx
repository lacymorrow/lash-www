import type { Metadata } from "next";
import React from "react";

import { AppRouterLayout } from "@/components/layouts/app-router-layout";
import { Body } from "@/components/primitives/body";
import { metadata as defaultMetadata } from "@/config/metadata";
import { initializePaymentProviders } from "@/server/providers";

export const metadata: Metadata = defaultMetadata;
export const fetchCache = "default-cache";

await initializePaymentProviders();

function isPromiseLike(value: unknown): value is Promise<unknown> {
	return (
		typeof value === "object" &&
		value !== null &&
		"then" in value &&
		typeof (value as { then?: unknown }).then === "function"
	);
}

export default async function Layout({
	children,
	params: _params,
	...slots
}: {
	children: React.ReactNode;
	params: Promise<Record<string, never>>;
	[key: string]: unknown;
}) {
	// Intercepting routes
	const resolvedSlots = (
		await Promise.all(
			Object.entries(slots).map(async ([key, slot]) => {
				const resolvedSlot = isPromiseLike(slot) ? await slot : slot;
				if (
					!resolvedSlot ||
					(typeof resolvedSlot === "object" && Object.keys(resolvedSlot).length === 0)
				) {
					return null;
				}
				return [key, resolvedSlot as React.ReactNode] as [string, React.ReactNode];
			})
		)
	).filter((item): item is [string, React.ReactNode] => item !== null);

	return (
		<html lang="en" suppressHydrationWarning>
			<Body>
				<AppRouterLayout>
					<main>{children}</main>

					{/* Dynamically render all available slots */}
					{resolvedSlots.map(([key, slot]) => (
						<React.Fragment key={`slot-${key}`}>{slot}</React.Fragment>
					))}

					{/* TODO: Uncomment this when we have this working */}
					{/* Lacy Morrow vanity plate */}
					{/* <BrickMarquee /> */}
				</AppRouterLayout>

				{/* Add FontSelector only in development */}
				{/* {process.env.NODE_ENV === "development" && <FontSelector />} */}
			</Body>
		</html>
	);
}
