import api from "@/api";
import { useUserStore } from "@/stores/userStore";
import { Category } from "@/types";
import * as Sentry from "@sentry/react-native";

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
        Sentry.captureException(error, {
            tags: {
                service: "CategoryService",
                operation: "getAllCategories",
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "CategoryService",
                operation: "getCategory",
            },
            extra: {
                categoryName: name,
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "CategoryService",
                operation: "createCategory",
            },
            extra: {
                categoryName: name,
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "CategoryService",
                operation: "updateCategory",
            },
            extra: {
                oldName,
                newName,
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "CategoryService",
                operation: "deleteCategory",
            },
            extra: {
                categoryName: name,
            },
        });
        throw error;
    }
};
