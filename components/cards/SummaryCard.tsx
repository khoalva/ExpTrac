import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/constants/Colors";
import { Card } from "@/components/custom/Card";
import { LinearGradient } from "expo-linear-gradient";

interface SummaryCardProps {
    title: string;
    amount: string;
    icon?: React.ReactNode;
    style?: ViewStyle;
    variant?: "primary" | "secondary" | "success" | "error";
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    amount,
    icon,
    style,
    variant = "primary",
}) => {
    const gradientColors: Record<string, readonly [string, string]> = {
        primary: [colors.gradientStart, colors.gradientEnd],
        secondary: ["#2D3748", "#1A202C"],
        success: ["#2F855A", "#276749"],
        error: ["#E53E3E", "#C53030"],
    };

    return (
        <Card style={StyleSheet.flatten([styles.card, style])}>
            <LinearGradient
                colors={gradientColors[variant]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.amountRow}>
                        <Text style={styles.amount}>{amount}</Text>
                        {icon && <View style={styles.icon}>{icon}</View>}
                    </View>
                </View>
            </LinearGradient>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 0,
        overflow: "hidden",
        borderRadius: 16,
    },
    gradient: {
        borderRadius: 16,
        overflow: "hidden",
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        color: "white",
        opacity: 0.9,
        marginBottom: 8,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    amount: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    icon: {
        marginLeft: 8,
    },
});

export default SummaryCard;
