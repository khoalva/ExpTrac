import api from "@/api";
import { useUserStore } from "@/stores/userStore";
import { Subscription } from "@/types";

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
        throw error;
    }
};
