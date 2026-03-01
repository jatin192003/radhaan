import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "INR"): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

export function calculateRentalDays(start: string | Date, end: string | Date): number {
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        DISPATCHED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
        DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        RETURNED: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[status] ?? "bg-neutral-100 text-neutral-700";
}

export function getOrderTypeLabel(type: string): string {
    return type === "RENT" ? "Rental" : type === "PURCHASE" ? "Purchase" : "Rental + Purchase";
}

export function truncate(str: string, length: number): string {
    return str.length > length ? str.slice(0, length) + "…" : str;
}

export const ANIMATION_VARIANTS = {
    fadeInUp: {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
    },
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } },
    },
    scaleIn: {
        hidden: { opacity: 0, scale: 0.92 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } },
    },
    stagger: {
        visible: { transition: { staggerChildren: 0.08 } },
    },
    slideInRight: {
        hidden: { opacity: 0, x: 32 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    },
} as const;
