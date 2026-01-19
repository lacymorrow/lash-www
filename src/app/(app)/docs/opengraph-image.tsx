import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Lash Documentation - Learn how to use the AI shell for your terminal";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

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
				{/* Terminal-style header bar */}
				<div
					style={{
						position: "absolute",
						top: 40,
						left: 60,
						right: 60,
						display: "flex",
						alignItems: "center",
						gap: 10,
					}}
				>
					<div style={{ display: "flex", gap: 8 }}>
						<div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ef4444" }} />
						<div style={{ width: 14, height: 14, borderRadius: "50%", background: "#eab308" }} />
						<div style={{ width: 14, height: 14, borderRadius: "50%", background: "#22c55e" }} />
					</div>
					<div
						style={{
							marginLeft: 16,
							fontSize: 14,
							fontFamily: "JetBrains Mono",
							color: "#64748b",
						}}
					>
						~/lash/docs
					</div>
				</div>

				{/* Main content */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						marginTop: 20,
					}}
				>
					{/* Logo/Brand */}
					<div
						style={{
							display: "flex",
							fontSize: 48,
							fontFamily: "JetBrains Mono",
							background: "linear-gradient(90deg, #f472b6, #d946ef, #818cf8)",
							backgroundClip: "text",
							color: "transparent",
							fontWeight: 700,
							letterSpacing: "-0.02em",
						}}
					>
						LASH
					</div>

					{/* Documentation badge */}
					<div
						style={{
							display: "flex",
							marginTop: 20,
							padding: "8px 24px",
							background: "rgba(168, 85, 247, 0.15)",
							border: "1px solid rgba(168, 85, 247, 0.3)",
							borderRadius: 9999,
							fontSize: 16,
							fontFamily: "JetBrains Mono",
							color: "#a855f7",
						}}
					>
						Documentation
					</div>

					{/* Title */}
					<div
						style={{
							display: "flex",
							fontSize: 36,
							fontFamily: "Poppins",
							color: "#f1f5f9",
							marginTop: 40,
							textAlign: "center",
						}}
					>
						Learn the AI Shell
					</div>

					{/* Description */}
					<div
						style={{
							display: "flex",
							fontSize: 20,
							fontFamily: "Poppins",
							color: "#94a3b8",
							marginTop: 16,
							textAlign: "center",
							maxWidth: 700,
						}}
					>
						Installation, configuration, and usage guides
					</div>
				</div>

				{/* Code example preview */}
				<div
					style={{
						position: "absolute",
						bottom: 60,
						display: "flex",
						alignItems: "center",
						gap: 8,
						fontFamily: "JetBrains Mono",
						fontSize: 16,
						color: "#64748b",
					}}
				>
					<span style={{ color: "#22c55e" }}>$</span>
					<span style={{ color: "#94a3b8" }}>lash "explain this error"</span>
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
