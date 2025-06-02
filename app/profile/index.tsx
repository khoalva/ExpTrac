import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import { useUserStore } from "@/stores/userStore";
import Avatar from "@/components/custom/Avatar";
import { Card } from "@/components/custom/Card";
import {
    ChevronRight,
    User,
    Users,
    Moon,
    Bell,
    LogOut,
    HelpCircle,
    Info,
    Edit,
} from "lucide-react-native";

export default function ProfileScreen() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const isDarkMode = useUserStore((state) => state.isDarkMode);
    const toggleDarkMode = useUserStore((state) => state.toggleDarkMode);
    const logout = useUserStore((state) => state.logout);

    const handleLogout = () => {
        // TODO: swipe the sqlite database
        logout();
        router.replace("./auth/login");
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Profile</Text>

                <Card style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <Avatar
                            source={user?.avatar}
                            name={user?.name}
                            size={60}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user?.name}</Text>
                            <Text style={styles.profileEmail}>
                                {user?.email}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <Edit size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </Card>

                <View style={styles.settingsSection}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <User size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>My Account</Text>
                            <Text style={styles.settingDescription}>
                                Make changes to your account
                            </Text>
                        </View>
                        <View style={styles.settingAction}>
                            <Text style={styles.warningText}>!</Text>
                            <ChevronRight
                                size={20}
                                color={colors.textSecondary}
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <Users size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>
                                Saved Beneficiary
                            </Text>
                            <Text style={styles.settingDescription}>
                                Manage your saved account
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <Moon size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Dark Mode</Text>
                            <Text style={styles.settingDescription}>
                                Switch to a darker theme
                            </Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{
                                false: colors.border,
                                true: colors.primaryLight,
                            }}
                            thumbColor={isDarkMode ? colors.primary : "white"}
                        />
                    </View>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <Bell size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>
                                Notification Access
                            </Text>
                            <Text style={styles.settingDescription}>
                                Manage permission to read notifications
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleLogout}>
                        <View style={styles.settingIconContainer}>
                            <LogOut size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Log out</Text>
                            <Text style={styles.settingDescription}>
                                Further secure your account for safety
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>More</Text>

                <View style={styles.settingsSection}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <HelpCircle size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>
                                Help & Support
                            </Text>
                            <Text style={styles.settingDescription}>
                                Get help and contact support
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <Info size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>About App</Text>
                            <Text style={styles.settingDescription}>
                                Learn more about ExpTrac
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
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
    scrollView: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 16,
    },
    profileCard: {
        marginBottom: 24,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text,
    },
    profileEmail: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    editButton: {
        padding: 8,
    },
    settingsSection: {
        backgroundColor: "white",
        borderRadius: 16,
        marginBottom: 24,
        overflow: "hidden",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 12,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(93, 66, 117, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text,
    },
    settingDescription: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    settingAction: {
        flexDirection: "row",
        alignItems: "center",
    },
    warningText: {
        color: colors.error,
        fontWeight: "bold",
        marginRight: 8,
    },
});
