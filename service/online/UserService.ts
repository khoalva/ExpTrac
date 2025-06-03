import api from "@/api";
import { User, UserWithPassword } from "@/types";
import * as Sentry from "@sentry/react-native";

export const getUser = async (userId: string): Promise<User> => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "UserService",
                operation: "getUser",
            },
            extra: {
                userId,
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "UserService",
                operation: "createUser",
            },
            extra: {
                userName: user.name,
                userEmail: user.email,
                // Don't log password for security
            },
        });
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
        Sentry.captureException(error, {
            tags: {
                service: "UserService",
                operation: "updateUser",
            },
            extra: {
                userId,
                userName: user.name,
                userEmail: user.email,
                // Don't log password for security
            },
        });
        throw error;
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    try {
        await api.delete(`/users/${userId}`);
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "UserService",
                operation: "deleteUser",
            },
            extra: {
                userId,
            },
        });
        throw error;
    }
};
