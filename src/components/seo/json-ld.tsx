import { siteConfig } from "@/config/site-config";

/**
 * JSON-LD Structured Data for SEO
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

export function WebsiteJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteConfig.title,
		alternateName: "Lacy Shell",
		url: siteConfig.url,
		description: siteConfig.description,
		publisher: {
			"@type": "Person",
			name: siteConfig.creator.fullName,
			url: siteConfig.creator.url,
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

export function SoftwareApplicationJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: siteConfig.title,
		applicationCategory: "DeveloperApplication",
		operatingSystem: "macOS, Linux, Windows",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		description: siteConfig.description,
		url: siteConfig.url,
		author: {
			"@type": "Person",
			name: siteConfig.creator.fullName,
			url: siteConfig.creator.url,
		},
		softwareHelp: {
			"@type": "WebPage",
			url: `${siteConfig.url}/docs`,
		},
		downloadUrl: "https://github.com/lacymorrow/lash/releases",
		installUrl: "https://github.com/lacymorrow/lash#installation",
		releaseNotes: "https://github.com/lacymorrow/lash/releases",
		screenshot: `${siteConfig.url}/app/og-image.png`,
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "5",
			ratingCount: "1",
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

export function OrganizationJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteConfig.title,
		url: siteConfig.url,
		logo: `${siteConfig.url}/logo.png`,
		sameAs: [
			siteConfig.links.github,
			siteConfig.links.twitter,
			siteConfig.links.x,
		],
		contactPoint: {
			"@type": "ContactPoint",
			email: siteConfig.email.support,
			contactType: "customer support",
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}
