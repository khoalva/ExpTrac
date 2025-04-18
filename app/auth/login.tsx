import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useUserStore } from "@/stores/userStore";
import { useWalletStore } from "@/stores/walletStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Eye, EyeOff, User, Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
    const [activeTab, setActiveTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const login = useUserStore((state) => state.login);
    const initializeDefaultWallet = useWalletStore(
        (state) => state.initializeDefaultWallet
    );
    const initializeDefaultCategory = useCategoryStore(
        (state) => state.initializeDefaultCategory
    );
    const resetCategory = useCategoryStore((state) => state.resetCategories);
    const initializeSampleNotifications = useNotificationStore(
        (state) => state.initializeSampleNotifications
    );

    const handleAuth = async () => {
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Simulate API call
            const success = await login(email, password);

            if (success) {
                // Initialize app data
                initializeDefaultWallet();
                initializeSampleNotifications();
                initializeDefaultCategory();
                // resetCategory();

                // Navigate to home
                router.replace("/(tabs)");
            } else {
                setError("Invalid credentials");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>ExpTrac</Text>
                </View>

                <Text style={styles.headerTitle}>
                    {activeTab === "login"
                        ? "Get Started now"
                        : "Create an account"}
                </Text>
                <Text style={styles.headerSubtitle}>
                    {activeTab === "login"
                        ? "Create an account or log in to explore about our app"
                        : "Sign up to start tracking your finances"}
                </Text>
            </LinearGradient>

            <View style={styles.formContainer}>
                <SegmentedControl
                    options={[
                        { label: "Log In", value: "login" },
                        { label: "Sign Up", value: "signup" },
                    ]}
                    selectedValue={activeTab}
                    onChange={setActiveTab}
                    style={styles.segmentedControl}
                />

                {activeTab === "signup" && (
                    <Input
                        label="Name"
                        placeholder="Your name"
                        value={name}
                        onChangeText={setName}
                        leftIcon={
                            <User size={20} color={colors.textSecondary} />
                        }
                        autoCapitalize="words"
                    />
                )}

                <Input
                    label="Email or Username"
                    placeholder="Your email or username"
                    value={email}
                    onChangeText={setEmail}
                    leftIcon={<User size={20} color={colors.textSecondary} />}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Input
                    label="Password"
                    placeholder="Your password"
                    value={password}
                    onChangeText={setPassword}
                    leftIcon={<Lock size={20} color={colors.textSecondary} />}
                    isPassword
                />

                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setRememberMe(!rememberMe)}>
                        <View
                            style={[
                                styles.checkbox,
                                rememberMe && styles.checkboxChecked,
                            ]}>
                            {rememberMe && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                        <Text style={styles.rememberText}>Remember me</Text>
                    </TouchableOpacity>

                    {activeTab === "login" && (
                        <TouchableOpacity>
                            <Text style={styles.forgotText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button
                    title={activeTab === "login" ? "Log In" : "Sign Up"}
                    onPress={handleAuth}
                    loading={isLoading}
                    style={styles.authButton}
                />

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or</Text>
                    <View style={styles.dividerLine} />
                </View>

                <Button
                    title="Continue with Google"
                    variant="outline"
                    style={styles.socialButton}
                    leftIcon={
                        <Image
                            source={{
                                uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
                            }}
                            style={styles.socialIcon}
                        />
                    }
                />

                <Button
                    title="Continue with Facebook"
                    variant="outline"
                    style={styles.socialButton}
                    leftIcon={
                        <Image
                            source={{
                                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png",
                            }}
                            style={styles.socialIcon}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    logoContainer: {
        alignItems: "flex-start",
        marginBottom: 20,
    },
    logoText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
    },
    formContainer: {
        flex: 1,
        padding: 24,
        marginTop: -20,
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    segmentedControl: {
        marginBottom: 24,
    },
    optionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkmark: {
        color: "white",
        fontSize: 12,
    },
    rememberText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    forgotText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: "500",
    },
    errorText: {
        color: colors.error,
        marginBottom: 16,
        textAlign: "center",
    },
    authButton: {
        marginBottom: 24,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: colors.textSecondary,
    },
    socialButton: {
        marginBottom: 16,
    },
    socialIcon: {
        width: 24,
        height: 24,
    },
});
