import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    scale?: number;
}

/*
 * SVG recreation of the Lash TUI header with:
 * - Left and right diagonal fields
 * - Blocky L A S H letters
 * - Horizontal pink→violet→indigo gradient across the title
 *
 * Chosen over Unicode half-block glyphs to prevent cross-platform width issues.
 */
export const LashTuiHeaderSvg = ({ className, scale = 14 }: Props) => {
    const u = scale; // unit size per grid cell
    const g = Math.max(2, Math.round(scale * 0.2)); // small gap for visual crispness

    // Letter grid positions (x, y, w, h) in grid units
    // Coordinates are tuned to resemble the TUI layout while remaining readable.
    const L: Array<[number, number, number, number]> = [
        [0, 0, 1, 5], // vertical
        [0, 4, 3, 1], // baseline
    ];
    const A: Array<[number, number, number, number]> = [
        [5, 0, 5, 1], // top
        [5, 1, 1, 4], // left
        [9, 1, 1, 4], // right
        [5, 2, 5, 1], // crossbar
    ];
    const S: Array<[number, number, number, number]> = [
        [12, 0, 5, 1], // top
        [12, 1, 1, 1], // upper-left nub
        [12, 2, 5, 1], // middle
        [16, 3, 1, 1], // lower-right nub
        [12, 4, 5, 1], // bottom
    ];
    const H: Array<[number, number, number, number]> = [
        [19, 0, 1, 5], // left
        [23, 0, 1, 5], // right
        [19, 2, 5, 1], // crossbar
    ];

    const letters = [...L, ...A, ...S, ...H];

    // Compute overall SVG size
    const cols = 24; // max x + widths
    const rows = 5;
    const innerW = cols * u;
    const innerH = rows * u;
    const pad = u; // padding around

    // Diagonal fields configuration
    const leftFieldWidth = u * 6;
    const rightFieldWidth = u * 28;
    const height = innerH + pad * 2;
    const totalWidth = leftFieldWidth + pad + innerW + pad + rightFieldWidth;

    // Helpers
    const toPx = (n: number) => n * u;

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
            </defs>

            {/* Left field */}
            <g transform={`translate(0, ${pad})`}>
                {Array.from({ length: Math.floor(leftFieldWidth / (u * 0.9)) }).map((_, i) => (
                    <rect
                        key={i}
                        x={i * (u * 0.9)}
                        y={-pad * 0.4}
                        width={u * 0.12}
                        height={innerH + pad * 0.8}
                        fill="url(#field-grad)"
                        transform={`rotate(-60 ${i * (u * 0.9)} ${innerH / 2})`}
                        opacity={0.8}
                    />
                ))}
            </g>

            {/* Title letters */}
            <g transform={`translate(${leftFieldWidth + pad}, ${pad})`}>
                {letters.map(([x, y, w, h], idx) => (
                    <rect
                        key={idx}
                        x={toPx(x) + g}
                        y={toPx(y) + g}
                        width={toPx(w) - g * 2}
                        height={toPx(h) - g * 2}
                        rx={Math.max(2, Math.round(u * 0.2))}
                        fill="url(#lash-grad)"
                    />
                ))}
            </g>

            {/* Right field */}
            <g transform={`translate(${leftFieldWidth + pad + innerW + pad}, ${pad})`}>
                {Array.from({ length: Math.floor(rightFieldWidth / (u * 0.9)) }).map((_, i) => (
                    <rect
                        key={i}
                        x={i * (u * 0.9)}
                        y={-pad * 0.6}
                        width={u * 0.12}
                        height={innerH + pad}
                        fill="url(#field-grad)"
                        transform={`rotate(-60 ${i * (u * 0.9)} ${innerH / 2})`}
                        opacity={0.8}
                    />
                ))}
            </g>
        </svg>
    );
};


