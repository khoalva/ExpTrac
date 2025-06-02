import api from "@/api";
import { useUserStore } from "@/stores/userStore";
import { Wallet } from "@/types";

export const getAllWallets = async (): Promise<Wallet[]> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/wallets`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getWallet = async (id: string): Promise<Wallet> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/wallets/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createWallet = async (
    wallet: Omit<Wallet, "id">
): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.post(`/wallets`, wallet, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};

export const updateWallet = async (
    id: string,
    wallet: Partial<Wallet>
): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.put(`/wallets/${id}`, wallet, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};

export const deleteWallet = async (id: string): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.delete(`/wallets/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};
