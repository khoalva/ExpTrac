export type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
};

export type Wallet = {
    id: string;
    name: string;
    init_amount: number;
    currency: string;
    visible_category: string;
};

export type Category = {
    name: string;
};

export type Transaction = {
    id: string;
    amount: number;
    type: "income" | "expense";
    currency: string;
    category: string;
    categoryId: string;
    date: Date;
    walletId: string;
    wallet: string;
    note?: string;
    image?: string;
    isRecurring?: boolean;
    recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
    nextBillDate?: Date;
};

export type Budget = {
    id: string;
    name: string;
    amount: number;
    spent: number;
    remaining: number;
    categoryId?: string;
    walletId?: string;
    startDate: Date;
    endDate: Date;
    period: "daily" | "weekly" | "monthly" | "yearly";
    currency: string;
};

export type Currency = {
    code: string;
    symbol: string;
    name: string;
};

export type Notification = {
    id: string;
    title: string;
    message: string;
    type: "reminder" | "alert" | "success";
    read: boolean;
    date: Date;
    relatedId?: string;
    relatedType?: "transaction" | "budget" | "goal";
};

export type DateRange = {
    startDate: Date;
    endDate: Date;
};

export type ChartData = {
    labels: string[];
    datasets: {
        data: number[];
        colors?: string[];
    }[];
};

export type TransactionType = "income" | "expense";

export type Subscription = {
    name: string;
    amount: number;
    currency: string;
    repeat: string;
    billing_date: Date;
    reminder_before?: number; // in days
    category?: string; // optional
};

