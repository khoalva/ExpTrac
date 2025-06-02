import api from "@/api";
import { User, UserWithPassword } from "@/types";

export const getUser = async (userId: string): Promise<User> => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createUser = async (
    user: Partial<UserWithPassword>
): Promise<string> => {
    try {
        const response = await api.post("/users", user);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (
    userId: string,
    user: UserWithPassword
): Promise<string> => {
    try {
        const response = await api.put(`/users/${userId}`, user);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    try {
        await api.delete(`/users/${userId}`);
    } catch (error) {
        throw error;
    }
};
