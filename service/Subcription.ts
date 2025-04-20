import { db } from './database';

interface Subscription {
    id?: string;
    name: string;
    amount: number;
    frequency: string;
    billing_date: string;
    reminder: string;
}

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
        subscription: Omit<Subscription, 'id'>
    ): Promise<string> {
        try {
            const id = Math.random().toString(36).substr(2, 9); // Tạo ID ngẫu nhiên
            await db.runAsync(
                `INSERT INTO subscription (id, name, amount, frequency, billing_date, reminder) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    subscription.name,
                    subscription.amount,
                    subscription.frequency,
                    subscription.billing_date,
                    subscription.reminder || 'No reminder',
                ]
            );

            return id;
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    public async getAllSubscriptions(): Promise<Subscription[]> {
        try {
            const subscriptions = await db.executeParameterizedQuery<Subscription>(
                'SELECT * FROM subscription ORDER BY billing_date ASC',
                []
            );
            return subscriptions;
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            throw error;
        }
    }

    public async getSubscriptionById(id: string): Promise<Subscription | null> {
        try {
            const subscription = await db.getFirstAsync<Subscription>(
                'SELECT * FROM subscription WHERE id = ?',
                [id]
            );
            return subscription;
        } catch (error) {
            console.error(`Error fetching subscription with id ${id}:`, error);
            throw error;
        }
    }

    public async updateSubscription(
        id: string,
        subscription: Partial<Omit<Subscription, 'id'>>
    ): Promise<boolean> {
        try {
            const existingSubscription = await this.getSubscriptionById(id);
            if (!existingSubscription) {
                throw new Error(`Subscription with id ${id} not found`);
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
                    updatedSubscription.frequency,
                    updatedSubscription.billing_date,
                    updatedSubscription.reminder || 'No reminder',
                    id,
                ]
            );

            return true;
        } catch (error) {
            console.error(`Error updating subscription with id ${id}:`, error);
            throw error;
        }
    }

    public async deleteSubscription(id: string): Promise<boolean> {
        try {
            await db.runAsync(
                'DELETE FROM subscription WHERE id = ?',
                [id]
            );
            return true;
        } catch (error) {
            console.error(`Error deleting subscription with id ${id}:`, error);
            throw error;
        }
    }

    public async searchSubscriptionsByName(name: string): Promise<Subscription[]> {
        try {
            const subscriptions = await db.executeParameterizedQuery<Subscription>(
                'SELECT * FROM subscription WHERE name LIKE ? ORDER BY billing_date ASC',
                [`%${name}%`]
            );
            return subscriptions;
        } catch (error) {
            console.error(`Error searching subscription for name ${name}:`, error);
            throw error;
        }
    }

    public calculatebilling_date(date: string, frequency: string): string | null {
        if (!frequency) return null;

        const currentDate = new Date(date);
        const nextDate = new Date(currentDate);

        switch (frequency.toLowerCase()) {
            case 'day':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'week':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'month':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'year':
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