import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import { useUserStore } from "@/stores/userStore";
import { useBudgetStore } from "@/stores/budgetStore";
import Avatar from "@/components/custom/Avatar";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/Input";
import SuccessModal from "@/components/modals/SuccessModal";
import { ChevronDown, ChevronRight } from "lucide-react-native";

export default function NewBudgetScreen() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const addBudget = useBudgetStore((state) => state.addBudget);

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [wallet, setWallet] = useState("");
    const [period, setPeriod] = useState("monthly");
    const [dateRange, setDateRange] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleAddBudget = () => {
        // Validate inputs
        if (!name || !amount || !category || !wallet) {
            // Show error
            return;
        }

        // Create budget object
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const budget = {
            name,
            amount: parseFloat(amount),
            categoryId: "1", // This would be selected from a list
            walletId: "1", // This would be selected from a list
            startDate: now,
            endDate,
            period: "monthly",
            currency: "VND",
        };

        // Add budget
        // @ts-ignore
        addBudget(budget);

        // Show success modal
        setShowSuccessModal(true);
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.userInfo}>
                    <Avatar source={user?.avatar} name={user?.name} size={40} />
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>New Budget</Text>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Budget Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Budget Name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.formRow}>
                    <View style={styles.formColumn}>
                        <Text style={styles.sectionLabel}>Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.formColumn}>
                        <Text style={styles.sectionLabel}>Curency</Text>
                        <TouchableOpacity style={styles.selectButton}>
                            <Text style={styles.selectButtonText}>VND</Text>
                            <ChevronDown size={16} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Wallet</Text>
                    <TouchableOpacity style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>
                            Choose Wallet
                        </Text>
                        <ChevronRight size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Category</Text>
                    <TouchableOpacity style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>Category</Text>
                        <ChevronRight size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Repeat</Text>
                    <TouchableOpacity style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>Repeat</Text>
                        <ChevronDown size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Date Range</Text>
                    <TouchableOpacity style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>Date Range</Text>
                        <ChevronDown size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <Button
                    title="Add Budget"
                    onPress={handleAddBudget}
                    style={styles.addButton}
                />
            </ScrollView>

            <SuccessModal
                visible={showSuccessModal}
                onClose={handleSuccessModalClose}
                message="You have added a new budget successfully."
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: colors.primary,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    userDetails: {
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.text,
    },
    userEmail: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 24,
    },
    formSection: {
        marginBottom: 16,
    },
    formRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    formColumn: {
        flex: 1,
        marginRight: 8,
    },
    sectionLabel: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    selectButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    selectButtonText: {
        fontSize: 16,
        color: colors.textTertiary,
    },
    addButton: {
        marginTop: 16,
        marginBottom: 32,
    },
});
