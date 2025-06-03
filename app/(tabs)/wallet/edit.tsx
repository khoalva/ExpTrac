import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { z } from "zod";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/Colors";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletSchema } from "@/libs/validation";
import { Wallpaper } from "lucide-react-native";
import { db } from "@/service/database";
import Button from "@/components/custom/Button";
import { useWalletStore } from "@/stores/walletStore";
import { useCategoryStore } from "@/stores/categoryStore";
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
} from "@/components/ui/select";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/ui/icon";
import { currencies } from "@/constants/currencies";
import { Wallet } from "@/types";
import { updateWallet as updateWalletOnline } from "@/service/online/WalletService";

export default function EditWalletScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    // Wallet store
    const wallets = useWalletStore((state) => state.wallets);
    const updateWallet = useWalletStore((state) => state.updateWallet);
    const isWalletLoading = useWalletStore((state) => state.isLoading);
    const walletError = useWalletStore((state) => state.error);

    // Category store - use categories from the store instead of loading from database
    const categories = useCategoryStore((state) => state.categories);
    const isCategoriesLoading = useCategoryStore((state) => state.isLoading);

    const [formSubmitting, setFormSubmitting] = useState(false);
    const [currentWallet, setCurrentWallet] = useState<Wallet>();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<z.infer<typeof WalletSchema>>({
        resolver: zodResolver(WalletSchema) as any,
        defaultValues: {
            name: "",
            init_amount: 0,
            currency: "vnd",
            visible_category: "",
        },
    });

    // Find and load the current wallet data when the component mounts
    useEffect(() => {
        if (id && wallets.length > 0) {
            const wallet = wallets.find((w) => w.id === id);
            if (wallet) {
                setCurrentWallet(wallet);
                // Initialize form with wallet data
                setValue("name", wallet.name);
                setValue("init_amount", wallet.init_amount);
                setValue("currency", wallet.currency || "vnd");
                setValue("visible_category", wallet.visible_category || "");
            } else {
                // Handle case where wallet is not found
                console.error("Wallet not found with ID:", id);
                router.push("/(tabs)/wallet");
            }
        }
    }, [id, wallets, setValue]);

    const onSubmit = async (data: z.infer<typeof WalletSchema>) => {
        if (!id) return;

        try {
            setFormSubmitting(true);

            // Convert to wallet format for store
            const walletData = {
                id,
                name: data.name,
                init_amount: data.init_amount,
                currency: data.currency,
                visible_category: data.visible_category,
            };

            // Step 1: Always perform local update first (offline-first approach)
            console.log(`Updating wallet "${id}" locally...`);
            await updateWallet(id, walletData);
            console.log(
                `Successfully updated wallet "${id}" in local database`
            );

            // Step 2: Check internet connectivity and sync with online database
            const netInfo = await NetInfo.fetch();
            const isConnected =
                netInfo.isConnected && netInfo.isInternetReachable;

            if (isConnected) {
                try {
                    console.log(
                        `Syncing wallet update with online database...`
                    );
                    await updateWalletOnline(id, walletData);
                    console.log(
                        `Successfully synced wallet update with online database`
                    );
                } catch (onlineError) {
                    // Online operation failed, but local succeeded
                    console.warn(
                        `Failed to sync wallet update with online database:`,
                        onlineError
                    );
                    // Note: You might want to queue this for retry later
                }
            } else {
                console.log(
                    "No internet connection - wallet update will sync when online"
                );
            }

            // Navigate back to wallet list on success
            router.push("/(tabs)/wallet");
        } catch (localError) {
            // Local operation failed - this is critical
            console.error(
                "Error updating wallet in local database:",
                localError
            );
            // The error will be displayed in the UI via the error state
        } finally {
            setFormSubmitting(false);
        }
    };

    // Combined loading state
    const isLoading =
        isWalletLoading ||
        isCategoriesLoading ||
        formSubmitting ||
        !currentWallet;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/(tabs)/wallet")}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Edit Wallet</Text>
                <View className="">
                    <View>
                        <Controller
                            control={control}
                            name="name"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <Text style={styles.sectionLabel}>
                                            Wallet name
                                        </Text>
                                        <TextInput
                                            style={[
                                                styles.amountInput,
                                                errors.name &&
                                                    styles.inputError,
                                            ]}
                                            onBlur={onBlur}
                                            onChangeText={(value) => {
                                                setValue("name", value);
                                                onChange(value);
                                            }}
                                            value={value}
                                            placeholder="Wallet name"
                                            editable={!isLoading}
                                        />
                                        {errors.name && (
                                            <Text style={styles.errorText}>
                                                {errors.name.message}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                </View>

                <View className="flex flex-row flex-1 gap-4 mb-4">
                    <View className="flex-1">
                        <View className="">
                            <Text style={styles.sectionLabel}>Amount</Text>
                            <Controller
                                control={control}
                                name="init_amount"
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <TextInput
                                        style={[
                                            styles.amountInput,
                                            errors.init_amount &&
                                                styles.inputError,
                                        ]}
                                        className="w-full h-fit rounded-xl bg-white"
                                        placeholder="Amount"
                                        value={value?.toString() || ""}
                                        onChangeText={(text) => {
                                            const numValue = parseFloat(text);
                                            onChange(
                                                !isNaN(numValue) ? numValue : 0
                                            );
                                        }}
                                        keyboardType="number-pad"
                                        editable={!isLoading}
                                    />
                                )}
                            />
                            {errors.init_amount && (
                                <Text style={styles.errorText}>
                                    {errors.init_amount.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View className="w-[100px]">
                        <Text style={styles.sectionLabel}>Currency</Text>
                        <Controller
                            control={control}
                            name="currency"
                            render={({ field: { onChange, value } }) => (
                                <Select
                                    selectedValue={value}
                                    onValueChange={onChange}
                                    isDisabled={isLoading}>
                                    <SelectTrigger
                                        variant="outline"
                                        className="w-full h-fit rounded-xl bg-white flex justify-between items-center px-4"
                                        size="md">
                                        <SelectInput
                                            placeholder="Select Currency"
                                            value={value.toUpperCase()}
                                        />
                                        <SelectIcon
                                            className="mr-3"
                                            as={ChevronDownIcon}
                                        />
                                    </SelectTrigger>
                                    <SelectPortal className="">
                                        <SelectBackdrop />
                                        <SelectContent className="">
                                            <SelectDragIndicatorWrapper>
                                                <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            {currencies.map((currency) => (
                                                <SelectItem
                                                    key={currency.code}
                                                    label={currency.name}
                                                    value={currency.code}
                                                />
                                            ))}
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            )}
                        />
                        {errors.currency && (
                            <Text style={styles.errorText}>
                                {errors.currency.message}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Category</Text>
                    <Controller
                        control={control}
                        name="visible_category"
                        render={({ field: { onChange, value } }) => (
                            <Select
                                selectedValue={value}
                                onValueChange={onChange}
                                isDisabled={isLoading}>
                                <SelectTrigger
                                    variant="outline"
                                    className="w-full h-fit rounded-xl bg-white flex justify-between items-center px-4"
                                    size="md">
                                    <SelectInput
                                        placeholder="Select Category"
                                        value={value}
                                    />
                                    <SelectIcon
                                        className="mr-3"
                                        as={ChevronDownIcon}
                                    />
                                </SelectTrigger>
                                <SelectPortal className="">
                                    <SelectBackdrop />
                                    <SelectContent className="">
                                        <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        {isCategoriesLoading ? (
                                            <View
                                                style={{
                                                    padding: 10,
                                                    alignItems: "center",
                                                }}>
                                                <ActivityIndicator size="small" />
                                                <Text style={{ marginTop: 5 }}>
                                                    Loading categories...
                                                </Text>
                                            </View>
                                        ) : categories.length > 0 ? (
                                            categories.map((category) => (
                                                <SelectItem
                                                    key={category.name}
                                                    label={category.name}
                                                    value={category.name}
                                                />
                                            ))
                                        ) : (
                                            <SelectItem
                                                label="No categories available"
                                                value=""
                                                isDisabled={true}
                                            />
                                        )}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        )}
                    />
                    {errors.visible_category && (
                        <Text style={styles.errorText}>
                            {errors.visible_category.message}
                        </Text>
                    )}
                </View>

                {walletError && (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={styles.errorText}>{walletError}</Text>
                    </View>
                )}

                <Button
                    title={isLoading ? "Updating..." : "Update Wallet"}
                    onPress={handleSubmit(onSubmit)}
                    style={styles.addButton}
                    loading={isLoading}
                    disabled={isLoading}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 4,
    },
    inputError: {
        borderColor: "red",
    },
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
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: colors.primary,
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
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 24,
    },
    formSection: {
        marginBottom: 16,
    },
    formRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    formColumn: {
        flex: 1,
        marginRight: 8,
    },
    sectionLabel: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    segmentedControl: {
        marginBottom: 8,
    },
    amountInput: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    selectButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    selectButtonText: {
        fontSize: 16,
        color: colors.textTertiary,
    },
    noteInput: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: "top",
    },
    addPictureButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        marginTop: 16,
        marginBottom: 32,
    },
});
