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

export const getWallet = async (name: string): Promise<Wallet> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/wallets/${name}`, {
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
        const { name, init_amount, currency, visible_category } = wallet;

        const response = await api.post(
            `/wallets`,
            {
                name,
                initAmount: init_amount,
                currency,
                visibleCategory: visible_category,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error) {
        throw error;
    }
};

export const updateWallet = async (
    name: string,
    wallet: Partial<Wallet>
): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const { init_amount, currency, visible_category } = wallet;
        const response = await api.put(
            `/wallets/${name}`,
            {
                initAmount: init_amount,
                currency,
                visibleCategory: visible_category,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error) {
        throw error;
    }
};

export const deleteWallet = async (name: string): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.delete(`/wallets/${name}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};
