import { cn } from "@/lib/utils";
import * as React from "react";

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"relative overflow-hidden rounded-md bg-muted",
					"before:absolute before:inset-0 before:-translate-x-full",
					"before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/10 before:to-transparent",
					"before:animate-[shimmer_2s_infinite]",
					className
				)}
				{...props}
			/>
		);
	}
);
Skeleton.displayName = "Skeleton";

const SkeletonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn("rounded-xl border bg-card p-6", className)}
				{...props}
			>
				<div className="space-y-3">
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-20 w-full" />
				</div>
			</div>
		);
	}
);
SkeletonCard.displayName = "SkeletonCard";

const SkeletonList = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { count?: number }
>(({ className, count = 3, ...props }, ref) => {
	return (
		<div ref={ref} className={cn("space-y-3", className)} {...props}>
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
					<Skeleton className="h-12 w-12 rounded-full" />
					<div className="space-y-2 flex-1">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
});
SkeletonList.displayName = "SkeletonList";

const SkeletonTable = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { rows?: number; cols?: number }
>(({ className, rows = 5, cols = 4, ...props }, ref) => {
	return (
		<div ref={ref} className={cn("w-full", className)} {...props}>
			<div className="border rounded-lg">
				<div className="border-b p-4">
					<div className="flex gap-4">
						{Array.from({ length: cols }).map((_, i) => (
							<Skeleton key={i} className="h-4 flex-1" />
						))}
					</div>
				</div>
				<div className="p-4 space-y-3">
					{Array.from({ length: rows }).map((_, rowIndex) => (
						<div key={rowIndex} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${rowIndex * 0.05}s` }}>
							{Array.from({ length: cols }).map((_, colIndex) => (
								<Skeleton key={colIndex} className="h-8 flex-1" />
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
});
SkeletonTable.displayName = "SkeletonTable";

const SkeletonText = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { lines?: number }
>(({ className, lines = 3, ...props }, ref) => {
	return (
		<div ref={ref} className={cn("space-y-2", className)} {...props}>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					key={i}
					className="h-4"
					style={{
						width: `${Math.random() * 40 + 60}%`,
						animationDelay: `${i * 0.1}s`,
					}}
				/>
			))}
		</div>
	);
});
SkeletonText.displayName = "SkeletonText";

export { Skeleton, SkeletonCard, SkeletonList, SkeletonTable, SkeletonText };
