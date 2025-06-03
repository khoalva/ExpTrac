import { db } from "./database";
import { Wallet } from "@/types";
import * as Sentry from "@sentry/react-native";

class WalletService {
    private static instance: WalletService;

    private constructor() {}

    public static getInstance(): WalletService {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }

    public async createWallet(wallet: Omit<Wallet, "id">): Promise<boolean> {
        try {
            await db.executeParameterizedQuery(
                `INSERT INTO wallet (
                    name, init_amount, currency, visible_category
                ) VALUES (?, ?, ?, ?)`,
                [
                    wallet.name,
                    wallet.init_amount,
                    wallet.currency,
                    wallet.visible_category || "",
                ]
            );
            return true;
        } catch (error) {
            console.error("Error creating wallet:", error);
            Sentry.captureException(error, {
                tags: {
                    service: "WalletService",
                    operation: "createWallet",
                },
                extra: {
                    walletName: wallet.name,
                    initAmount: wallet.init_amount,
                    currency: wallet.currency,
                },
            });
            throw error;
        }
    }

    public async getAllWallets(): Promise<Wallet[]> {
        try {
            const results = await db.executeQuery<Wallet>(
                "SELECT name, init_amount, currency, visible_category FROM wallet ORDER BY name"
            );
            return results;
        } catch (error) {
            console.error("Error fetching wallets:", error);
            Sentry.captureException(error, {
                tags: {
                    service: "WalletService",
                    operation: "getAllWallets",
                },
            });
            throw error;
        }
    }

    public async getWalletByName(name: string): Promise<Wallet | null> {
        try {
            const results = await db.executeParameterizedQuery<Wallet>(
                "SELECT name, init_amount, currency, visible_category FROM wallet WHERE name = ?",
                [name]
            );
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error(`Error fetching wallet ${name}:`, error);
            Sentry.captureException(error, {
                tags: {
                    service: "WalletService",
                    operation: "getWalletByName",
                },
                extra: {
                    walletName: name,
                },
            });
            throw error;
        }
    }

    public async updateWallet(
        oldName: string,
        wallet: Partial<Wallet>
    ): Promise<boolean> {
        try {
            // First, fetch the existing wallet
            const existingWallet = await this.getWalletByName(oldName);
            if (!existingWallet) {
                throw new Error(`Wallet with name ${oldName} not found`);
            }

            // Build updated wallet
            const updatedWallet = {
                ...existingWallet,
                ...wallet,
            };

            // If name is changing, we need to update transactions too
            if (wallet.name && wallet.name !== oldName) {
                // Update transactions to use new wallet name
                await db.executeParameterizedQuery(
                    "UPDATE transaction_log SET wallet = ? WHERE wallet = ?",
                    [wallet.name, oldName]
                );

                // Update the wallet record
                await db.executeParameterizedQuery(
                    `UPDATE wallet SET 
                        name = ?, 
                        init_amount = ?, 
                        currency = ?, 
                        visible_category = ?
                    WHERE name = ?`,
                    [
                        updatedWallet.name,
                        updatedWallet.init_amount,
                        updatedWallet.currency,
                        updatedWallet.visible_category || "",
                        oldName,
                    ]
                );
            } else {
                // Just update wallet without changing name
                await db.executeParameterizedQuery(
                    `UPDATE wallet SET 
                        init_amount = ?, 
                        currency = ?, 
                        visible_category = ?
                    WHERE name = ?`,
                    [
                        updatedWallet.init_amount,
                        updatedWallet.currency,
                        updatedWallet.visible_category || "",
                        oldName,
                    ]
                );
            }

            return true;
        } catch (error) {
            console.error(`Error updating wallet ${oldName}:`, error);
            Sentry.captureException(error, {
                tags: {
                    service: "WalletService",
                    operation: "updateWallet",
                },
                extra: {
                    oldWalletName: oldName,
                    newWalletName: wallet.name,
                    initAmount: wallet.init_amount,
                    currency: wallet.currency,
                },
            });
            throw error;
        }
    }

    public async deleteWallet(name: string): Promise<boolean> {
        try {
            // Check if wallet is used in transactions
            const transactionsWithWallet = await db.executeParameterizedQuery<{
                count: number;
            }>(
                "SELECT COUNT(*) as count FROM transaction_log WHERE wallet = ?",
                [name]
            );

            if (transactionsWithWallet[0]?.count > 0) {
                throw new Error(
                    "Cannot delete wallet that is used in transactions. Delete the transactions first or update them to use a different wallet."
                );
            }

            await db.executeParameterizedQuery(
                "DELETE FROM wallet WHERE name = ?",
                [name]
            );
            return true;
        } catch (error) {
            console.error(`Error deleting wallet ${name}:`, error);
            Sentry.captureException(error, {
                tags: {
                    service: "WalletService",
                    operation: "deleteWallet",
                },
                extra: {
                    walletName: name,
                },
            });
            throw error;
        }
    }

    public async getWalletBalance(name: string): Promise<number> {
        try {
            // Get initial amount from wallet
            const wallet = await this.getWalletByName(name);
            if (!wallet) {
                throw new Error(`Wallet with name ${name} not found`);
            }

            let balance = wallet.init_amount;

            // Get sum of all income transactions
            const incomeResult = await db.executeParameterizedQuery<{
                total: number;
            }>(
                "SELECT COALESCE(SUM(amount), 0) as total FROM transaction_log WHERE wallet = ? AND type = 'income'",
                [name]
            );

            const income = incomeResult[0]?.total || 0;

            // Get sum of all expense transactions
            const expenseResult = await db.executeParameterizedQuery<{
                total: number;
            }>(
                "SELECT COALESCE(SUM(amount), 0) as total FROM transaction_log WHERE wallet = ? AND type = 'expense'",
                [name]
            );

            const expense = expenseResult[0]?.total || 0;

            // Calculate current balance
            balance = balance + income - expense;

            return balance;
        } catch (error) {
            console.error(
                `Error calculating balance for wallet ${name}:`,
                error
            );
            Sentry.captureException(error, {
                tags: {
                    service: "WalletService",
                    operation: "getWalletBalance",
                },
                extra: {
                    walletName: name,
                },
            });
            throw error;
        }
    }

    public async getTotalBalance(): Promise<number> {
        try {
            // Get all wallets
            const wallets = await this.getAllWallets();

            // Calculate total balance across all wallets
            let totalBalance = 0;

            for (const wallet of wallets) {
                const balance = await this.getWalletBalance(wallet.name);
                totalBalance += balance;
            }

            return totalBalance;
        } catch (error) {
            console.error("Error calculating total balance:", error);
            Sentry.captureException(error, {
                tags: {
                    service: "WalletService",
                    operation: "getTotalBalance",
                },
            });
            throw error;
        }
    }
}

export const walletService = WalletService.getInstance();
export default walletService;
