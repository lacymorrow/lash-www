import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    scale?: number;
    brandText?: string;
    showBrand?: boolean;
}

/*
 * SVG recreation of the Lash TUI header with:
 * - Left and right diagonal fields
 * - Blocky L A S H letters
 * - Horizontal pink→violet→indigo gradient across the title
 *
 * Chosen over Unicode half-block glyphs to prevent cross-platform width issues.
 */
export const LashTuiHeaderSvg = ({ className, scale = 14, brandText = "Lacy™ Shell", showBrand = true }: Props) => {
    const u = scale; // unit size per grid cell

    // Text-based logo rows
    const row1 = "█   ▄▀▀▀▄ ▄▀▀▀▀▀ █   █";
    const row2 = "█   █▀▀▀█ ▀▀▀▀▀█ █▀▀▀█";
    const row3 = "▀▀▀  ▀   ▀ ▀▀▀▀▀▀ ▀   ▀";

    // Compute overall SVG size
    const textWidth = row1.length * u * 0.6; // approximate character width
    const textHeight = u * 3.5; // 3 rows with spacing
    const pad = u; // padding around

    // Diagonal fields configuration
    const leftFieldWidth = u * 6;
    const rightFieldWidth = u * 28;
    const height = textHeight + pad * 3; // extra space for brand
    const totalWidth = leftFieldWidth + pad + textWidth + pad + rightFieldWidth;

    // Helpers
    const stripeSpacing = u * 0.9;
    const stripeWidth = u * 0.12;

    return (
        <svg
            className={cn("h-auto w-full", className)}
            viewBox={`0 0 ${totalWidth} ${height}`}
            role="img"
            aria-label="Lash header"
        >
            <defs>
                <linearGradient id="lash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <linearGradient id="field-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
                </linearGradient>
                <pattern id="field-stripes" patternUnits="userSpaceOnUse" width={stripeSpacing} height={stripeSpacing} patternTransform="rotate(60)">
                    <rect x="0" y="0" width={stripeWidth} height={stripeSpacing} fill="url(#field-grad)" />
                </pattern>
            </defs>

            {showBrand && (
                <text
                    x={leftFieldWidth}
                    y={pad * 0.9}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontSize={Math.max(10, Math.round(u * 0.8))}
                    fill="#d946ef"
                >
                    {brandText}
                </text>
            )}

            {/* Left field (pattern filled, clipped to region) */}
            <g transform={`translate(0, ${pad * 1.4})`}>
                <rect x={0} y={0} width={leftFieldWidth} height={textHeight} fill="url(#field-stripes)" opacity={0.85} />
            </g>

            {/* Text-based logo */}
            <g transform={`translate(${leftFieldWidth + pad}, ${pad * 2.5})`}>
                <text
                    x={0}
                    y={0}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, 'Courier New', monospace"
                    fontSize={u * 0.85}
                    fill="url(#lash-grad)"
                    dominantBaseline="text-before-edge"
                >
                    <tspan x={0} dy={0}>{row1}</tspan>
                    <tspan x={0} dy={u * 1.1}>{row2}</tspan>
                    <tspan x={0} dy={u * 1.1}>{row3}</tspan>
                </text>
            </g>

            {/* Right field (pattern filled, clipped to region) */}
            <g transform={`translate(${leftFieldWidth + pad + textWidth + pad}, ${pad * 1.4})`}>
                <rect x={0} y={0} width={rightFieldWidth} height={textHeight} fill="url(#field-stripes)" opacity={0.85} />
            </g>
        </svg>
    );
};


