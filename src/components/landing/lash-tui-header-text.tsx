import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    brandText?: string;
}

/*
 * Text-based recreation of the Lash header using a monospaced font and
 * block-drawing characters. This more closely mirrors the terminal output
 * when rendered with consistent font metrics.
 */
export const LashTuiHeaderText = ({ className, brandText = "Lacy™ Shell" }: Props) => {
    // 3-row stylized L A S H using block glyphs
    const row1 = "█   ▄▀▀▀▄ ▄▀▀▀▀▀ █   █";
    const row2 = "█   █▀▀▀█ ▀▀▀▀▀█ █▀▀▀█";
    const row3 = "▀▀▀ ▀   ▀ ▀▀▀▀▀▀ ▀   ▀";

    return (
        <div className={cn("select-none font-mono leading-none", className)}>
            <div className="mb-2 text-center text-xs text-fuchsia-400">{brandText}</div>

            <pre className="m-0 whitespace-pre text-[clamp(14px,4vw,22px)]">
                <span className={cn(
                    "bg-gradient-to-r from-pink-400 via-fuchsia-500 to-indigo-400",
                    "bg-clip-text text-transparent"
                )}>{row1}</span>
                {"\n"}
                <span className={cn(
                    "bg-gradient-to-r from-pink-400 via-fuchsia-500 to-indigo-400",
                    "bg-clip-text text-transparent"
                )}>{row2}</span>
                {"\n"}
                <span className={cn(
                    "bg-gradient-to-r from-pink-400 via-fuchsia-500 to-indigo-400",
                    "bg-clip-text text-transparent"
                )}>{row3}</span>
            </pre>
        </div>
    );
};


