import { db } from "./database";
import { Subscription } from "@/types";
import * as Sentry from "@sentry/react-native";

class SubscriptionService {
    private static instance: SubscriptionService;

    private constructor() {}

    public static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }

    public async createSubscription(
        subscription: Subscription
    ): Promise<string> {
        try {
            const id = Math.random().toString(36).substr(2, 9); // Tạo ID ngẫu nhiên
            await db.runAsync(
                `INSERT INTO subscription (name, amount, currency, billing_date, repeat, reminder_before, category) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    subscription.name,
                    subscription.amount,
                    subscription.currency,
                    subscription.billing_date instanceof Date
                        ? subscription.billing_date.toISOString()
                        : subscription.billing_date,
                    subscription.repeat,
                    subscription.reminder_before || 0, // Default to 0 if not provided
                    subscription.category || "General", // Default to 'General' if not provided
                ]
            );

            return id;
        } catch (error) {
            console.error("Error creating subscription:", error);
            Sentry.captureException(error, {
                tags: {
                    service: "SubscriptionService",
                    operation: "createSubscription",
                },
                extra: {
                    subscriptionName: subscription.name,
                    amount: subscription.amount,
                    currency: subscription.currency,
                    category: subscription.category,
                },
            });
            throw error;
        }
    }

    public async getAllSubscriptions(): Promise<Subscription[]> {
        try {
            const subscriptions =
                await db.executeParameterizedQuery<Subscription>(
                    "SELECT * FROM subscription ORDER BY billing_date ASC",
                    []
                );
            return subscriptions;
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
            Sentry.captureException(error, {
                tags: {
                    service: "SubscriptionService",
                    operation: "getAllSubscriptions",
                },
            });
            throw error;
        }
    }

    public async getSubscriptionByName(
        name: string
    ): Promise<Subscription | null> {
        try {
            const subscription = await db.getFirstAsync<Subscription>(
                "SELECT * FROM subscription WHERE name = ?",
                [name]
            );
            return subscription;
        } catch (error) {
            console.error(
                `Error fetching subscription with name ${name}:`,
                error
            );
            Sentry.captureException(error, {
                tags: {
                    service: "SubscriptionService",
                    operation: "getSubscriptionByName",
                },
                extra: {
                    subscriptionName: name,
                },
            });
            throw error;
        }
    }

    public async updateSubscription(
        name: string,
        subscription: Subscription
    ): Promise<boolean> {
        try {
            const existingSubscription = await this.getSubscriptionByName(name);
            if (!existingSubscription) {
                throw new Error(`Subscription with name ${name} not found`);
            }

            const updatedSubscription = {
                ...existingSubscription,
                ...subscription,
            };

            await db.runAsync(
                `UPDATE subscription SET 
                    name = ?, 
                    amount = ?, 
                    frequency = ?, 
                    billing_date = ?, 
                    reminder = ? 
                 WHERE id = ?`,
                [
                    updatedSubscription.name,
                    updatedSubscription.amount,
                    updatedSubscription.repeat,
                    updatedSubscription.billing_date instanceof Date
                        ? updatedSubscription.billing_date.toISOString()
                        : updatedSubscription.billing_date,
                    updatedSubscription.reminder_before || 0, // Default to 0 if not provided
                    updatedSubscription.category || "General", // Default to 'General' if not provided
                    updatedSubscription.currency,
                ]
            );

            return true;
        } catch (error) {
            console.error(
                `Error updating subscription with name ${name}:`,
                error
            );
            Sentry.captureException(error, {
                tags: {
                    service: "SubscriptionService",
                    operation: "updateSubscription",
                },
                extra: {
                    subscriptionName: name,
                    amount: subscription.amount,
                    currency: subscription.currency,
                    category: subscription.category,
                },
            });
            throw error;
        }
    }

    public async deleteSubscription(name: string): Promise<boolean> {
        try {
            await db.runAsync("DELETE FROM subscription WHERE name = ?", [
                name,
            ]);
            return true;
        } catch (error) {
            console.error(
                `Error deleting subscription with name ${name}:`,
                error
            );
            Sentry.captureException(error, {
                tags: {
                    service: "SubscriptionService",
                    operation: "deleteSubscription",
                },
                extra: {
                    subscriptionName: name,
                },
            });
            throw error;
        }
    }

    public async searchSubscriptionsByName(
        name: string
    ): Promise<Subscription[]> {
        try {
            const subscriptions =
                await db.executeParameterizedQuery<Subscription>(
                    "SELECT * FROM subscription WHERE name LIKE ? ORDER BY billing_date ASC",
                    [`%${name}%`]
                );
            return subscriptions;
        } catch (error) {
            console.error(
                `Error searching subscription for name ${name}:`,
                error
            );
            Sentry.captureException(error, {
                tags: {
                    service: "SubscriptionService",
                    operation: "searchSubscriptionsByName",
                },
                extra: {
                    searchName: name,
                },
            });
            throw error;
        }
    }

    public calculatebilling_date(
        date: string,
        frequency: string
    ): string | null {
        if (!frequency) return null;

        const currentDate = new Date(date);
        const nextDate = new Date(currentDate);

        switch (frequency.toLowerCase()) {
            case "day":
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case "week":
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case "month":
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case "year":
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
            default:
                return null;
        }

        return nextDate.toISOString();
    }
}

export const subscriptionService = SubscriptionService.getInstance();
export default subscriptionService;
