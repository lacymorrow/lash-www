import { cn } from "@/lib/utils";

interface LogoParts {
    left: string;
    title: string;
    right: string;
}

function buildLashAsciiLogo(): { brand: string; lines: LogoParts[] } {
    // Simple, deterministic render matching the 3-row letterforms from the TUI.
    // Spacing and characters mirror internal `logo.go` letterforms (no stretch).
    const space = (n: number) => " ".repeat(Math.max(0, n));

    // Letters (width-balanced to look close to the TUI output)
    const L1 = ["█", "█", "▀▀▀"]; // side + baseline
    const A1 = ["▄▀▀▀▄", "█▀▀▀█", "▀   ▀"];
    const S1 = ["▄▀▀▀▀▀", "▀▀▀▀▀█", "▀▀▀▀▀ "]; // stylized S
    const H1 = ["█   █", "█▀▀▀█", "▀   ▀"];

    const gap = " ";
    const rows = 3;

    // Build title rows: L + A + S + H with one space gap
    const titleRows: string[] = [];
    for (let i = 0; i < rows; i++) {
        const r = [L1[i], gap, A1[i], gap, S1[i], gap, H1[i]].join("");
        titleRows.push(r);
    }

    // Fields: left fixed width, right tapered width to emulate diagonal field
    const leftWidth = 6;
    const rightWidth = 18;
    const diag = "╱";
    const makeDiag = (w: number) => diag.repeat(Math.max(0, w));

    const lines: LogoParts[] = titleRows.map((row, i) => {
        const left = makeDiag(leftWidth);
        const right = makeDiag(rightWidth - i);
        // Add a single space gap between left/title/right similar to lipgloss JoinHorizontal
        return {
            left,
            title: row,
            right,
        };
    });

    return {
        brand: " Lacy™ Shell",
        lines,
    };
}

export const LashTuiHeader = ({ className }: { className?: string }) => {
    const { brand, lines } = buildLashAsciiLogo();

    return (
        <div className={cn("font-mono leading-none", className)}>
            {/* Brand row */}
            <div className="mb-2 text-xs text-fuchsia-400">
                {brand}
            </div>

            {/* Logo block: left field, gradient title, right field */}
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl">
                {lines.map((part, idx) => (
                    <div key={idx} className="flex select-none items-start gap-1">
                        <span className="whitespace-pre text-indigo-400/80">{part.left}</span>
                        <span
                            className={cn(
                                "whitespace-pre bg-gradient-to-r",
                                "from-fuchsia-400 via-fuchsia-500 to-indigo-400",
                                "bg-clip-text text-transparent"
                            )}
                        >
                            {part.title}
                        </span>
                        <span className="whitespace-pre text-indigo-400/80">{part.right}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


