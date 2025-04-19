import {
    format,
    isToday,
    isYesterday,
    isThisWeek,
    isThisMonth,
    isThisYear,
} from "date-fns";
import { getCurrencyByCode } from "@/constants/currencies";

export const formatDate = (date: Date): string => {
    if (isToday(date)) {
        return `Today, ${format(date, "MMM d")}`;
    } else if (isYesterday(date)) {
        return `Yesterday, ${format(date, "MMM d")}`;
    } else if (isThisWeek(date)) {
        return format(date, "EEEE, MMM d");
    } else if (isThisMonth(date)) {
        return format(date, "MMM d");
    } else if (isThisYear(date)) {
        return format(date, "MMM d");
    } else {
        return format(date, "MMM d, yyyy");
    }
};

export const formatShortDate = (date: Date): string => {
    return format(date, "MMM d, yyyy");
};

export const formatCurrency = (
    amount: number,
    currencyCode: string = "VND"
): string => {
    const currency = getCurrencyByCode(currencyCode);

    // Format with thousand separators
    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "decimal",
        maximumFractionDigits: 0,
    }).format(amount);

    return `${formattedAmount} ${currency.code}`;
};

export const formatTransactionAmount = (
    amount: number,
    type: "income" | "expense",
    currencyCode: string = "VND"
): string => {
    const prefix = type === "income" ? "+ " : "- ";
    return `${prefix}${formatCurrency(Math.abs(amount), currencyCode)}`;
};

export const formatPercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
};

export const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    return format(date, "MMM d, yyyy");
};
