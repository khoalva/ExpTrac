import { db } from "./database";

interface Transaction {
    id?: number;
    type: "expense" | "income";
    amount: number;
    currency: string;
    date: string;
    wallet: string;
    category: string;
    repeat?: string;
    note?: string;
    picture?: string;
}

class TransactionService {
    private static instance: TransactionService;

    private constructor() {}

    public static getInstance(): TransactionService {
        if (!TransactionService.instance) {
            TransactionService.instance = new TransactionService();
        }
        return TransactionService.instance;
    }

    public async createTransaction(
        transaction: Omit<Transaction, "id">
    ): Promise<number> {
        try {
            // Insert the transaction
            const result = await db.executeParameterizedQuery<{
                last_insert_rowid: number;
            }>(
                `INSERT INTO transaction_log (
                    type, amount, currency, date, wallet, category, repeat, note, picture
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    transaction.type,
                    transaction.amount,
                    transaction.currency,
                    transaction.date,
                    transaction.wallet,
                    transaction.category,
                    transaction.repeat || "None",
                    transaction.note || "",
                    transaction.picture || "",
                ]
            );

            return result[0]?.last_insert_rowid || 0;
        } catch (error) {
            console.error("Error creating transaction:", error);
            throw error;
        }
    }

    public async getAllTransactions(): Promise<Transaction[]> {
        try {
            const res = await db.executeQuery<Transaction>(
                "SELECT * FROM transaction_log ORDER BY date DESC"
            );

            console.log(res);

            return res;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            throw error;
        }
    }

    public async getTransactionById(id: number): Promise<Transaction | null> {
        try {
            const results = await db.executeParameterizedQuery<Transaction>(
                "SELECT * FROM transaction_log WHERE id = ?",
                [id]
            );

            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error(`Error fetching transaction with id ${id}:`, error);
            throw error;
        }
    }

    public async updateTransaction(
        id: number,
        transaction: Partial<Omit<Transaction, "id">>
    ): Promise<boolean> {
        try {
            // First, fetch the existing transaction
            const existingTransaction = await this.getTransactionById(id);
            if (!existingTransaction) {
                throw new Error(`Transaction with id ${id} not found`);
            }

            // Build updated transaction
            const updatedTransaction = {
                ...existingTransaction,
                ...transaction,
            };

            // Update the transaction in the database
            await db.executeParameterizedQuery(
                `UPDATE transaction_log SET 
                    type = ?, 
                    amount = ?, 
                    currency = ?, 
                    date = ?, 
                    wallet = ?, 
                    category = ?, 
                    repeat = ?, 
                    note = ?, 
                    picture = ?
                WHERE id = ?`,
                [
                    updatedTransaction.type,
                    updatedTransaction.amount,
                    updatedTransaction.currency,
                    updatedTransaction.date,
                    updatedTransaction.wallet,
                    updatedTransaction.category,
                    updatedTransaction.repeat || "None",
                    updatedTransaction.note || "",
                    updatedTransaction.picture || "",
                    id,
                ]
            );

            return true;
        } catch (error) {
            console.error(`Error updating transaction with id ${id}:`, error);
            throw error;
        }
    }

    public async deleteTransaction(id: number): Promise<boolean> {
        try {
            await db.executeParameterizedQuery(
                "DELETE FROM transaction_log WHERE id = ?",
                [id]
            );
            return true;
        } catch (error) {
            console.error(`Error deleting transaction with id ${id}:`, error);
            throw error;
        }
    }

    public async getTransactionsByCategory(
        category: string
    ): Promise<Transaction[]> {
        try {
            return await db.executeParameterizedQuery<Transaction>(
                "SELECT * FROM transaction_log WHERE category = ? ORDER BY date DESC",
                [category]
            );
        } catch (error) {
            console.error(
                `Error fetching transactions for category ${category}:`,
                error
            );
            throw error;
        }
    }

    public async getTransactionsByWallet(
        wallet: string
    ): Promise<Transaction[]> {
        try {
            return await db.executeParameterizedQuery<Transaction>(
                "SELECT * FROM transaction_log WHERE wallet = ? ORDER BY date DESC",
                [wallet]
            );
        } catch (error) {
            console.error(
                `Error fetching transactions for wallet ${wallet}:`,
                error
            );
            throw error;
        }
    }

    public async getCategories(): Promise<string[]> {
        try {
            const results = await db.executeQuery<{ name: string }>(
                "SELECT name FROM category ORDER BY name"
            );
            return results.map((item) => item.name);
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    }

    public async getWallets(): Promise<{ name: string; currency: string }[]> {
        try {
            return await db.executeQuery<{ name: string; currency: string }>(
                "SELECT name, currency FROM wallet ORDER BY name"
            );
        } catch (error) {
            console.error("Error fetching wallets:", error);
            throw error;
        }
    }

    // Helper method to calculate next bill date from repeat pattern
    public calculateNextBillDate(date: string, repeat: string): string | null {
        if (repeat === "None") return null;

        const currentDate = new Date(date);
        const nextDate = new Date(currentDate);

        switch (repeat) {
            case "daily":
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case "weekly":
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case "monthly":
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case "yearly":
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
            default:
                // Check if it's a custom repeat pattern (e.g., "7" for every 7 days)
                const days = parseInt(repeat);
                if (!isNaN(days) && days > 0) {
                    nextDate.setDate(nextDate.getDate() + days);
                } else {
                    return null;
                }
        }

        return nextDate.toISOString();
    }
}

export const transactionService = TransactionService.getInstance();
export default transactionService;
