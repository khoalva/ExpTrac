import api from "@/api";
import { useUserStore } from "@/stores/userStore";
import { Category } from "@/types";

export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/categories`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCategory = async (name: string): Promise<Category> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.get(`/categories/${name}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createCategory = async (name: string): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.post(
            `/categories`,
            { name },
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

export const updateCategory = async (
    oldName: string,
    newName: string
): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.put(
            `/categories/${oldName}`,
            { name: newName },
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

export const deleteCategory = async (name: string): Promise<void> => {
    try {
        const token = useUserStore.getState().token;
        const response = await api.delete(`/categories/${name}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};
