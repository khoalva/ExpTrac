import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import { useTransactionStore } from "@/stores/transactionStore";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
    ArrowDown,
    ArrowUp,
    Calendar,
    CreditCard,
    FileEdit,
    Tag,
    Trash2,
    Wallet2,
} from "lucide-react-native";
import Button from "@/components/custom/Button";
import { Transaction } from "@/types";

export default function TransactionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const transactions = useTransactionStore((state) => state.transactions);
    const getTransaction = useTransactionStore(
        (state) => state.loadTransactions
    );
    const deleteTransaction = useTransactionStore(
        (state) => state.deleteTransaction
    );
    const isLoading = useTransactionStore((state) => state.isLoading);
    const error = useTransactionStore((state) => state.error);

    const [transaction, setTransaction] = useState<Transaction>();

    useEffect(() => {
        const loadTransaction = async () => {
            if (id) {
                try {
                    // First try to find transaction in store
                    let foundTransaction = transactions.find(
                        (t) => t.id === id
                    );

                    // @ts-ignore
                    setTransaction(foundTransaction);
                } catch (err) {
                    console.error("Error loading transaction:", err);
                }
            }
        };

        loadTransaction();
    }, [id, transactions, getTransaction]);

    const handleEdit = () => {
        router.push(`/transaction/edit?id=${id}`);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (id) {
                            try {
                                await deleteTransaction(id);
                                // Go back to history page after deletion
                                router.replace("/(tabs)/history");
                            } catch (err) {
                                console.error(
                                    `Error deleting transaction ${id}:`,
                                    err
                                );
                                Alert.alert(
                                    "Error",
                                    "Failed to delete transaction"
                                );
                            }
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        Loading transaction details...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button
                        title="Go Back"
                        onPress={() => router.back()}
                        style={styles.goBackButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    if (!transaction) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Transaction not found</Text>
                    <Button
                        title="Go Back"
                        onPress={() => router.back()}
                        style={styles.goBackButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const isIncome = transaction.type === "income";

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction Details</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}>
                <View style={styles.amountCard}>
                    <View style={styles.typeIcon}>
                        {isIncome ? (
                            <ArrowUp size={24} color="white" />
                        ) : (
                            <ArrowDown size={24} color="white" />
                        )}
                    </View>
                    <Text style={styles.typeLabel}>
                        {isIncome ? "Income" : "Expense"}
                    </Text>
                    <Text style={styles.amountText}>
                        {formatCurrency(
                            transaction.amount,
                            transaction.currency
                        )}
                    </Text>
                </View>

                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Calendar size={20} color={colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>
                                {formatDate(new Date(transaction.date))}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Wallet2 size={20} color={colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Wallet</Text>
                            <Text style={styles.detailValue}>
                                {transaction.wallet}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Tag size={20} color={colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Category</Text>
                            <Text style={styles.detailValue}>
                                {transaction.category}
                            </Text>
                        </View>
                    </View>

                    {transaction.isRecurring && transaction.nextBillDate && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                    <CreditCard
                                        size={20}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>
                                        Next Bill Date
                                    </Text>
                                    <Text style={styles.detailValue}>
                                        {formatDate(
                                            new Date(transaction.nextBillDate)
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </>
                    )}

                    {transaction.note && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.noteContainer}>
                                <Text style={styles.detailLabel}>Note</Text>
                                <Text style={styles.noteText}>
                                    {transaction.note}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.buttonGroup}>
                    <Button
                        title="Edit Transaction"
                        onPress={handleEdit}
                        style={styles.editButton}
                    />
                    <Button
                        title="Delete Transaction"
                        onPress={handleDelete}
                        style={styles.deleteButton}
                    />
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 50,
    },
    backButtonText: {
        fontSize: 16,
        color: colors.primary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.textSecondary,
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        marginBottom: 20,
        textAlign: "center",
    },
    goBackButton: {
        width: 200,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    amountCard: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 24,
    },
    typeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    typeLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "rgba(255,255,255,0.8)",
        marginBottom: 8,
    },
    amountText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "white",
    },
    detailsSection: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(93, 66, 117, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 4,
    },
    noteContainer: {
        paddingVertical: 12,
    },
    noteText: {
        fontSize: 16,
        color: colors.text,
        marginTop: 8,
        backgroundColor: "rgba(93, 66, 117, 0.05)",
        padding: 12,
        borderRadius: 8,
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    editButton: {
        flex: 1,
        marginRight: 8,
        backgroundColor: colors.primary,
    },
    deleteButton: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: colors.error,
    },
});
