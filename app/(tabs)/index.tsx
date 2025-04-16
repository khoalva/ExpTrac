import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import { useUserStore } from "@/stores/userStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useWalletStore } from "@/stores/walletStore";
import { useNotificationStore } from "@/stores/notificationStore";
import Avatar from "@/components/ui/Avatar";
import { formatCurrency } from "@/utils/formatters";
import {
    Bell,
    Settings,
    BarChart3,
    Target,
    Wallet,
    FileText,
    FileSpreadsheet,
    LightbulbIcon,
} from "lucide-react-native";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function HomeScreen() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const getTotalIncome = useTransactionStore((state) => state.getTotalIncome);
    const getTotalExpense = useTransactionStore(
        (state) => state.getTotalExpense
    );
    const getTotalBalance = useWalletStore((state) => state.getTotalBalance);

    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        console.log("Current Slide:", currentSlide);
    }, [currentSlide]);

    // Mock data for carousel
    const carouselData = [
        {
            id: "1",
            title: "Today expense",
            amount: formatCurrency(500000),
            icon: "🔥",
            bgColor: colors.primaryDark,
        },
        {
            id: "2",
            title: "Savings",
            amount: formatCurrency(1500000),
            icon: "🐷",
            bgColor: "#1A1625",
        },
        {
            id: "3",
            title: "Investments",
            amount: formatCurrency(2500000),
            icon: "📈",
            bgColor: colors.primaryDark,
        },
    ];

    // Feature grid items
    const features = [
        {
            id: "1",
            title: "Statistics",
            icon: <BarChart3 size={32} color="#FF6384" />,
            onPress: () => router.push("/(tabs)/statistics"),
        },
        {
            id: "2",
            title: "Budget",
            icon: <Target size={32} color="#FF9F40" />,
            onPress: () => router.push("/(tabs)/budget"),
        },
        {
            id: "3",
            title: "My Wallet",
            icon: <Wallet size={32} color="#FF9F40" />,
            onPress: () => router.push("/wallet"), // Remove /index - this automatically points to index.tsx
        },
        {
            id: "4",
            title: "Transactions",
            icon: <FileText size={32} color="#36A2EB" />,
            onPress: () => router.push("/(tabs)/history"),
        },
        {
            id: "5",
            title: "Subscription",
            icon: <FileSpreadsheet size={32} color="#4BC0C0" />,
            onPress: () => router.push("/subscription"),
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar style="dark" />

            <View className="bg-background pb-8 relative z-10">
                <View className="flex-row justify-between items-center px-5 py-4">
                    <View className="flex-row items-center">
                        <Avatar
                            source={user?.avatar}
                            name={user?.name}
                            size={48}
                        />
                        <View className="ml-3">
                            <Text className="text-sm text-textSecondary">
                                Have a nice day!
                            </Text>
                            <Text className="text-lg font-bold text-text">
                                {user?.name}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className="p-2 ml-2 relative"
                            onPress={() => router.push("/notifications")}>
                            <Bell size={24} color={colors.text} />
                            {unreadCount > 0 && (
                                <View className="absolute top-0 right-0 bg-error rounded-full w-4 h-4 items-center justify-center">
                                    <Text className="text-white text-xs font-bold">
                                        {unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="p-2 ml-2"
                            onPress={() => router.push("/profile")}>
                            <Settings size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Summary Cards Carousel */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    className="px-5 flex "
                    onMomentumScrollEnd={(event) => {
                        const slideIndex = Math.round(
                            event.nativeEvent.contentOffset.x /
                                event.nativeEvent.layoutMeasurement.width
                        );
                        setCurrentSlide(slideIndex);
                    }}>
                    <View className="flex-1 flex flex-row justify-between gap-4 items-center">
                        {carouselData.map((item, index) => (
                            <View
                                key={item.id}
                                style={{ backgroundColor: item.bgColor }}
                                className="w-screen h-40 rounded-2xl p-4 relative">
                                {/* Circular background elements */}
                                <View className="absolute top-0 left-0 right-0 bottom-0">
                                    <View className="absolute w-[150px] h-[150px] rounded-full bg-white/10 -top-[50px] -right-[50px]" />
                                    <View className="absolute w-[100px] h-[100px] rounded-full bg-white/10 -bottom-5 -left-5" />
                                </View>

                                <View className="flex-row justify-between items-start z-10">
                                    <Text className="text-base text-white font-medium">
                                        {item.title}
                                    </Text>
                                    <Text className="text-2xl">
                                        {item.icon}
                                    </Text>
                                </View>
                                <View className="mt-4 z-10">
                                    <Text className="text-sm text-white/70 mb-1">
                                        Amount
                                    </Text>
                                    <Text className="text-2xl font-bold text-white">
                                        {item.amount}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* Carousel Indicators */}
                <View className="flex-row justify-center mt-4">
                    {carouselData.map((_, index) => (
                        <View
                            key={index}
                            className={`${
                                currentSlide === index
                                    ? "w-6 bg-purple-400"
                                    : "w-2 bg-black"
                            } h-2 rounded mx-1`}
                        />
                    ))}
                </View>

                {/* Curved bottom edge */}
                <View className="absolute -bottom-5 left-0 right-0 h-10 bg-background rounded-t-3xl scale-y-[-1] z-[-1]" />
            </View>

            <View className="flex-1 -mt-5">
                {/* Features Grid */}
                <View className="flex-row flex-wrap px-5 mb-5 justify-between">
                    {features.map((feature) => (
                        <TouchableOpacity
                            key={feature.id}
                            className="w-[48%] mb-4 items-center p-5 rounded-2xl bg-white shadow"
                            style={{
                                shadowColor: colors.shadow,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                            onPress={feature.onPress}
                            activeOpacity={0.7}>
                            <View className="mb-3">{feature.icon}</View>
                            <Text className="text-base text-text text-center font-medium">
                                {feature.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Notification Permission Modal */}
            <Modal
                visible={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                title="Allow Notification Access?"
                showCloseButton={false}>
                <Text className="text-base text-textSecondary text-center mb-6">
                    To automatically track your expenses from transaction
                    notifications, ExpTrac needs access to your device's
                    notifications.
                </Text>

                <View className="flex-row justify-between">
                    <Button
                        title="Allow"
                        onPress={() => setShowNotificationModal(false)}
                        style={{ flex: 1, marginRight: 8 }}
                    />
                    <Button
                        title="Maybe Later"
                        variant="outline"
                        onPress={() => setShowNotificationModal(false)}
                        style={{ flex: 1, marginLeft: 8 }}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
}
