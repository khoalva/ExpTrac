import React, { useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import {
    Button,
    ButtonText,
    ButtonSpinner,
    ButtonIcon,
    ButtonGroup,
} from "@/components/ui/button/index";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useWalletStore } from "@/stores/walletStore";
import { useUserStore } from "@/stores/userStore";
import { formatCurrency } from "@/utils/formatters";
import { colors } from "@/constants/Colors";
import Avatar from "@/components/custom/Avatar";
import { useRouter } from "expo-router";
import { Pencil, Trash } from "lucide-react-native";
import { db } from "@/service/database";

export default function WalletScreen() {
    // Get wallet data from your store
    const wallets = useWalletStore((state) => state.wallets);
    const loadWallets = useWalletStore((state) => state.loadWallets);
    const getTotalBalance = useWalletStore((state) => state.getTotalBalance);
    const deleteWallet = useWalletStore((state) => state.deleteWallet);
    const isLoading = useWalletStore((state) => state.isLoading);
    const error = useWalletStore((state) => state.error);

    const user = useUserStore((state) => state.user);
    const router = useRouter();

    // Load wallets when component mounts
    useEffect(() => {
        const initializeData = async () => {
            try {
                // Initialize database
                await db.initDatabase();

                // Load wallets
                await loadWallets();
            } catch (err) {
                console.error("Error initializing wallet data:", err);
            }
        };

        initializeData();
    }, [loadWallets]);

    const handleEditWallet = (walletId: string) => {
        // Navigate to edit wallet screen
        // For now, just navigate to new wallet screen
        router.push("/(tabs)/wallet/new");
    };

    const handleDeleteWallet = async (walletId: string) => {
        try {
            // Delete wallet through store (which updates database)
            await deleteWallet(walletId);
        } catch (err) {
            console.error(`Error deleting wallet ${walletId}:`, err);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Avatar source={user?.avatar} name={user?.name} size={40} />
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-5">
                <View className="bg-primaryLight rounded-xl mt-5">
                    <Text className="text-textSecondary mb-1 font-bold text-2xl">
                        My Wallet
                    </Text>
                    <View className="bg-[#3d2952] flex-1 h-fit flex flex-col justify-start gap-4 items-start p-4 rounded-xl">
                        <Text className="text-slate-400">Total</Text>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-2xl font-bold text-white">
                                {formatCurrency(
                                    wallets.reduce(
                                        (sum, wallet) => sum + wallet.balance,
                                        0
                                    )
                                )}
                            </Text>
                        )}
                    </View>
                </View>

                <View className="flex flex-row flex-1 justify-between items-center mt-10">
                    <Text>Source</Text>
                    <View className="flex flex-row justify-between gap-2 items-center">
                        <Text>Add New Source</Text>
                        <Button
                            className="bg-[#5D4275] rounded-xl flex justify-center items-center w-[30px] h-[30px] active:bg-[#5D4275]/90 p-0"
                            size="md"
                            onPress={() => router.push("/(tabs)/wallet/new")}>
                            <ButtonText className="text-white text-xl">
                                +
                            </ButtonText>
                        </Button>
                    </View>
                </View>

                {error && (
                    <View className="mt-4 p-2 bg-red-100 rounded-lg">
                        <Text className="text-red-500">{error}</Text>
                    </View>
                )}

                <View className="mt-5">
                    {isLoading ? (
                        <View className="flex items-center justify-center py-8">
                            <ActivityIndicator
                                size="large"
                                color={colors.primary}
                            />
                            <Text className="mt-4 text-textSecondary">
                                Loading wallets...
                            </Text>
                        </View>
                    ) : wallets && wallets.length > 0 ? (
                        wallets.map((wallet) => (
                            <View
                                key={wallet.id}
                                className="bg-[#5D4275] rounded-xl p-5 mb-4 shadow-sm flex flex-row justify-between items-start">
                                <View className="flex flex-col justify-start items-start flex-1">
                                    <Text className="text-lg font-medium text-slate-400">
                                        {wallet.name}
                                    </Text>
                                    <Text className="text-xl font-bold text-primary mt-2 text-white">
                                        {formatCurrency(
                                            wallet.balance,
                                            wallet.currency
                                        )}
                                    </Text>
                                </View>
                                <View className="flex flex-col justify-start items-start">
                                    <TouchableOpacity
                                        className="w-fit h-fit bg-none gap-1 flex flex-row items-center justify-start"
                                        onPress={() =>
                                            handleEditWallet(wallet.id)
                                        }>
                                        <Pencil size={12} color={"#FFF"} />
                                        <Text className="text-white">Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="w-fit h-fit bg-none gap-1 flex flex-row items-center justify-start"
                                        onPress={() =>
                                            handleDeleteWallet(wallet.id)
                                        }>
                                        <Trash size={12} color={"red"} />
                                        <Text className="text-red-500">
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
                            <Text className="text-center text-textSecondary mb-4">
                                No wallets found. Add a wallet to get started.
                            </Text>
                            <Button
                                className="bg-[#5D4275] rounded-xl flex justify-center items-center"
                                onPress={() =>
                                    router.push("/(tabs)/wallet/new")
                                }>
                                <ButtonText className="text-white">
                                    Add Your First Wallet
                                </ButtonText>
                            </Button>
                        </View>
                    )}
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
});
