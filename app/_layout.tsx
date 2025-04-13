import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/stores/userStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";

export const unstable_settings = {
    initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        ...FontAwesome.font,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            throw error;
        }
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ErrorBoundary>
                <RootLayoutNav />
            </ErrorBoundary>
        </GestureHandlerRootView>
    );
}

function RootLayoutNav() {
    const router = useRouter();
    const segments = useSegments();
    const { isAuthenticated, isOnboardingCompleted } = useUserStore();

    useEffect(() => {
        const inAuthGroup = (segments[0] as string) === "auth";
        const inOnboardingGroup = (segments[0] as string) === "onboarding";

        if (!isOnboardingCompleted && !inOnboardingGroup) {
            // Redirect to onboarding
            router.replace("/onboarding");
        } else if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
            // Redirect to login
            router.replace("./auth/login");
        } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
            // Redirect to home
            router.replace("/(tabs)");
        }
    }, [isAuthenticated, isOnboardingCompleted, segments]);

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="onboarding/index"
                options={{ headerShown: false }}
            />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen
                name="transaction/new"
                options={{
                    presentation: "modal",
                    title: "New Transaction",
                    headerStyle: {
                        backgroundColor: "#F8F6FB",
                    },
                }}
            />
            <Stack.Screen
                name="budget/new"
                options={{
                    presentation: "modal",
                    title: "New Budget",
                    headerStyle: {
                        backgroundColor: "#F8F6FB",
                    },
                }}
            />
            <Stack.Screen
                name="notifications/index"
                options={{
                    title: "Notifications",
                    headerStyle: {
                        backgroundColor: "#F8F6FB",
                    },
                }}
            />
            <Stack.Screen
                name="profile/index"
                options={{
                    title: "Profile",
                    headerStyle: {
                        backgroundColor: "#F8F6FB",
                    },
                }}
            />
        </Stack>
    );
}
