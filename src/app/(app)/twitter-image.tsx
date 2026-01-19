import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site-config";

// Route segment config
export const runtime = "edge";

// Image metadata - Twitter uses 2:1 aspect ratio for summary_large_image
export const alt = siteConfig.description;
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

// Stylized LASH text rows (matching the TUI header component)
const row1 = "█   ▄▀▀▀▄ ▄▀▀▀▀▀ █   █";
const row2 = "█   █▀▀▀█ ▀▀▀▀▀█ █▀▀▀█";
const row3 = "▀▀▀ ▀   ▀ ▀▀▀▀▀▀ ▀   ▀";

export default async function Image() {
	// Load JetBrains Mono font for the terminal aesthetic
	const jetBrainsMono = fetch(
		new URL("https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff")
	).then((res) => res.arrayBuffer());

	const poppins = fetch(
		new URL("https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff")
	).then((res) => res.arrayBuffer());

	const [jetBrainsMonoData, poppinsData] = await Promise.all([jetBrainsMono, poppins]);

	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
					position: "relative",
				}}
			>
				{/* Decorative diagonal lines - left side */}
				<div
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						bottom: 0,
						width: 80,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						gap: 8,
					}}
				>
					{[...Array(12)].map((_, i) => (
						<div
							key={`left-${i}`}
							style={{
								height: 3,
								width: "100%",
								background: `linear-gradient(90deg, transparent 0%, ${i % 2 === 0 ? "#a855f7" : "#6366f1"} 50%, transparent 100%)`,
								opacity: 0.4,
								transform: "skewY(-45deg)",
							}}
						/>
					))}
				</div>

				{/* Decorative diagonal lines - right side */}
				<div
					style={{
						position: "absolute",
						right: 0,
						top: 0,
						bottom: 0,
						width: 80,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						gap: 8,
					}}
				>
					{[...Array(12)].map((_, i) => (
						<div
							key={`right-${i}`}
							style={{
								height: 3,
								width: "100%",
								background: `linear-gradient(90deg, transparent 0%, ${i % 2 === 0 ? "#a855f7" : "#6366f1"} 50%, transparent 100%)`,
								opacity: 0.4,
								transform: "skewY(45deg)",
							}}
						/>
					))}
				</div>

				{/* Brand name */}
				<div
					style={{
						display: "flex",
						fontSize: 20,
						fontFamily: "JetBrains Mono",
						color: "#e879f9",
						marginBottom: 16,
						letterSpacing: "0.1em",
					}}
				>
					Lacy™ Shell
				</div>

				{/* LASH ASCII art */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						fontFamily: "JetBrains Mono",
						fontSize: 42,
						lineHeight: 1.1,
						letterSpacing: "0.02em",
					}}
				>
					<div
						style={{
							background: "linear-gradient(90deg, #f472b6, #d946ef, #818cf8)",
							backgroundClip: "text",
							color: "transparent",
							whiteSpace: "pre",
						}}
					>
						{row1}
					</div>
					<div
						style={{
							background: "linear-gradient(90deg, #f472b6, #d946ef, #818cf8)",
							backgroundClip: "text",
							color: "transparent",
							whiteSpace: "pre",
						}}
					>
						{row2}
					</div>
					<div
						style={{
							background: "linear-gradient(90deg, #f472b6, #d946ef, #818cf8)",
							backgroundClip: "text",
							color: "transparent",
							whiteSpace: "pre",
						}}
					>
						{row3}
					</div>
				</div>

				{/* Tagline */}
				<div
					style={{
						display: "flex",
						fontSize: 28,
						fontFamily: "Poppins",
						color: "#cbd5e1",
						marginTop: 40,
						textAlign: "center",
					}}
				>
					The AI Shell for your terminal
				</div>

				{/* Description */}
				<div
					style={{
						display: "flex",
						fontSize: 18,
						fontFamily: "Poppins",
						color: "#94a3b8",
						marginTop: 16,
						textAlign: "center",
						maxWidth: 700,
					}}
				>
					A beautiful AI terminal for your code. Shell first, AI second.
				</div>

				{/* URL footer */}
				<div
					style={{
						position: "absolute",
						bottom: 40,
						display: "flex",
						alignItems: "center",
						gap: 12,
						fontSize: 18,
						fontFamily: "JetBrains Mono",
						color: "#64748b",
					}}
				>
					<span style={{ color: "#a855f7" }}>→</span>
					<span>lash.lacy.sh</span>
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{
					name: "JetBrains Mono",
					data: jetBrainsMonoData,
					style: "normal",
					weight: 400,
				},
				{
					name: "Poppins",
					data: poppinsData,
					style: "normal",
					weight: 400,
				},
			],
		}
	);
}
