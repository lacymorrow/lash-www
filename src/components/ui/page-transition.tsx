"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import * as React from "react";

interface PageTransitionProps {
	children: React.ReactNode;
	className?: string;
}

const pageVariants = {
	initial: {
		opacity: 0,
		y: 20,
	},
	in: {
		opacity: 1,
		y: 0,
	},
	out: {
		opacity: 0,
		y: -20,
	},
};

const pageTransition = {
	type: "tween" as const,
	ease: "easeInOut",
	duration: 0.3,
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
	const pathname = usePathname();

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={pathname}
				initial="initial"
				animate="in"
				exit="out"
				variants={pageVariants}
				transition={pageTransition}
				className={className}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
};

export const FadeIn: React.FC<{
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
}> = ({ children, delay = 0, duration = 0.4, className }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration,
				delay,
				ease: "easeOut",
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export const SlideIn: React.FC<{
	children: React.ReactNode;
	direction?: "left" | "right" | "up" | "down";
	delay?: number;
	duration?: number;
	className?: string;
}> = ({ children, direction = "up", delay = 0, duration = 0.4, className }) => {
	const getInitialPosition = () => {
		switch (direction) {
			case "left":
				return { x: -30, y: 0 };
			case "right":
				return { x: 30, y: 0 };
			case "up":
				return { x: 0, y: 30 };
			case "down":
				return { x: 0, y: -30 };
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, ...getInitialPosition() }}
			animate={{ opacity: 1, x: 0, y: 0 }}
			transition={{
				duration,
				delay,
				ease: "easeOut",
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export const StaggerChildren: React.FC<{
	children: React.ReactNode;
	staggerDelay?: number;
	className?: string;
}> = ({ children, staggerDelay = 0.1, className }) => {
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				visible: {
					transition: {
						staggerChildren: staggerDelay,
					},
				},
			}}
			className={className}
		>
			{React.Children.map(children, (child, index) => (
				<motion.div
					key={index}
					variants={{
						hidden: { opacity: 0, y: 20 },
						visible: { opacity: 1, y: 0 },
					}}
					transition={{ duration: 0.4, ease: "easeOut" }}
				>
					{child}
				</motion.div>
			))}
		</motion.div>
	);
};

export const ScaleIn: React.FC<{
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
}> = ({ children, delay = 0, duration = 0.3, className }) => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{
				duration,
				delay,
				ease: "easeOut",
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};