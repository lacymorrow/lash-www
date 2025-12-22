// Todo: if payload is accessed when there is no database setup, the whole app crashes.

import { env } from "@/env";
import { logger } from "@/lib/logger";

// Initialize Payload
export const getPayloadClient = async () => {
	if (!env?.NEXT_PUBLIC_FEATURE_PAYLOAD_ENABLED) {
		// logger.debug("Payload not initialized: DATABASE_URL is missing or Payload is not enabled");
		return null;
	}

	try {
		const [{ default: payloadConfig }, { getPayload }] = await Promise.all([
			import("@payload-config"),
			import("payload"),
		]);

		// Initialize Payload
		const payload = await getPayload({
			// Pass in the config
			config: payloadConfig,
		});

		return payload;
	} catch (error) {
		logger.warn("Payload failed to initialize", { error });
		return null;
	}
};

// Export a singleton instance only when payload is enabled.
export const payload = env?.NEXT_PUBLIC_FEATURE_PAYLOAD_ENABLED ? await getPayloadClient() : null;
