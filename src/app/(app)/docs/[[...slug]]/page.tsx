import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import { SuspenseFallback } from "@/components/primitives/suspense-fallback";
import { constructMetadata } from "@/config/metadata";
import { getAllDocSlugsFromFileSystem, getDocFromParams } from "@/lib/docs";
import { useMDXComponents } from "@/mdx-components";

interface PageProps {
	params: Promise<{
		slug: string[];
	}>;
}

export async function generateStaticParams() {
	const slugs = await getAllDocSlugsFromFileSystem();

	return slugs.map((slug: string) => {
		// For the index page, return empty array for slug
		if (slug === "index") {
			return { slug: [] };
		}
		// For other pages, split the slug into segments
		return { slug: slug.split("/") };
	});
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const defaultMetadata = constructMetadata({
		title: "Documentation | Lash",
		description:
			"Lash documentation. Installation guides, configuration, supported AI providers, and MCP tool reference.",
		openGraph: {
			type: "article",
			siteName: "Lash Documentation",
			locale: "en_US",
		},
	});

	try {
		const doc = await getDocFromParams(params);

		if (!doc) {
			return defaultMetadata;
		}

		return constructMetadata({
			title: `${doc.title} - Lash Documentation`,
			description:
				doc.description ||
				"Learn how to use Lash features in your development workflow. Detailed guides and examples included.",
			openGraph: {
				type: "article",
				siteName: "Lash Documentation",
				title: doc.title,
				description: doc.description,
				locale: "en_US",
			},
		});
	} catch (error) {
		return defaultMetadata;
	}
}

export default async function DocsPage({ params }: PageProps) {
	const doc = await getDocFromParams(params);

	if (!doc || !doc.content) {
		notFound();
	}

	return (
		<article className="docs-content">
			<Suspense fallback={<SuspenseFallback />}>
				<MDXRemote source={doc.content} components={useMDXComponents({})} />
			</Suspense>
		</article>
	);
}

export const dynamicParams = false;
