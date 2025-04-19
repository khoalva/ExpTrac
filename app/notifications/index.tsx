import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import { useUserStore } from "@/stores/userStore";
import { useNotificationStore } from "@/stores/notificationStore";
import Avatar from "@/components/custom/Avatar";
import NotificationItem from "@/components/cards/NotificationItem";
import { ChevronLeft } from "lucide-react-native";

export default function NotificationsScreen() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const notifications = useNotificationStore((state) => state.notifications);
    const markAsRead = useNotificationStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
    const deleteNotification = useNotificationStore(
        (state) => state.deleteNotification
    );

    const handleNotificationPress = (id: string) => {
        markAsRead(id);
    };

    const handleNotificationOptions = (id: string) => {
        // Show options (mark as read, delete)
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}>
                    <ChevronLeft size={24} color={colors.text} />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Notification</Text>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationItem
                        notification={item}
                        onPress={() => handleNotificationPress(item.id)}
                        onOptions={() => handleNotificationOptions(item.id)}
                    />
                )}
                contentContainerStyle={styles.listContent}
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
        flexDirection: "row",
        alignItems: "center",
    },
    backButtonText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text,
        marginLeft: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
});
