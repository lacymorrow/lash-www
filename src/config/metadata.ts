import type { Metadata, Viewport } from "next";
import type { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import type { Twitter } from "next/dist/lib/metadata/types/twitter-types";
import { siteConfig } from "./site-config";

// Helper function to safely extract the default title string
const getDefaultTitleString = (title: Metadata["title"]): string | undefined => {
	if (typeof title === "string") {
		return title;
	}
	if (title && typeof title === "object" && "default" in title) {
		return title.default ?? undefined; // Return undefined if title.default is null
	}
	return undefined;
};

const defaultOpenGraph: OpenGraph = {
	type: "website",
	locale: siteConfig.metadata.locale,
	url: siteConfig.url,
	title: siteConfig.title,
	description: siteConfig.description,
	siteName: siteConfig.title,
	images: [
		{
			url: siteConfig.ogImage,
			width: siteConfig.metadata.openGraph.imageWidth,
			height: siteConfig.metadata.openGraph.imageHeight,
			alt: siteConfig.title,
		},
	],
};

const defaultTwitter: Twitter = {
	card: siteConfig.metadata.twitter.card,
	title: siteConfig.title,
	description: siteConfig.description,
	images: [
		{
			url: siteConfig.ogImage,
			width: siteConfig.metadata.openGraph.imageWidth,
			height: siteConfig.metadata.openGraph.imageHeight,
			alt: siteConfig.title,
		},
	],
	creator: siteConfig.creator.twitter,
};

export const defaultMetadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.title,
		template: `%s | ${siteConfig.tagline}`,
	},
	description: siteConfig.description,
	applicationName: siteConfig.title,
	authors: [
		{
			name: siteConfig.creator.name,
			url: siteConfig.creator.url,
		},
	],
	creator: siteConfig.creator.name,
	publisher: siteConfig.title,
	formatDetection: siteConfig.metadata.formatDetection,
	generator: siteConfig.metadata.generator,
	keywords: siteConfig.metadata.keywords,
	referrer: siteConfig.metadata.referrer,
	robots: siteConfig.metadata.robots,
	alternates: siteConfig.metadata.alternates,
	openGraph: defaultOpenGraph,
	twitter: defaultTwitter,
	appleWebApp: siteConfig.metadata.appleWebApp,
	appLinks: siteConfig.metadata.appLinks,
	archives: [siteConfig.metadata.blogPath],
	assets: [siteConfig.metadata.assetsPath],
	bookmarks: [siteConfig.metadata.bookmarksPath],
	category: siteConfig.metadata.category,
	classification: siteConfig.metadata.classification,
};

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	themeColor: [
		{
			media: "(prefers-color-scheme: light)",
			color: siteConfig.metadata.themeColor.light,
		},
		{
			media: "(prefers-color-scheme: dark)",
			color: siteConfig.metadata.themeColor.dark,
		},
	],
};

type ConstructMetadataProps = Metadata & {
	images?: { url: string; width: number; height: number; alt: string }[];
	noIndex?: boolean;
};

export const constructMetadata = ({
	images = [],
	noIndex = false,
	...metadata
}: ConstructMetadataProps = {}): Metadata => {
	// Use helper function to get title strings
	const metaTitleString = getDefaultTitleString(metadata.title);
	const defaultMetaTitleString = getDefaultTitleString(defaultMetadata.title);

	return {
		...defaultMetadata,
		...metadata,
		openGraph: {
			...defaultOpenGraph,
			// Assign the extracted title string or fallback
			title: metaTitleString ?? defaultMetaTitleString,
			// Ensure description is not null
			description: (metadata.description ?? defaultMetadata.description) || undefined,
			images: images.length > 0 ? images : defaultOpenGraph.images,
		},
		twitter: {
			...defaultTwitter,
			// Assign the extracted title string or fallback
			title: metaTitleString ?? defaultMetaTitleString,
			// Ensure description is not null
			description: (metadata.description ?? defaultMetadata.description) || undefined,
			images: images.length > 0 ? images : defaultTwitter.images,
		},
		robots: noIndex ? { index: false, follow: true } : defaultMetadata.robots,
	};
};

// Route-specific metadata for better CTR
export const routeMetadata = {
	home: {
		title: `${siteConfig.title} — ${siteConfig.tagline}`,
		description: `${siteConfig.description} Type shell commands or chat naturally with your command line from any terminal.`,
	},
	features: {
		title: `Features | ${siteConfig.title} - AI Shell for your terminal`,
		description: `Discover ${siteConfig.title}'s powerful features: natural language commands, AI-assisted coding, shell integration, and more. The AI shell that works anywhere.`,
	},
	pricing: {
		title: `Pricing | ${siteConfig.title}`,
		description:
			"Lash is free and open source. Install via Homebrew or npm and start using AI in your terminal today.",
	},
	docs: {
		title: `Documentation | ${siteConfig.title}`,
		description: `Get started with ${siteConfig.title}: installation, configuration, and usage guides. Learn how to use natural language commands in your terminal.`,
	},
};
