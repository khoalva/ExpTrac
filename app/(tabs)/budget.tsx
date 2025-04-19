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
import { formatCurrency } from "@/utils/formatters";
import BudgetCard from "@/components/cards/BudgetCard";
import ProgressBar from "@/components/custom/ProgressBar";
import { Plus, Search, X } from "lucide-react-native";

export default function BudgetScreen() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState("");

    // Mock budget data
    const budgets: Array<{
        id: string;
        name: string;
        amount: number;
        spent: number;
        remaining: number;
        startDate: Date;
        endDate: Date;
        period: "monthly" | "daily" | "weekly" | "yearly";
        currency: string;
    }> = [
        {
            id: "1",
            name: "Food",
            amount: 1000000,
            spent: 500000,
            remaining: 500000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            period: "monthly" as "monthly",
            currency: "VND",
        },
        {
            id: "2",
            name: "Fee",
            amount: 1000000,
            spent: 500000,
            remaining: 500000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            period: "monthly",
            currency: "VND",
        },
        {
            id: "3",
            name: "Transport",
            amount: 1000000,
            spent: 500000,
            remaining: 500000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            period: "monthly",
            currency: "VND",
        },
        {
            id: "4",
            name: "Investment",
            amount: 1000000,
            spent: 500000,
            remaining: 500000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            period: "monthly",
            currency: "VND",
        },
    ];

    const totalBudget = 100000;
    const totalSpent = 75000;
    const remainingBudget = totalBudget - totalSpent;
    const budgetProgress = (totalSpent / totalBudget) * 100;

    const handleAddBudget = () => {
        router.push("/budget/new");
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
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
                showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Budget Remaining</Text>
                    <Text style={styles.summaryAmount}>
                        {formatCurrency(1500000)}
                    </Text>

                    <View style={styles.progressSection}>
                        <Text style={styles.progressText}>
                            Total Budget: {formatCurrency(75000)} spent over{" "}
                            {formatCurrency(100000)}
                        </Text>
                        <ProgressBar
                            progress={75}
                            height={8}
                            progressColor={colors.primary}
                            backgroundColor="#E0E0E0"
                        />
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>0</Text>
                            <Text style={styles.progressLabel}>50K</Text>
                            <Text style={styles.progressLabel}>1L</Text>
                        </View>
                        <Text style={styles.daysLeft}>10 days</Text>
                    </View>
                </View>

                <View style={styles.budgetListHeader}>
                    <Text style={styles.sectionTitle}>Budget by Category</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddBudget}>
                        <Text style={styles.addButtonText}>Add budget</Text>
                        <Plus size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search
                        size={20}
                        color={colors.textSecondary}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <X size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <View style={styles.budgetList}>
                    {budgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            onPress={() => {}}
                            onDetail={() => {}}
                            onEdit={() => {}}
                            onDelete={() => {}}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        padding: 20,
    },
    summaryCard: {
        backgroundColor: colors.primaryDark,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    summaryAmount: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 16,
    },
    progressSection: {
        marginTop: 8,
    },
    progressText: {
        fontSize: 14,
        color: "white",
        marginBottom: 8,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    progressLabel: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.7)",
    },
    daysLeft: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.7)",
        textAlign: "right",
        marginTop: 4,
    },
    budgetListHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(93, 66, 117, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addButtonText: {
        color: colors.text,
        marginRight: 4,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    budgetList: {
        marginBottom: 20,
    },
});
