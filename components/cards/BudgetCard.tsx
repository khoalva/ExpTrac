import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/constants/Colors";
import { Budget } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import ProgressBar from "@/components/custom/ProgressBar";
import { FileText, Edit, Trash2 } from "lucide-react-native";

interface BudgetCardProps {
    budget: Budget;
    onPress?: () => void;
    onDetail?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
    budget,
    onPress,
    onDetail,
    onEdit,
    onDelete,
}) => {
    const { name, amount, spent, remaining, currency, period } = budget;
    const progress = amount > 0 ? (spent / amount) * 100 : 0;

    // Determine color based on progress
    const getProgressColor = () => {
        if (progress < 50) return "#4CAF50"; // Green
        if (progress < 75) return "#FFC107"; // Yellow
        return "#F44336"; // Red
    };

    const daysLeft = 10; // This would be calculated based on period and dates

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={styles.header}>
                <Text style={styles.title}>{name}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={onDetail}
                        style={styles.actionButton}>
                        <FileText size={16} color="white" />
                        <Text style={styles.actionText}>Detail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onEdit}
                        style={styles.actionButton}>
                        <Edit size={16} color="white" />
                        <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onDelete}
                        style={styles.actionButton}>
                        <Trash2 size={16} color="#FF8A8A" />
                        <Text style={[styles.actionText, styles.deleteText]}>
                            Delete
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.details}>
                <Text style={styles.detailText}>
                    Budget: {formatCurrency(amount, currency)}
                </Text>
                <Text style={styles.detailText}>
                    Spent: {formatCurrency(spent, currency)}
                </Text>
                <Text style={styles.detailText}>
                    Remaining: {formatCurrency(remaining, currency)}
                </Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>0</Text>
                    <Text style={styles.progressLabel}>
                        {Math.round(amount / 2)}
                    </Text>
                    <Text style={styles.progressLabel}>{amount}</Text>
                </View>
                <ProgressBar
                    progress={progress}
                    height={8}
                    progressColor={getProgressColor()}
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                />
                <Text style={styles.daysLeft}>{daysLeft} days</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: colors.primary,
        borderRadius: 12,
        marginBottom: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        flex: 1,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actionText: {
        color: "white",
        fontSize: 12,
    },
    deleteText: {
        color: "#FF8A8A",
    },
    details: {
        marginBottom: 12,
    },
    detailText: {
        fontSize: 14,
        color: "white",
        marginBottom: 4,
    },
    progressContainer: {
        marginTop: 8,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
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
});

export default BudgetCard;
