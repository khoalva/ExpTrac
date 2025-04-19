import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { colors } from "@/constants/Colors";
import { Transaction } from "@/types";
import { formatShortDate, formatTransactionAmount } from "@/utils/formatters";
import { ArrowDown, ArrowUp, FileEdit, Trash2 } from "lucide-react-native";

interface TransactionItemProps {
    transaction: Transaction;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
    transaction,
    onPress,
    onEdit,
    onDelete,
    showActions = false,
}) => {
    const { type, amount, category, date, nextBillDate, currency, wallet } =
        transaction;
    const isIncome = type === "income";
    const formattedAmount = formatTransactionAmount(amount, type, currency);

    const formattedDate = formatShortDate(new Date(date));
    const formattedNextBillDate = nextBillDate
        ? formatShortDate(new Date(nextBillDate))
        : null;

    const handleEdit = () => {
        if (onEdit) onEdit();
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
                    onPress: () => {
                        if (onDelete) onDelete();
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                {isIncome ? (
                    <ArrowUp size={20} color={colors.success} />
                ) : (
                    <ArrowDown size={20} color={colors.error} />
                )}
            </View>

            <View className="flex-1 flex flex-row justify-between items-start">
                <View style={styles.content}>
                    <View style={styles.mainRow}>
                        <Text style={styles.amount}>{formattedAmount}</Text>
                    </View>

                    <View style={styles.detailsRow}>
                        <Text style={styles.dateText}>
                            {nextBillDate
                                ? `Next bill: ${formattedNextBillDate}`
                                : `Date: ${formattedDate}`}
                        </Text>
                        <Text style={styles.categoryText}>
                            Category: {category}
                        </Text>
                        <Text style={styles.categoryText}>
                            Wallet: {wallet}
                        </Text>
                    </View>
                </View>
                {showActions && (
                    <View style={styles.actions} className="flex flex-col">
                        <TouchableOpacity
                            onPress={onPress}
                            style={styles.actionButton}>
                            <Text style={styles.actionText}>Detail</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleEdit}
                            style={styles.actionButton}>
                            <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDelete}
                            style={styles.actionButton}>
                            <Text
                                style={[styles.actionText, styles.deleteText]}>
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: colors.primary,
        borderRadius: 12,
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    mainRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    amount: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    detailsRow: {
        flexDirection: "column",
    },
    dateText: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
    },
    categoryText: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        fontWeight: "500",
    },
    actions: {
        flexDirection: "column",
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 4,
    },
    actionText: {
        color: "white",
        fontSize: 12,
    },
    deleteText: {
        color: "#FF8A8A",
    },
});

export default TransactionItem;
