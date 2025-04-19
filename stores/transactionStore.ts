import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "@/types";
import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
} from "date-fns";
import { transactionService } from "@/service/TransactionService";
import { db } from "@/service/database";

interface TransactionState {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadTransactions: (limit?: number) => Promise<void>;
    addTransaction: (transaction: Transaction) => Promise<string>;
    updateTransaction: (
        id: string,
        transaction: Partial<Transaction>
    ) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    getTransactionById: (id: string) => Transaction | undefined;

    // Filters
    getTransactionsByType: (type: "income" | "expense") => Transaction[];
    getTransactionsByCategory: (categoryId: string) => Transaction[];
    getTransactionsByWallet: (walletId: string) => Transaction[];
    getTransactionsByDateRange: (
        startDate: Date,
        endDate: Date
    ) => Transaction[];

    // Statistics
    getTotalIncome: (startDate?: Date, endDate?: Date) => number;
    getTotalExpense: (startDate?: Date, endDate?: Date) => number;
    getBalance: (startDate?: Date, endDate?: Date) => number;

    // Time periods
    getTransactionsToday: () => Transaction[];
    getTransactionsThisWeek: () => Transaction[];
    getTransactionsThisMonth: () => Transaction[];
    getTransactionsThisYear: () => Transaction[];

    // Clear all data (for testing)
    clearAllTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
    persist(
        (set, get) => ({
            transactions: [],
            isLoading: false,
            error: null,

            loadTransactions: async (limit = 50) => {
                try {
                    set({ isLoading: true, error: null });

                    // Initialize database if not already
                    await db.initDatabase();

                    // Get transactions from database
                    const dbTransactions =
                        await transactionService.getAllTransactions();

                    // Take only the most recent transactions up to the limit
                    const limitedTransactions = dbTransactions.slice(0, limit);

                    // Convert to Transaction[] format
                    const transactions = limitedTransactions.map(
                        (transaction) => ({
                            id: String(transaction.id),
                            amount: transaction.amount,
                            type: transaction.type,
                            currency: transaction.currency,
                            category: transaction.category,
                            date: new Date(transaction.date),
                            walletId: "1", // Legacy field needed by store
                            wallet: transaction.wallet,
                            categoryId: "1", // Legacy field needed by store
                            isRecurring: transaction.repeat !== "None",
                            note: transaction.note || "",
                        })
                    );

                    set({ transactions, isLoading: false });
                } catch (error) {
                    console.error("Error loading transactions:", error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error loading transactions",
                        isLoading: false,
                    });
                }
            },

            addTransaction: async (transaction) => {
                try {
                    set({ isLoading: true, error: null });

                    // Format for database
                    const dbTransaction = {
                        type: transaction.type,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        date: transaction.date.toISOString(),
                        wallet: transaction.wallet,
                        category: transaction.category,
                        repeat: transaction.isRecurring ? "monthly" : "None", // Default to monthly if recurring
                        note: transaction.note || "",
                        picture: "",
                    };

                    // Add to database
                    const transactionId =
                        await transactionService.createTransaction(
                            dbTransaction
                        );
                    const newTransaction = {
                        ...transaction,
                        id: String(transactionId),
                    };

                    // Update state
                    set((state) => ({
                        transactions: [newTransaction, ...state.transactions],
                        isLoading: false,
                    }));

                    return String(transactionId);
                } catch (error) {
                    console.error("Error creating transaction:", error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error creating transaction",
                        isLoading: false,
                    });
                    return "";
                }
            },

            updateTransaction: async (id, transaction) => {
                try {
                    set({ isLoading: true, error: null });

                    // Get existing transaction
                    const existing = get().getTransactionById(id);
                    if (!existing) {
                        throw new Error(`Transaction with id ${id} not found`);
                    }

                    // Format for database
                    const dbTransaction: Partial<{
                        type: "expense" | "income";
                        amount: number;
                        currency: string;
                        date: string;
                        wallet: string;
                        category: string;
                        repeat: string;
                        note: string;
                        picture: string;
                    }> = {};

                    if (transaction.type) dbTransaction.type = transaction.type;
                    if (transaction.amount !== undefined)
                        dbTransaction.amount = transaction.amount;
                    if (transaction.date)
                        dbTransaction.date = transaction.date.toISOString();
                    if (transaction.wallet)
                        dbTransaction.wallet = transaction.wallet;
                    if (transaction.category)
                        dbTransaction.category = transaction.category;
                    if (transaction.isRecurring !== undefined) {
                        dbTransaction.repeat = transaction.isRecurring
                            ? "monthly"
                            : "None";
                    }
                    if (transaction.note !== undefined)
                        dbTransaction.note = transaction.note;
                    if (transaction.currency !== undefined)
                        dbTransaction.picture = transaction.currency;

                    // Update in database
                    await transactionService.updateTransaction(
                        parseInt(id),
                        dbTransaction
                    );

                    // Update state
                    set((state) => ({
                        transactions: state.transactions.map((t) =>
                            t.id === id ? { ...t, ...transaction } : t
                        ),
                        isLoading: false,
                    }));
                } catch (error) {
                    console.error(`Error updating transaction ${id}:`, error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error updating transaction",
                        isLoading: false,
                    });
                }
            },

