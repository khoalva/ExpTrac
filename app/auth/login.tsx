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
import Input from "@/components/custom/Input";
import Button from "@/components/custom/Button";
import SegmentedControl from "@/components/custom/SegmentedControl";
import { useUserStore } from "@/stores/userStore";
import { useWalletStore } from "@/stores/walletStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { Eye, EyeOff, User, Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "@/service/database";
import { login } from "@/service/online/AuthService";

const testDatabaseSetup = async () => {
    try {
        console.log("=== TESTING DATABASE SETUP ===");

        // Initialize database
        await db.initDatabase();
        console.log("Database initialized in login screen");

        // Create a test table
        try {
            await db.executeQuery(
                "CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)"
            );
            console.log("Test table created successfully");

            // Insert a test record
            await db.executeParameterizedQuery(
                "INSERT INTO test_table (name) VALUES (?)",
                ["Test Record"]
            );
            console.log("Test record inserted");

            // Query the test record
            const results = await db.executeQuery("SELECT * FROM test_table");
            console.log("Test query results:", results);

            // Clean up
            await db.executeQuery("DROP TABLE test_table");
            console.log("Test table dropped");
        } catch (e) {
            console.error("Error in test operations:", e);
        }

        console.log("=== DATABASE SETUP TEST COMPLETED ===");
    } catch (e) {
        console.error("Database setup test failed:", e);
    }
};

export default function LoginScreen() {
    const [activeTab, setActiveTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const login = useUserStore((state) => state.login);
    const register = useUserStore((state) => state.register);

    // Store initialization methods
    const loadWallets = useWalletStore((state) => state.loadWallets);
    const loadCategories = useCategoryStore((state) => state.loadCategories);
    const loadTransactions = useTransactionStore(
        (state) => state.loadTransactions
    );
    const initializeSampleNotifications = useNotificationStore(
        (state) => state.initializeSampleNotifications
    );

    const validateLoginForm = () => {
        if (!email || !password) {
            setError("Please fill in all fields");
            return false;
        }
        return true;
    };

    const validateSignupForm = () => {
        if (!email.trim()) {
            setError("Please enter a username");
            return false;
        }

        if (!password) {
            setError("Please enter a password");
            return false;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleAuth = async () => {
        setIsLoading(true);
        setError("");

        try {
            let success = false;

            if (activeTab === "login") {
                if (!validateLoginForm()) {
                    setIsLoading(false);
                    return;
                }
                success = await login(email, password);
                if (!success) {
                    setError("Invalid credentials");
                }
            } else {
                if (!validateSignupForm()) {
                    setIsLoading(false);
                    return;
                }
                success = await register(email, password);
                if (!success) {
                    setError("Registration failed. Please try again.");
                }
            }

            if (success) {
                // Initialize database
                await db.initDatabase();

                // Load data from database into stores
                try {
                    console.log("Loading categories...");
                    await loadCategories();

                    console.log("Loading wallets...");
                    await loadWallets();

                    // Then load transactions (most recent 50)
                    console.log("Loading transactions...");
                    await loadTransactions(50);

                    // Load sample notifications (temporary)
                    await initializeSampleNotifications();
                } catch (err) {
                    console.error("Error loading data:", err);
                    // Continue to home screen even if there's an error loading data
                }

                // Navigate to home
                router.replace("/(tabs)");
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
                        : "Sign up to start tracking your finances and take control of your money"}
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

                <Input
                    label={
                        activeTab === "login" ? "Email or Username" : "Username"
                    }
                    placeholder={
                        activeTab === "login"
                            ? "Your email or username"
                            : "Choose a username"
                    }
                    value={email}
                    onChangeText={setEmail}
                    leftIcon={<User size={20} color={colors.textSecondary} />}
                    autoCapitalize="none"
                    keyboardType={
                        activeTab === "login" ? "email-address" : "default"
                    }
                />

                <Input
                    label="Password"
                    placeholder={
                        activeTab === "login"
                            ? "Your password"
                            : "Create a password"
                    }
                    value={password}
                    onChangeText={setPassword}
                    leftIcon={<Lock size={20} color={colors.textSecondary} />}
                    isPassword
                />

                {activeTab === "signup" && (
                    <Input
                        label="Confirm Password"
                        placeholder="Retype your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        leftIcon={
                            <Lock size={20} color={colors.textSecondary} />
                        }
                        isPassword
                    />
                )}

                {activeTab === "login" && (
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

                        <TouchableOpacity>
                            <Text style={styles.forgotText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button
                    title={activeTab === "login" ? "Log In" : "Create Account"}
                    onPress={handleAuth}
                    loading={isLoading}
                    style={styles.authButton}
                />

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.registerPrompt}>
                    <Text style={styles.registerPromptText}>
                        {activeTab === "login"
                            ? "Don't have an account? "
                            : "Already have an account? "}
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            setActiveTab(
                                activeTab === "login" ? "signup" : "login"
                            )
                        }>
                        <Text style={styles.registerLink}>
                            {activeTab === "login" ? "Sign Up" : "Sign In"}
                        </Text>
                    </TouchableOpacity>
                </View>
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
    registerPrompt: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    registerPromptText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    registerLink: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: "600",
    },
});
