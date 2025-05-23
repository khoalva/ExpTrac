import * as z from "zod";

//transaction:
// id @primary @autoIncrement
// type @string [expense, income]
// amount @number
// currency @string [vnd, usd]
// date @datetime
// wallet @string ~relation @Wallet
// category @string ~relation @Category
// repeat @string [None, custom days]
// note @string @nullable
// picture @string @nullable

export const TransactionSchema = z.object({
    type: z.enum(["expense", "income"]),
    amount: z.number().positive(),
    currency: z.string(),
    date: z.union([
        z.string(),
        z.date().transform((date) => date.toISOString()),
    ]),
    wallet: z.string(),
    category: z.string(),
    repeat: z.string().default("None"),
    note: z.string().optional(),
    picture: z.string().optional(),
});

// Define TransactionFormValues interface based on the schema
export interface TransactionFormValues {
    type: "expense" | "income";
    amount: number;
    currency: string;
    date: Date;
    wallet: string;
    category: string;
    repeat?: string;
    note?: string;
    picture?: string;
}

// budget:
// name @unique @primary
// amount @number
// currency @string [vnd. usd]
// wallet @string relation @Wallet
// repeat @string [None, custom days]

export const BudgetSchema = z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    currency: z.string(),
    wallet: z.string(),
    repeat: z.string(),
});

// subscription
// name @unique @primary
// amount @number
// currency @string [vnd. usd]
// billing_date @datetime
// repeat [custom day]
// reminder_before [in minutes]
// category @string ~relation @Category

export const SubscriptionSchema = z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    currency: z.string(),
    billing_date: z.string(),
    repeat: z.string(),
    reminder_before: z.number().positive(),
    category: z.string(),
});

// wallet
// name @unique @primary
// init_amount @number
// currency @string [vnd, usd]
// visible_category @string ~relation @Category

export const WalletSchema = z.object({
    name: z.string().min(1),
    init_amount: z.number().positive(),
    currency: z.string(),
    visible_category: z.string(),
});

// category
// name @primary @unique

export const CategorySchema = z.object({
    name: z.string().min(1),
});

// user:
// password @number
// name @string
// avatar @string

export const UserSchema = z.object({
    password: z.string().min(1),
    name: z.string().min(1),
    avatar: z.string().optional(),
});
