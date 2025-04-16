import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/Colors";
import { useUserStore } from "@/stores/userStore";
import Avatar from "@/components/ui/Avatar";
import TransactionItem from "@/components/cards/TransactionItem";
import { Search, X, ChevronDown } from "lucide-react-native";
import { db } from "@/service/database";
import { transactionService } from "@/service/TransactionService";

export default function HistoryScreen() {
    const user = useUserStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        initDatabaseAndLoadTransactions();
    }, []);

    const initDatabaseAndLoadTransactions = async () => {
        try {
            setLoading(true);
            // Initialize database
            await db.initDatabase();

            // Load transactions
            await loadTransactions();
        } catch (err) {
            console.error("Error initializing database:", err);
            setError("Failed to initialize database");
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const dbTransactions =
                await transactionService.getAllTransactions();

            // Transform database transactions to match the format expected by the UI
            const formattedTransactions = dbTransactions.map((transaction) => {
                let nextBillDate = undefined;
                if (transaction.repeat && transaction.repeat !== "None") {
                    const nextDateStr =
                        transactionService.calculateNextBillDate(
                            transaction.date,
                            transaction.repeat
                        );
                    if (nextDateStr) {
                        nextBillDate = new Date(nextDateStr);
                    }
                }

                return {
                    id: String(transaction.id),
                    amount: transaction.amount,
                    type: transaction.type,
                    category: transaction.category,
                    date: new Date(transaction.date),
                    wallet: transaction.wallet,
                    note: transaction.note || "",
                    isRecurring: transaction.repeat !== "None",
                    nextBillDate: nextBillDate,
                };
            });

            setTransactions(formattedTransactions);
            setError(null);
        } catch (err) {
            console.error("Error loading transactions:", err);
            setError("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleEditTransaction = (id: string) => {
        // Navigate to edit screen
        console.log(`Edit transaction ${id}`);
    };

    const handleDeleteTransaction = async (id: string) => {
        try {
            setLoading(true);
            await transactionService.deleteTransaction(Number(id));
            // Reload transactions after deletion
            await loadTransactions();
        } catch (err) {
            console.error(`Error deleting transaction ${id}:`, err);
            setError("Failed to delete transaction");
        } finally {
            setLoading(false);
        }
    };

    // Filter transactions based on search query
    const filteredTransactions = transactions.filter((transaction) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            transaction.category?.toLowerCase().includes(searchLower) ||
            transaction.wallet?.toLowerCase().includes(searchLower) ||
            transaction.note?.toLowerCase().includes(searchLower)
        );
    });

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

            <View style={styles.content}>
                <Text style={styles.title}>Transaction history</Text>

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

                <View style={styles.filtersRow}>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Date Range</Text>
                        <ChevronDown size={16} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Category</Text>
                        <ChevronDown size={16} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={loadTransactions}>
                        <Text style={styles.filterText}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            Loading transactions...
                        </Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadTransactions}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredTransactions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No transactions found
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.transactionList}
                        showsVerticalScrollIndicator={false}>
                        {filteredTransactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                onPress={() =>
                                    handleEditTransaction(transaction.id)
                                }
                                onEdit={() =>
                                    handleEditTransaction(transaction.id)
                                }
                                onDelete={() =>
                                    handleDeleteTransaction(transaction.id)
                                }
                                showActions
                            />
                        ))}
                    </ScrollView>
                )}
            </View>
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
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 16,
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
    filtersRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 12,
    },
    filterText: {
        color: colors.text,
        marginRight: 4,
    },
    refreshButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    transactionList: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
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
        paddingVertical: 40,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: {
        color: "white",
        fontWeight: "500",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
});
