import { cn } from "@/lib/utils";
import * as React from "react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "md" | "lg" | "xl";
	variant?: "default" | "primary" | "secondary";
}

const sizeClasses = {
	sm: "h-4 w-4 border-2",
	md: "h-6 w-6 border-2",
	lg: "h-8 w-8 border-3",
	xl: "h-12 w-12 border-4",
};

const variantClasses = {
	default: "border-muted-foreground/20 border-t-muted-foreground",
	primary: "border-primary/20 border-t-primary",
	secondary: "border-secondary/20 border-t-secondary",
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
	({ className, size = "md", variant = "default", ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"animate-spin rounded-full",
					sizeClasses[size],
					variantClasses[variant],
					className
				)}
				{...props}
			/>
		);
	}
);
Spinner.displayName = "Spinner";

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
	text?: string;
	spinnerSize?: SpinnerProps["size"];
}

export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
	({ className, text = "Loading...", spinnerSize = "lg", ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in",
					className
				)}
				{...props}
			>
				<div className="flex flex-col items-center space-y-4">
					<Spinner size={spinnerSize} variant="primary" />
					{text && (
						<p className="text-sm text-muted-foreground animate-pulse-soft">{text}</p>
					)}
				</div>
			</div>
		);
	}
);
LoadingOverlay.displayName = "LoadingOverlay";

interface LoadingDotsProps extends React.HTMLAttributes<HTMLSpanElement> {
	size?: "sm" | "md" | "lg";
}

const dotSizeClasses = {
	sm: "h-1 w-1",
	md: "h-1.5 w-1.5",
	lg: "h-2 w-2",
};

export const LoadingDots = React.forwardRef<HTMLSpanElement, LoadingDotsProps>(
	({ className, size = "md", ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={cn("inline-flex items-center space-x-1", className)}
				{...props}
			>
				{[0, 1, 2].map((i) => (
					<span
						key={i}
						className={cn(
							"rounded-full bg-current animate-pulse",
							dotSizeClasses[size]
						)}
						style={{
							animationDelay: `${i * 0.15}s`,
							animationDuration: "1.4s",
						}}
					/>
				))}
			</span>
		);
	}
);
LoadingDots.displayName = "LoadingDots";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
	value: number;
	max?: number;
	showLabel?: boolean;
	variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

const progressVariantClasses = {
	default: "bg-muted-foreground",
	primary: "bg-primary",
	secondary: "bg-secondary",
	success: "bg-green-500",
	warning: "bg-yellow-500",
	danger: "bg-red-500",
};

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
	({ className, value, max = 100, showLabel = false, variant = "primary", ...props }, ref) => {
		const percentage = Math.min(100, Math.max(0, (value / max) * 100));

		return (
			<div ref={ref} className={cn("w-full", className)} {...props}>
				<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
					<div
						className={cn(
							"h-full transition-all duration-500 ease-out",
							progressVariantClasses[variant]
						)}
						style={{ width: `${percentage}%` }}
					/>
				</div>
				{showLabel && (
					<p className="mt-2 text-sm text-muted-foreground">
						{Math.round(percentage)}%
					</p>
				)}
			</div>
		);
	}
);
ProgressBar.displayName = "ProgressBar";