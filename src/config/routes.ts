import type { Route } from "next";
import { siteConfig } from "./site-config";

type ParamValue = string | number | null;
export type RouteParams = Record<string, ParamValue>;

export interface RouteObject {
	path: Route;
	params?: RouteParams;
}

export const createRoute = (path: Route, params: RouteParams = {}): RouteObject => ({
	path,
	params,
});

// Flattened routes structure for better type safety and easier access
export const routes = {
	// Public routes
	home: "/",
	docs: "/docs",
	blog: "/blog",
	contact: "/contact",

	// Legal routes
	terms: "/terms-of-service",
	privacy: "/privacy-policy",
	eula: "/eula",
	legal: "/legal",

	// Marketing routes
	faq: "/faq",
	features: "/features",
	pricing: "/pricing",
	launch: "/launch",

	// App routes
	download: "/download",
	tasks: "/tasks",

	checkoutSuccess: "/checkout/success",

	// CMS routes
	cms: {
		index: "/cms",
		signIn: "/cms/sign-in",
		api: "/cms-api",
	},

	// Auth routes
	auth: {
		signIn: "/sign-in",
		signUp: "/sign-up",
		signOut: "/sign-out",
		forgotPassword: "/forgot-password",
		resetPassword: "/reset-password",
		signInPage: "/api/auth/signin",
		signOutPage: "/api/auth/signout",
		signOutIn: "/sign-out-in",
		error: "/error",
	},

	// App routes
	app: {
		dashboard: "/dashboard",
		deploy: "/deploy",
		deployments: "/deployments",
		apiKeys: "/api-keys",
		logs: "/logs",
		network: "/network",
		live: "/live",
		tools: "/tools",
		downloads: "/downloads",
		activity: "/activity",
		projects: "/projects",
		teams: "/teams",
	},

	// Admin routes
	admin: {
		index: "/admin",
		users: "/admin/users",
		github: "/admin/github",
		integrations: "/admin/integrations",
		feedback: "/admin/feedback",
		payments: "/admin/payments",
	},

	settings: {
		index: "/settings",
		account: "/settings/account",
		profile: "/settings/profile",
		appearance: "/settings/appearance",
		security: "/settings/security",
	},

	// API routes
	api: {
		download: "/api/download",
		apiKeys: "/api/api-keys",
		apiKey: createRoute("/api/api-keys/:key", { key: null }),
		live: "/api/live-logs",
		sse: "/api/sse-logs",
		sendTestLog: "/api/send-test-log",
		activityStream: "/api/activity/stream",
		logger: "/v1",
		docsSearch: "/api/docs/search",
	},

	// Integration routes
	githubConnect: "/connect/github",
	vercelDeploy: "/connect/vercel/deploy",
	vercelDeployWebhook: "/connect/vercel/deploy/webhook",

	// Example routes
	examples: {
		index: "/examples",
		dashboard: "/examples/dashboard",
		forms: "/examples/forms",
		authentication: "/examples/authentication",
		notifications: "/examples/forms/notifications",
		profile: "/examples/forms/profile",
		vercelDeploy: "/examples/vercel-deploy",
	},

	// Pages Router demo routes
	pages: {
		index: "/pages",
		static: "/pages/static",
		dynamic: "/pages/dynamic",
		apiExample: "/pages/api-example",
		markdown: "/pages/markdown",
	},

	ai: {
		index: "/ai",
		codeCompletion: "/ai/code-completion",
		crossEncoder: "/ai/cross-encoder",
		spam: "/ai/spam",
		reportGen: "/ai/report-gen",
		moonshineWeb: "/ai/moonshine-web",
		zeroShotClassification: "/ai/zero-shot-classification",
		whisper: "/ai/whisper",
		wwjhd: "/ai/wwjhd",
		whisperTimestamped: "/ai/whisper-timestamped",
		webgpuNomicEmbed: "/ai/webgpu-nomic-embed",
		webgpuEmbeddingBenchmark: "/ai/webgpu-embedding-benchmark",
		webgpuClip: "/ai/webgpu-clip",
		videoObjectDetection: "/ai/video-object-detection",
		videoBackgroundRemoval: "/ai/video-background-removal",
		typeAhead: "/ai/type-ahead",
		textToSpeechWebgpu: "/ai/text-to-speech-webgpu",
		speecht5Web: "/ai/speecht5-web",
		smolvmWeb: "/ai/smolvm-web",
		smollmWeb: "/ai/smollm-web",
		semanticSearch: "/ai/semantic-search",
		semanticImageSearchWeb: "/ai/semantic-image-search-web",
		removeBackground: "/ai/remove-background",
		removeBackgroundWeb: "/ai/remove-background-web",
		phi35Webgpu: "/ai/phi-3.5-webgpu",
		musicgenWeb: "/ai/musicgen-web",
		llama32Webgpu: "/ai/llama-3.2-webgpu",
		llama32ReasoningWebgpu: "/ai/llama-3.2-reasoning-webgpu",
		janusWebgpu: "/ai/janus-webgpu",
		janusProWebgpu: "/ai/janus-pro-webgpu",
		isSpam: "/ai/is-spam",
		gemma22bJpnWebgpu: "/ai/gemma-2-2b-jpn-webgpu",
		florence2Web: "/ai/florence2-web",
		deepseekWeb: "/ai/deepseek-web",
	},

	// Worker routes
	workers: {
		logger: "/workers/workers/logger-worker.js",
	},

	// Demo routes
	demo: {
		// CMS Demo routes
		builderio: "/builder",
		payloadCms: "/payload",

		network: "/network",

		// TRPC example from T3.gg
		trpc: "/trpc",
	},

	// External links
	external: {
		shipkit: "https://lash.sh",
		bones: "https://bones.sh",
		log: "https://log.bones.sh",
		ui: "https://ui.bones.sh",
		buy: "https://lash.lemonsqueezy.com/checkout/buy/placeholder",
		discord: "https://discord.gg/XxKrKNvEje",
		twitter: siteConfig.links.twitter,
		twitter_follow: siteConfig.links.twitter_follow,
		x: siteConfig.links.x,
		x_follow: siteConfig.links.x_follow,
		website: siteConfig.creator.url,
		docs: "/docs",
		email: `mailto:${siteConfig.creator.email}`,
		github: siteConfig.repo.url,
		vercelDeployShipkit:
			"https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flacymorrow%2Flash&project-name=lash-www&repository-name=lash-www&redirect-url=https://lash.sh/connect/vercel/deploy",
		// &integration-ids=oac_KkY2TcPxIWTDtL46WGqwZ4BF
		vercelImportShipkit:
			"https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Flacymorrow%2Flash&project-name=lash-www&framework=nextjs&buildCommand=pnpm%20run%20build&installCommand=pnpm%20install&redirect-url=https://lash.sh/connect/vercel/deploy",
		vercelDeployBones:
			"https://vercel.com/new/clone?repository-url=https://github.com/shipkit-io/bones&env=ADMIN_EMAIL&envDescription=Set%20administrator%20access%20for%20your%20deployment&envLink=https%3A%2F%2Fshipkit.io%2Fdocs%2Fenv&project-name=bones-app&repository-name=bones-app&redirect-url=https://shipkit.io/connect/vercel/deploy&developer-id=oac_KkY2TcPxIWTDtL46WGqwZ4BF&production-deploy-hook=Shipkit%20Deploy&demo-title=Shipkit%20Preview&demo-description=The%20official%20Shipkit%20Preview.%20A%20full%20featured%20demo%20with%20dashboards,%20AI%20tools,%20and%20integrations%20with%20Docs,%20Payload,%20and%20Builder.io&demo-url=https://shipkit.io/demo&demo-image=//assets.vercel.com/image/upload/contentful/image/e5382hct74si/4JmubmYDJnFtstwHbaZPev/0c3576832aae5b1a4d98c8c9f98863c3/Vercel_Home_OG.png",
	},
};

interface Redirect {
	source: Route;
	destination: Route;
	permanent: boolean;
}

/* eslint-disable-next-line @typescript-eslint/require-await */
export const redirects = async (): Promise<Redirect[]> => {
	return [
		...createRedirects(["/docs", "/documentation"], routes.docs),
		...createRedirects(["/join", "/signup", "/sign-up"], routes.auth.signUp),
		...createRedirects(["/login", "/log-in", "/signin", "/sign-in"], routes.auth.signIn),
		...createRedirects(["/logout", "/log-out", "/signout", "/sign-out"], routes.auth.signOut),
	];
};

export const createRedirects = (
	sources: Route[],
	destination: Route,
	permanent = false
): Redirect[] => {
	if (!sources.length) return [];

	return sources
		.map((source) => {
			if (source === destination) return null;
			return { source, destination, permanent };
		})
		.filter((redirect): redirect is Redirect => redirect !== null);
};
