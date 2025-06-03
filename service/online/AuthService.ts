import api from "@/api";
import { UserWithToken, User } from "@/types";
import { createUser, getUser } from "./UserService";
import bcrypt from "bcryptjs";
import * as Sentry from "@sentry/react-native";

export const login = async (
    username: string,
    password: string
): Promise<UserWithToken> => {
    try {
        const response = await api.post("/auth/sign-in", {
            name: username,
            password,
        });

        const { user, token } = response.data;
        return { ...user, token };
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "AuthService",
                operation: "login",
            },
            extra: {
                username,
                // Don't log password for security
            },
        });
        throw error;
    }
};

export const register = async (
    username: string,
    password: string
): Promise<UserWithToken> => {
    try {
        const response = await api.post("/auth/sign-up", {
            name: username,
            password,
            avatar: "",
        });

        const { user, token } = response.data;
        return { ...user, token };
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                service: "AuthService",
                operation: "register",
            },
            extra: {
                username,
                // Don't log password for security
            },
        });
        throw error;
    }
};
