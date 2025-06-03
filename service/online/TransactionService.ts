import api from "@/api";
import { useUserStore } from "@/stores/userStore";
import { Transaction } from "@/types";
import * as Sentry from "@sentry/react-native";

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
        Sentry.captureException(error, {
            tags: {
                service: "TransactionService",
                operation: "getAllTransactions",
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "TransactionService",
                operation: "getTransaction",
            },
            extra: {
                transactionId: id,
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "TransactionService",
                operation: "createTransaction",
            },
            extra: {
                transactionType: transaction.type,
                amount: transaction.amount,
                currency: transaction.currency,
                category: transaction.category,
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "TransactionService",
                operation: "updateTransaction",
            },
            extra: {
                transactionId: id,
                transactionType: transaction.type,
                amount: transaction.amount,
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "TransactionService",
                operation: "deleteTransaction",
            },
            extra: {
                transactionId: id,
            },
        });
        throw error;
    }
};
