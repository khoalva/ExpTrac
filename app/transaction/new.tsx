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
import { useRouter, Link } from "expo-router";
import { colors } from "@/constants/Colors";
import { useUserStore } from "@/stores/userStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useWalletStore } from "@/stores/walletStore";
import Avatar from "@/components/custom/Avatar";
import Button from "@/components/custom/Button";
import SegmentedControl from "@/components/custom/SegmentedControl";
import Input from "@/components/custom/Input";
import SuccessModal from "@/components/modals/SuccessModal";
import { ChevronDown, ChevronRight, Calendar, Plus } from "lucide-react-native";
import { TransactionSchema } from "@/libs/validation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { TransactionType } from "@/types";
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
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { db } from "@/service/database";
import { transactionService } from "@/service/TransactionService";
import { walletService } from "@/service/WalletService";
import { categoryService } from "@/service/CategoryService";
import { currencies } from "@/constants/currencies";

// would later use zustand to store the latest screen before this screen, to navigate back to when back button is pressed
type TransactionScreenProps = {
    callBackScreen?: string;
};

const repeats = [
    { name: "None" },
    { name: "Weekly" },
    { name: "Monthly" },
    { name: "Yearly" },
];

export default function NewTransactionScreen({
    callBackScreen,
}: TransactionScreenProps) {
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    // Transaction store
    const addTransaction = useTransactionStore((state) => state.addTransaction);
    const isTransactionLoading = useTransactionStore(
        (state) => state.isLoading
    );
    const transactionError = useTransactionStore((state) => state.error);

    // Category store
    const categoriesFromStore = useCategoryStore((state) => state.categories);
    const isCategoriesLoading = useCategoryStore((state) => state.isLoading);

    // Wallet store
    const walletsFromStore = useWalletStore((state) => state.wallets);
    const selectedWalletId = useWalletStore((state) => state.selectedWalletId);
    const isWalletsLoading = useWalletStore((state) => state.isLoading);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [wallets, setWallets] = useState<
        { name: string; currency: string }[]
    >([]);
    const [categories, setCategories] = useState<{ name: string }[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    // Load wallets and categories when component mounts
    useEffect(() => {
        const loadOptions = async () => {
            try {
                setIsLoadingOptions(true);

                // Initialize database
                await db.initDatabase();

                // Either use service directly or store data depending on which is populated
                if (walletsFromStore.length > 0) {
                    setWallets(
                        walletsFromStore.map((wallet) => ({
                            name: wallet.name,
                            currency: wallet.currency,
                        }))
                    );
                } else {
                    const dbWallets = await walletService.getAllWallets();
                    setWallets(
                        dbWallets.map((wallet) => ({
                            name: wallet.name,
                            currency: wallet.currency,
                        }))
                    );
                }

                if (categoriesFromStore.length > 0) {
                    setCategories(categoriesFromStore);
                } else {
                    const dbCategories =
                        await categoryService.getAllCategories();
                    setCategories(dbCategories);
                }
            } catch (error) {
                console.error("Error loading options:", error);
                setError("Failed to load wallets and categories");
            } finally {
                setIsLoadingOptions(false);
            }
        };

        loadOptions();
    }, [walletsFromStore, categoriesFromStore]);

    // Find selected wallet name from store if available
    const selectedWallet = selectedWalletId
        ? walletsFromStore.find((w) => w.id === selectedWalletId)?.name || ""
        : "";

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<z.infer<typeof TransactionSchema>>({
        resolver: zodResolver(TransactionSchema) as any,
        defaultValues: {
            type: "expense",
            amount: 0,
            currency: "",
            date: new Date().toISOString(),
            wallet: selectedWallet || "",
            category: "",
            repeat: "",
            note: "",
            picture: "",
        },
    });

    const transactionType = watch("type");
    const watchedWallet = watch("wallet");

    // Update currency when wallet changes
    useEffect(() => {
        if (watchedWallet) {
            const wallet = wallets.find((w) => w.name === watchedWallet);
            if (wallet) {
                // Convert the currency string to the expected type
                const currency = wallet.currency.toLowerCase();
                console.log("Currency from wallet:", currency);
                setValue("currency", currency);
            }
        }
    }, [watchedWallet, wallets, setValue]);

    // Combined loading state
    const combinedLoadingState =
        isLoading ||
        isLoadingOptions ||
        isTransactionLoading ||
        isCategoriesLoading ||
        isWalletsLoading;

    const onSubmit = async (data: z.infer<typeof TransactionSchema>) => {
        try {
            setIsLoading(true);
            setError("");
            console.log("Form data:", data);

            // Create transaction object for store (no need to create separately in database)
            const storeTransaction = {
                id: "", // This will be assigned by the store/service
                amount: data.amount,
                currency: data.currency,
                type: data.type,
                category: data.category,
                date: new Date(data.date),
                walletId: selectedWalletId || "1", // Use selected wallet ID if available
                wallet: data.wallet,
                categoryId: "1", // Legacy field needed by store
                isRecurring:
                    data.repeat !== "None" && data.repeat !== undefined,
                note: data.note || "",
            };

            // Add transaction to store - this will also save to the database
            const transactionId = await addTransaction(storeTransaction);

            if (!transactionId) {
                throw new Error("Failed to create transaction");
            }

            console.log(`Transaction created with ID: ${transactionId}`);

            // Show success modal
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error creating transaction:", error);
            setError("Failed to create transaction. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        router.push("/history");
    };

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

            {combinedLoadingState && isLoadingOptions ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>New Transaction</Text>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionLabel}>Type</Text>
                        <Controller
                            control={control}
                            name="type"
                            render={({ field: { onChange, value } }) => (
                                <SegmentedControl
                                    options={[
                                        { label: "Expense", value: "expense" },
                                        { label: "Income", value: "income" },
                                    ]}
                                    selectedValue={value}
                                    onChange={onChange}
                                    style={styles.segmentedControl}
                                />
                            )}
                        />
                        {errors.type && (
                            <Text style={styles.errorText}>
                                {errors.type.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formRow}>
                        <View style={styles.formColumn}>
                            <Text style={styles.sectionLabel}>Amount</Text>
                            <Controller
                                control={control}
                                name="amount"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.amountInput,
                                            errors.amount && styles.inputError,
                                        ]}
                                        placeholder="Amount"
                                        value={value?.toString() || ""}
                                        onChangeText={(text) => {
                                            const numValue = parseFloat(text);
                                            onChange(
                                                !isNaN(numValue) ? numValue : 0
                                            );
                                        }}
                                        keyboardType="number-pad"
                                        editable={!combinedLoadingState}
                                    />
                                )}
                            />
                            {errors.amount && (
                                <Text style={styles.errorText}>
                                    {errors.amount.message}
                                </Text>
                            )}
                        </View>

                        <View style={styles.formColumn}>
                            <Text style={styles.sectionLabel}>Currency</Text>
                            <Controller
                                control={control}
                                name="currency"
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        selectedValue={value}
                                        onValueChange={onChange}>
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
                        <Text style={styles.sectionLabel}>Date</Text>
                        <Controller
                            control={control}
                            name="date"
                            render={({ field: { value } }) => (
                                <TouchableOpacity
                                    style={styles.selectButton}
                                    disabled={combinedLoadingState}
                                    onPress={() => {
                                        DateTimePickerAndroid.open({
                                            value: new Date(value),
                                            onChange: (event, selectedDate) => {
                                                if (selectedDate) {
                                                    setValue(
                                                        "date",
                                                        selectedDate.toISOString()
                                                    );
                                                }
                                            },
                                        });
                                    }}>
                                    <Text style={styles.selectButtonText}>
                                        {new Date(value).toLocaleDateString()}
                                    </Text>
                                    <ChevronDown
                                        size={16}
                                        color={colors.text}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                        {errors.date && (
                            <Text style={styles.errorText}>
                                {errors.date.message}
                            </Text>
                        )}
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
                                    isDisabled={combinedLoadingState}>
                                    <SelectTrigger
                                        variant="outline"
                                        className="w-full h-fit rounded-xl bg-white flex justify-between items-center px-4"
                                        size="md">
                                        <SelectInput
                                            style={styles.selectButtonText}
                                            className="p-0"
                                            placeholder="Select Wallet"
                                        />
                                        <SelectIcon
                                            className=""
                                            as={ChevronRightIcon}
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
                                                    <Text
                                                        style={{
                                                            marginTop: 5,
                                                        }}>
                                                        Loading wallets...
                                                    </Text>
                                                </View>
                                            ) : wallets.length === 0 ? (
                                                <SelectItem
                                                    label="No wallets available"
                                                    value=""
                                                    isDisabled={true}
                                                />
                                            ) : (
                                                wallets.map((wallet) => (
                                                    <SelectItem
                                                        key={wallet.name}
                                                        label={wallet.name}
                                                        value={wallet.name}
                                                    />
                                                ))
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
                                    isDisabled={combinedLoadingState}>
                                    <SelectTrigger
                                        variant="outline"
                                        className="w-full h-fit rounded-xl bg-white flex justify-between items-center px-4"
                                        size="md">
                                        <SelectInput
                                            style={styles.selectButtonText}
                                            className="px-0"
                                            placeholder="Select Category"
                                        />
                                        <SelectIcon
                                            className=""
                                            as={ChevronRightIcon}
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
                                                    <Text
                                                        style={{
                                                            marginTop: 5,
                                                        }}>
                                                        Loading categories...
                                                    </Text>
                                                </View>
                                            ) : categories.length === 0 ? (
                                                <SelectItem
                                                    label="No categories available"
                                                    value=""
                                                    isDisabled={true}
                                                />
                                            ) : (
                                                categories.map((category) => (
                                                    <SelectItem
                                                        key={category.name}
                                                        label={category.name}
                                                        value={category.name}
                                                    />
                                                ))
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
                        <Text style={styles.sectionLabel}>Repeat</Text>
                        <Controller
                            control={control}
                            name="repeat"
                            render={({ field: { onChange, value } }) => (
                                <Select
                                    selectedValue={value}
                                    onValueChange={onChange}
                                    isDisabled={combinedLoadingState}>
                                    <SelectTrigger
                                        variant="outline"
                                        className="w-full h-fit rounded-xl bg-white flex justify-between items-center px-4"
                                        size="md">
                                        <SelectInput
                                            style={styles.selectButtonText}
                                            className="px-0"
                                            placeholder="Select Repeat"
                                        />
                                        <SelectIcon
                                            className=""
                                            as={ChevronRightIcon}
                                        />
                                    </SelectTrigger>
                                    <SelectPortal className="">
                                        <SelectBackdrop />
                                        <SelectContent className="">
                                            <SelectDragIndicatorWrapper>
                                                <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            {repeats.map((repeat) => (
                                                <SelectItem
                                                    key={repeat.name}
                                                    label={repeat.name}
                                                    value={repeat.name}
                                                />
                                            ))}
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            )}
                        />
                        {errors.repeat && (
                            <Text style={styles.errorText}>
                                {errors.repeat.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionLabel}>Note</Text>
                        <Controller
                            control={control}
                            name="note"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.noteInput}
                                    placeholder="Note"
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                    editable={!combinedLoadingState}
                                />
                            )}
                        />
                        {errors.note && (
                            <Text style={styles.errorText}>
                                {errors.note.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionLabel}>Add a picture</Text>
                        <TouchableOpacity
                            style={styles.addPictureButton}
                            disabled={combinedLoadingState}
                            onPress={() => {
                                // This would open the image picker
                                // and update the form value with the selected image
                            }}>
                            <Plus size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {(error || transactionError) && (
                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.errorText}>
                                {error || transactionError}
                            </Text>
                        </View>
                    )}

                    <Button
                        title={
                            combinedLoadingState
                                ? "Adding..."
                                : "Add Transaction"
                        }
                        onPress={handleSubmit(onSubmit)}
                        style={styles.addButton}
                        loading={combinedLoadingState}
                        disabled={combinedLoadingState}
                    />
                </ScrollView>
            )}

            <SuccessModal
                visible={showSuccessModal}
                onClose={handleSuccessModalClose}
                message="You have ADD A TRANSACTION successfully. You can view your transaction in transaction history"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ...existing code...
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.textSecondary,
    },
});
