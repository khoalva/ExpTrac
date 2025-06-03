import api from "@/api";
import { useUserStore } from "@/stores/userStore";
import { Subscription } from "@/types";
import * as Sentry from "@sentry/react-native";

export const getAllSubscriptions = async (): Promise<Subscription[]> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/subscriptions`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "SubscriptionService",
                operation: "getAllSubscriptions",
            },
        });
        throw error;
    }
};

export const getSubscription = async (id: string): Promise<Subscription> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/subscriptions/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "SubscriptionService",
                operation: "getSubscription",
            },
            extra: {
                subscriptionId: id,
            },
        });
        throw error;
    }
};

export const createSubscription = async (
    subscription: Omit<Subscription, "id">
): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.post(`/subscriptions`, subscription, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "SubscriptionService",
                operation: "createSubscription",
            },
            extra: {
                subscriptionName: subscription.name,
                amount: subscription.amount,
                currency: subscription.currency,
            },
        });
        throw error;
    }
};

export const updateSubscription = async (
    id: string,
    subscription: Partial<Subscription>
): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.put(`/subscriptions/${id}`, subscription, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "SubscriptionService",
                operation: "updateSubscription",
            },
            extra: {
                subscriptionId: id,
                subscriptionName: subscription.name,
            },
        });
        throw error;
    }
};

export const deleteSubscription = async (id: string): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.delete(`/subscriptions/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "SubscriptionService",
                operation: "deleteSubscription",
            },
            extra: {
                subscriptionId: id,
            },
        });
        throw error;
    }
};
