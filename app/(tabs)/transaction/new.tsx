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
import { Stack, useRouter, Link } from "expo-router";
import { colors } from "@/constants/Colors";
import { useForm, Controller } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema, TransactionFormValues } from "@/libs/validation";
import { Wallpaper } from "lucide-react-native";
import { db } from "@/service/database";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useCategoryStore } from "@/stores/categoryStore";
import { useWalletStore } from "@/stores/walletStore";
import { useTransactionStore } from "@/stores/transactionStore";
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem,
} from "@/components/ui/select";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/ui/icon";

export default function NewTransactionScreen() {
    const router = useRouter();

    // Get data from stores
    const categories = useCategoryStore((state) => state.categories);
    const isCategoriesLoading = useCategoryStore((state) => state.isLoading);

    const wallets = useWalletStore((state) => state.wallets);
    const selectedWalletId = useWalletStore((state) => state.selectedWalletId);
    const isWalletsLoading = useWalletStore((state) => state.isLoading);

    const addTransaction = useTransactionStore((state) => state.addTransaction);
    const isTransactionLoading = useTransactionStore(
        (state) => state.isLoading
    );
    const transactionError = useTransactionStore((state) => state.error);

    const [formSubmitting, setFormSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Only load if stores are empty
            } catch (err) {
                console.error("Error initializing data:", err);
            }
        };

        init();
    }, []);

    // Find the selected wallet name from the ID
    const selectedWallet =
        wallets.find((w) => w.id === selectedWalletId)?.name || "";

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TransactionFormValues>({
        resolver: zodResolver(TransactionSchema) as any, // Type assertion to avoid complex type issues
        defaultValues: {
            amount: 0,
            type: "expense",
            currency: "vnd",
            category: "",
            wallet: selectedWallet,
            date: new Date(),
            note: "",
            repeat: "None",
        },
    });

    // Update currency when wallet changes
    const watchedWalletName = watch("wallet");

    useEffect(() => {
        const wallet = wallets.find((w) => w.name === watchedWalletName);
        if (wallet?.currency) {
            // Convert currency to lowercase and validate it's one of the allowed types
            const walletCurrency = wallet.currency.toLowerCase();
            if (walletCurrency === "vnd" || walletCurrency === "usd") {
                setValue("currency", walletCurrency as "vnd" | "usd");
            }
        }
    }, [watchedWalletName, wallets, setValue]);

    const onSubmit = async (data: TransactionFormValues) => {
        console.log("Form data:", data);

        try {
            setFormSubmitting(true);

            // Prepare transaction data
            const transactionData = {
                amount: data.amount,
                type: data.type,
                category: data.category,
                wallet: data.wallet,
                // Convert Date to ISO string for database storage
                date:
                    data.date instanceof Date
                        ? data.date.toISOString()
                        : data.date,
                note: data.note || "",
                currency: data.currency,
                repeat: data.repeat || "None",
            };

            // Create transaction object that matches the expected Transaction interface
            const transaction = {
                id: "", // This will be populated by the store/service
                amount: data.amount,
                type: data.type,
                category: data.category,
                categoryId: "1", // Placeholder ID
                date: data.date,
                wallet: data.wallet,
                walletId: "1", // Placeholder ID
                note: data.note || "",
                isRecurring:
                    data.repeat !== "None" && data.repeat !== undefined,
            };

            // Add transaction through store
            const result = await addTransaction(transaction);

            if (result) {
                // Navigate back to transaction list on success
                router.push("/(tabs)");
            }
        } catch (err) {
            console.error("Error creating transaction:", err);
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle date picker changes
    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setValue("date", selectedDate);
        }
    };

    // Combined loading state
    const isLoading =
        isWalletsLoading ||
        isCategoriesLoading ||
        isTransactionLoading ||
        formSubmitting;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/(tabs)")}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>New Transaction</Text>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Transaction Type</Text>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => (
                            <SegmentedControl
                                style={styles.segmentedControl}
                                options={[
                                    { label: "Expense", value: "expense" },
                                    { label: "Income", value: "income" },
                                ]}
                                selectedValue={value}
                                onChange={onChange}
                            />
                        )}
                    />
                </View>

                <View className="flex flex-row flex-1 gap-4 mb-4">
                    <View className="flex-1">
                        <View className="">
                            <Text style={styles.sectionLabel}>Amount</Text>
                            <Controller
                                control={control}
                                name="amount"
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <TextInput
                                        style={[
                                            styles.amountInput,
                                            errors.amount && styles.inputError,
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
                            {errors.amount && (
                                <Text style={styles.errorText}>
                                    {errors.amount.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View className="w-[100px]">
                        <Text style={styles.sectionLabel}>Currency</Text>
                        <Controller
                            control={control}
                            name="currency"
                            render={({ field: { value } }) => (
                                <View
                                    style={[
                                        styles.selectButton,
                                        { backgroundColor: colors.background },
                                    ]}>
                                    <Text style={styles.selectButtonText}>
                                        {value.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Wallet</Text>
                    <Controller
                        control={control}
                        name="wallet"
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
                                        placeholder="Select Wallet"
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
                                        {isWalletsLoading ? (
                                            <View
                                                style={{
                                                    padding: 10,
                                                    alignItems: "center",
                                                }}>
                                                <ActivityIndicator size="small" />
                                                <Text style={{ marginTop: 5 }}>
                                                    Loading wallets...
                                                </Text>
                                            </View>
                                        ) : wallets.length > 0 ? (
                                            wallets.map((wallet) => (
                                                <SelectItem
                                                    key={wallet.name}
                                                    label={wallet.name}
                                                    value={wallet.name}
                                                />
                                            ))
                                        ) : (
                                            <SelectItem
                                                label="No wallets available"
                                                value=""
                                                isDisabled={true}
                                            />
                                        )}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        )}
                    />
                    {wallets.length === 0 && !isWalletsLoading && (
                        <Link href="/wallet/new" asChild>
                            <TouchableOpacity>
                                <Text
                                    style={{
                                        color: colors.primary,
                                        marginTop: 8,
                                    }}>
                                    + Create a wallet first
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    )}
                    {errors.wallet && (
                        <Text style={styles.errorText}>
                            {errors.wallet.message}
                        </Text>
                    )}
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Category</Text>
                    <Controller
                        control={control}
                        name="category"
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
                    {errors.category && (
                        <Text style={styles.errorText}>
                            {errors.category.message}
                        </Text>
                    )}
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Date</Text>
                    <Controller
                        control={control}
                        name="date"
                        render={({ field: { value } }) => (
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowDatePicker(true)}
                                disabled={isLoading}>
                                <Text style={styles.selectButtonText}>
                                    {value.toLocaleDateString()}
                                </Text>
                                <ChevronRightIcon color={colors.textTertiary} />
                            </TouchableOpacity>
                        )}
                    />
                    {showDatePicker && (
                        <DateTimePicker
                            value={watch("date")}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Note</Text>
                    <Controller
                        control={control}
                        name="note"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={styles.noteInput}
                                multiline
                                numberOfLines={4}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Add a note (optional)"
                                editable={!isLoading}
                            />
                        )}
                    />
                </View>

                {transactionError && (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={styles.errorText}>{transactionError}</Text>
                    </View>
                )}

                <Button
                    title={isLoading ? "Creating..." : "Create Transaction"}
                    onPress={handleSubmit(onSubmit as any)}
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