            deleteTransaction: async (id) => {
                try {
                    set({ isLoading: true, error: null });

                    // Delete from database
                    await transactionService.deleteTransaction(parseInt(id));

                    // Update state
                    set((state) => ({
                        transactions: state.transactions.filter(
                            (t) => t.id !== id
                        ),
                        isLoading: false,
                    }));
                } catch (error) {
                    console.error(`Error deleting transaction ${id}:`, error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error deleting transaction",
                        isLoading: false,
                    });
                }
            },

            getTransactionById: (id) => {
                return get().transactions.find((t) => t.id === id);
            },

            getTransactionsByType: (type) => {
                return get().transactions.filter((t) => t.type === type);
            },

            getTransactionsByCategory: (categoryId) => {
                return get().transactions.filter(
                    (t) => t.categoryId === categoryId
                );
            },

            getTransactionsByWallet: (walletId) => {
                return get().transactions.filter(
                    (t) => t.walletId === walletId
                );
            },

            getTransactionsByDateRange: (startDate, endDate) => {
                return get().transactions.filter((t) => {
                    const transactionDate = new Date(t.date);
                    return (
                        transactionDate >= startDate &&
                        transactionDate <= endDate
                    );
                });
            },

            getTotalIncome: (startDate, endDate) => {
                let transactions = get().transactions.filter(
                    (t) => t.type === "income"
                );

                if (startDate && endDate) {
                    transactions = transactions.filter((t) => {
                        const transactionDate = new Date(t.date);
                        return (
                            transactionDate >= startDate &&
                            transactionDate <= endDate
                        );
                    });
                }

                return transactions.reduce((sum, t) => sum + t.amount, 0);
            },

            getTotalExpense: (startDate, endDate) => {
                let transactions = get().transactions.filter(
                    (t) => t.type === "expense"
                );

                if (startDate && endDate) {
                    transactions = transactions.filter((t) => {
                        const transactionDate = new Date(t.date);
                        return (
                            transactionDate >= startDate &&
                            transactionDate <= endDate
                        );
                    });
                }

                return transactions.reduce((sum, t) => sum + t.amount, 0);
            },

            getBalance: (startDate, endDate) => {
                return (
                    get().getTotalIncome(startDate, endDate) -
                    get().getTotalExpense(startDate, endDate)
                );
            },

            getTransactionsToday: () => {
                const now = new Date();
                return get().getTransactionsByDateRange(
                    startOfDay(now),
                    endOfDay(now)
                );
            },

            getTransactionsThisWeek: () => {
                const now = new Date();
                return get().getTransactionsByDateRange(
                    startOfWeek(now),
                    endOfWeek(now)
                );
            },

            getTransactionsThisMonth: () => {
                const now = new Date();
                return get().getTransactionsByDateRange(
                    startOfMonth(now),
                    endOfMonth(now)
                );
            },

            getTransactionsThisYear: () => {
                const now = new Date();
                return get().getTransactionsByDateRange(
                    startOfYear(now),
                    endOfYear(now)
                );
            },

            clearAllTransactions: () => {
                set({ transactions: [] });
            },
        }),
        {
            name: "exptrac-transactions-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
