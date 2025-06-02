import api from "@/api";
import { useUserStore } from "@/stores/userStore";
import { Transaction } from "@/types";

export const getAllTransactions = async (): Promise<Transaction[]> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/transactions`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTransaction = async (id: string): Promise<Transaction> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/transactions/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTransaction = async (
    transaction: Omit<Transaction, "id">
): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.post(`/transactions`, transaction, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};

export const updateTransaction = async (
    id: string,
    transaction: Partial<Transaction>
): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.put(`/transactions/${id}`, transaction, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.delete(`/transactions/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};
