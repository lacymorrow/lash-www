import type { NextConfig } from "next";
import path from "node:path";
import webpack from "webpack";
import type { Configuration as WebpackConfig } from "webpack";
import { buildTimeFeatureFlags, buildTimeFeatures } from "@/config/features-config";
import { FILE_UPLOAD_MAX_SIZE } from "@/config/file";
import { redirects } from "@/config/routes";
import { withPlugins } from "@/config/with-plugins";

const nextConfig: NextConfig = {
	env: {
		// Add client-side feature flags
		...buildTimeFeatureFlags,

		// You can add other build-time env variables here if needed
	},

	/*
	 * Next.js configuration
	 */
	images: {
		remotePatterns: [
			{ hostname: "shipkit.io" }, // @dev: for testing
			{ hostname: "picsum.photos" }, // @dev: for testing
			{ hostname: "avatar.vercel.sh" }, // @dev: for testing
			{ hostname: "github.com" }, // @dev: for testing
			{ hostname: "images.unsplash.com" }, // @dev: for testing
			{ hostname: "2.gravatar.com" }, // @dev: for testing
			{ hostname: "avatars.githubusercontent.com" }, // @dev: github avatars
			{ hostname: "vercel.com" }, // @dev: vercel button
			{
				protocol: "https",
				hostname: "**.vercel.app",
			},
			{
				protocol: "https",
				hostname: "shipkit.s3.**.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "better-auth.com",
			},
		],
		/*
		 * Next.js 15+ Enhanced Image Optimization
		 * Optimized for Core Web Vitals and performance
		 */
		formats: ["image/avif", "image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 3600, // 1 hour cache
		// dangerouslyAllowSVG: true,
		// contentDispositionType: "attachment",
		// contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},

	/*
	 * Redirects are located in the `src/config/routes.ts` file
	 */
	redirects,

	/*
	 * PostHog reverse proxy configuration
	 */
	async rewrites() {
		return [
			{
				source: "/relay-64tM/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/relay-64tM/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
			{
				source: "/relay-64tM/flags",
				destination: "https://us.i.posthog.com/flags",
			},
		];
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,

	async headers() {
		return Promise.resolve([
			// /install
			{
				source: "/install",
				headers: [
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin",
					},
					{
						key: "Cross-Origin-Embedder-Policy",
						value: "require-corp",
					},
				],
			},
			/*
			 * Enhanced Security Headers
			 * Adds Content Security Policy for better security
			 */
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					// @production
					// {
					// 	key: "Permissions-Policy",
					// 	value: "camera=(), microphone=(), geolocation=()",
					// },
				],
			},
		]);
	},

	// Production optimizations
	compress: true,
	poweredByHeader: false,

	/*
	 * React configuration
	 */
	reactStrictMode: true,

	/*
	 * Source maps - DISABLED to reduce memory usage during build
	 * Enable only in development or when specifically needed
	 */
	productionBrowserSourceMaps: false,

	/*
	 * Lint configuration
	 */
	typescript: {
		/*
	  !! WARNING !!
	  * Dangerously allow production builds to successfully complete even if
	  * your project has type errors.
	*/
		ignoreBuildErrors: false,
	},

	// Configure `pageExtensions` to include markdown and MDX files
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

	/*
	 * Experimental configuration
	 */
	experimental: {
		// esmExternals: true,
		// mdxRs: true,
		// mdxRs: {
		// 	jsxRuntime: "automatic",
		// 	jsxImportSource: "jsx-runtime",
		// 	mdxType: "gfm",
		// },

		nextScriptWorkers: true,
		serverActions: {
			bodySizeLimit: FILE_UPLOAD_MAX_SIZE,
		},
		// @see: https://nextjs.org/docs/app/api-reference/next-config-js/viewTransition
		viewTransition: true,
		webVitalsAttribution: ["CLS", "LCP", "TTFB", "FCP", "FID"],

		// Optimized prefetching
		optimisticClientCache: true,

		/*
		 * Client-side Router Cache Configuration
		 * Optimizes navigation performance by caching page segments
		 */
		staleTimes: {
			dynamic: buildTimeFeatures.PAYLOAD_ENABLED ? 0 : 90, // Payload needs to be re-rendered on every request
			static: 360, // 360 seconds for static routes
		},

		// Memory optimization for builds
		// webpackBuildWorker: false, // Disable for low memory
		// cpus: 1, // Limit concurrent operations
		// workerThreads: false, // Disable worker threads
		// @note Next type defs lag behind Next releases; we keep these flags enabled at runtime.
	} as NonNullable<NextConfig["experimental"]>,

	/*
	 * Miscellaneous configuration
	 */
	devIndicators: {
		position: "bottom-left" as const,
	},

	/*
	 * Logging configuration
	 * @see https://nextjs.org/docs/app/api-reference/next-config-js/logging
	 */
	logging: {
		fetches: {
			fullUrl: true, // This will log the full URL of the fetch request even if cached
			// hmrRefreshes: true,
		},
	},

	compiler: {
		// Logs are disabled in production unless DISABLE_LOGGING is set
		// Use DISABLE_LOGGING to disable all logging except error logs
		// Use DISABLE_ERROR_LOGGING to disable error logging too
		removeConsole:
			process.env.DISABLE_LOGGING === "true" ||
				(process.env.NODE_ENV === "production" && !process.env.DISABLE_LOGGING)
				? process.env.DISABLE_ERROR_LOGGING === "true" ||
					(process.env.NODE_ENV === "production" && !process.env.DISABLE_ERROR_LOGGING)
					? true
					: { exclude: ["error"] }
				: false,
	},

	/*
	 * Bundle Size Optimization - Enhanced
	 * Excludes additional heavy dependencies and dev tools from production bundles
	 */
	outputFileTracingExcludes: {
		"*": [
			"**/*.test.*",
			"**/*.spec.*",
			"**/*.stories.*",
			"**/tests/**",
			"**/.git/**",
			"**/.github/**",
			"**/.vscode/**",
			"**/.next/cache/**",
			"**/node_modules/typescript/**",
			"**/node_modules/@types/**",
			"**/node_modules/eslint/**",
			"**/node_modules/prettier/**",
			"**/node_modules/typescript/**",
			"**/node_modules/react-syntax-highlighter/**",
			"**/node_modules/canvas-confetti/**",
			"**/node_modules/@huggingface/transformers/**",
			"**/node_modules/three/**",
			"**/node_modules/@react-three/**",
			"**/node_modules/jspdf/**",
			// Additional Next.js 15 optimizations
			"**/node_modules/monaco-editor/**",
			"**/node_modules/@playwright/**",
			"**/node_modules/typescript/lib/**",
			// Exclude more heavy dependencies
			"**/node_modules/remotion/**",
			"**/node_modules/@opentelemetry/**",
			"**/node_modules/googleapis/**",
			"**/node_modules/@tsparticles/**",
			"**/node_modules/marked/**",
			"**/node_modules/remark/**",
			"**/node_modules/rehype/**",
			// Additional memory-heavy dependencies
			// "**/node_modules/onnxruntime-node/**",
			// "**/node_modules/onnxruntime-web/**",
			"**/node_modules/@tabler/**",
			"**/node_modules/@stackframe/**",
			"**/node_modules/@doubletie/**",
			"**/node_modules/mathjax-full/**",
			"**/node_modules/@sentry/**",
			"**/node_modules/@aws-sdk/**",
			"**/node_modules/@webcontainer/**",
			"**/node_modules/.cache/**",
			"**/node_modules/.store/**",
		],
	},
	outputFileTracingIncludes: {
		"*": ["./docs/**/*", "./src/content/**/*"],
	},

	/*
	 * Turbopack configuration
	 * @see https://nextjs.org/docs/app/api-reference/next-config-js/turbo
	 */
	turbopack: {
		rules: {
			// Add rules for raw-loader to handle specific file types
			// This mirrors the webpack config for these extensions
			"*.(node|bin|html)": {
				loaders: ["raw-loader"],
				as: "*.js",
			},
		},
	},

	/*
	 * Webpack configuration
	 */
	webpack: (config: WebpackConfig, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
		// Enable top-level await
		config.experiments = { ...config.experiments, topLevelAwait: true };

		// Webpack config objects are partially-defined; normalize the pieces we mutate.
		config.module ??= { rules: [] };
		config.module.rules ??= [];
		config.resolve ??= {};

		/*
		 * Some upstream packages (notably `thread-stream` via `pino` / `payload`)
		 * ship test/bench files that reference dev-only dependencies (`tap`, `fastbench`, etc).
		 * Next's bundler can end up tracing those files and attempting to resolve the deps,
		 * which breaks production builds.
		 *
		 * We alias those optional/dev-only deps to an empty shim so the build can proceed.
		 */
		const emptyModulePath = path.join(process.cwd(), "src", "shims", "empty-module.cjs");
		config.plugins ??= [];
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(/^tap$/, emptyModulePath),
			new webpack.NormalModuleReplacementPlugin(/^desm$/, emptyModulePath),
			new webpack.NormalModuleReplacementPlugin(/^fastbench$/, emptyModulePath),
			new webpack.NormalModuleReplacementPlugin(/^pino-elasticsearch$/, emptyModulePath),
			new webpack.NormalModuleReplacementPlugin(/^mysql2$/, emptyModulePath),
			new webpack.NormalModuleReplacementPlugin(/^mysql2\/promise$/, emptyModulePath),
		);

		// Add support for async/await in web workers
		config.module.rules.push({
			test: /\.worker\.(js|ts)$/,
			use: {
				loader: "worker-loader",
				options: {
					filename: "static/[hash].worker.js",
					publicPath: "/_next/",
				},
			},
		});

		if (isServer) {
			// Ensure docs directory is included in the bundle for dynamic imports
			config.module.rules.push({
				test: /\.(md|mdx)$/,
				include: [
					path.join(process.cwd(), "docs"),
					// require("path").join(process.cwd(), "src/content/docs"),
				],
				use: "raw-loader",
			});
		}

		// External heavy dependencies that are not used in most pages
		if (!dev && isServer) {
			const existingExternals = Array.isArray(config.externals)
				? config.externals
				: config.externals
					? [config.externals]
					: [];
			config.externals = [
				...existingExternals,
				{
					"@huggingface/transformers": "commonjs @huggingface/transformers",
					googleapis: "commonjs googleapis",
					"monaco-editor": "commonjs monaco-editor",
					/*
					 * Prevent Next/webpack from crawling these packages during bundling.
					 * They pull in optional or dev-only files (tests, benches, platform bins)
					 * that are not required for runtime in this app.
					 */
					"thread-stream": "commonjs thread-stream",
					"drizzle-kit": "commonjs drizzle-kit",
				},
			];
		}

		// Completely ignore ONNX runtime packages
		const existingAlias =
			config.resolve.alias && typeof config.resolve.alias === "object" && !Array.isArray(config.resolve.alias)
				? (config.resolve.alias as Record<string, unknown>)
				: {};
		config.resolve.alias = {
			...existingAlias,
			// "onnxruntime-node": false,
			// "onnxruntime-common": false,
			tap: emptyModulePath,
			desm: emptyModulePath,
			fastbench: emptyModulePath,
			"pino-elasticsearch": emptyModulePath,
			mysql2: emptyModulePath,
			"mysql2/promise": emptyModulePath,
		};

		return config;
	},
};

/*
 * Apply Next.js configuration plugins using the withPlugins utility.
 * The utility handles loading and applying functions exported from files
 * in the specified directory (default: src/config/nextjs).
 */
export default withPlugins(nextConfig);
