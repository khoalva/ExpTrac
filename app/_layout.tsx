import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/stores/userStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://7dc475752fa987f5a9d43af8ff9ca444@o4509435177140224.ingest.us.sentry.io/4509435179761664',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export const unstable_settings = {
    initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
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
});

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
        <GluestackUIProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="onboarding/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="auth/login"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="transaction/new"
                    options={{
                        presentation: "modal",
                        title: "New Transaction",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="budget/new"
                    options={{
                        presentation: "modal",
                        headerShown: false,
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
        </GluestackUIProvider>
    );
}