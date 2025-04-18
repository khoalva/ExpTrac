import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import { useUserStore } from "@/stores/userStore";
import { useTransactionStore } from "@/stores/transactionStore";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Input from "@/components/ui/Input";
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
import { transactionService } from "@/service/TransactionService";
import { db } from "@/service/database";
// would later use zustand to store the latest screen before this screen, to navigate back to when back button is pressed
type TransactionScreenProps = {
    callBackScreen: string;
};

// dummy data

const wallets = [{ name: "My Wallet" }, { name: "Family Wallet" }];

const categories = [
    { name: "Food & Drinks" },
    { name: "Shopping" },
    { name: "Transportation" },
];

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
    const addTransaction = useTransactionStore((state) => state.addTransaction);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<z.infer<typeof TransactionSchema>>({
        resolver: zodResolver(TransactionSchema),
        defaultValues: {
            type: "expense",
            amount: 0,
            currency: "vnd",
            date: new Date().toISOString(),
            wallet: "",
            category: "",
            repeat: "None",
            note: "",
            picture: "",
        },
    });

    const transactionType = watch("type");

    const onSubmit = async (data: z.infer<typeof TransactionSchema>) => {
        try {
            console.log("Form data:", data);

            // Initialize database if not already
            await db.initDatabase();

            // Create transaction object for database that matches the transaction_log table schema
            const transaction = {
                type: data.type,
                amount: data.amount,
                currency: data.currency || "vnd",
                date: new Date(data.date).toISOString(),
                wallet: data.wallet,
                category: data.category,
                repeat: data.repeat || "None",
                note: data.note || "",
                picture: data.picture || "",
            };

            // Save transaction to database
            const transactionId = await transactionService.createTransaction(
                transaction
            );
            console.log(`Transaction created with ID: ${transactionId}`);

            // Create transaction object for store (might have a different shape)
            const storeTransaction = {
                id: transactionId.toString(),
                amount: data.amount,
                type: data.type,
                category: data.category,
                date: new Date(data.date),
                walletId: "1", // Legacy field needed by store
                wallet: data.wallet,
                categoryId: "1", // Legacy field needed by store
                isRecurring: data.repeat !== "None",
                note: data.note || "",
            };

            // Add transaction to store for UI updates
            addTransaction(storeTransaction);

            // Show success modal
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error creating transaction:", error);
            // Handle error (show error message to user)
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
                                            <SelectItem
                                                label="VND"
                                                value="vnd"
                                            />
                                            <SelectItem
                                                label="USD"
                                                value="usd"
                                            />
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
                                <ChevronDown size={16} color={colors.text} />
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
                            // <TouchableOpacity
                            //     style={[
                            //         styles.selectButton,
                            //         errors.wallet && styles.inputError,
                            //     ]}
                            //     onPress={() => {
                            //         // In a real implementation, this would navigate to wallet selection
                            //         // For now, let's just set a dummy value
                            //         onChange("My Wallet");
                            //     }}>
                            //     <Text style={styles.selectButtonText}>
                            //         {value || "Choose Wallet"}
                            //     </Text>
                            //     <ChevronRight size={16} color={colors.text} />
                            // </TouchableOpacity>
                            <Select
                                selectedValue={value}
                                onValueChange={onChange}>
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
                                        {wallets.map((wallet) => (
                                            <SelectItem
                                                key={wallet.name}
                                                label={wallet.name}
                                                value={wallet.name}
                                            />
                                        ))}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        )}
                    />
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
                            // <TouchableOpacity
                            //     style={[
                            //         styles.selectButton,
                            //         errors.category && styles.inputError,
                            //     ]}
                            //     onPress={() => {
                            //         // In a real implementation, this would navigate to category selection
                            //         // For now, let's just set a dummy value
                            //         onChange("Food & Drinks");
                            //     }}>
                            //     <Text style={styles.selectButtonText}>
                            //         {value || "Category"}
                            //     </Text>
                            //     <ChevronRight size={16} color={colors.text} />
                            // </TouchableOpacity>
                            <Select
                                selectedValue={value}
                                onValueChange={onChange}>
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
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.name}
                                                label={category.name}
                                                value={category.name}
                                            />
                                        ))}
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
                            // <TouchableOpacity
                            //     style={styles.selectButton}
                            //     onPress={() => {
                            //         // Toggle between None and Weekly as an example
                            //         onChange(
                            //             value === "None" ? "Weekly" : "None"
                            //         );
                            //     }}>
                            //     <Text style={styles.selectButtonText}>
                            //         {value}
                            //     </Text>
                            //     <ChevronDown size={16} color={colors.text} />
                            // </TouchableOpacity>
                            <Select
                                selectedValue={value}
                                onValueChange={onChange}>
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
                        onPress={() => {
                            // This would open the image picker
                            // and update the form value with the selected image
                        }}>
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <Button
                    title="Add Transaction"
                    onPress={handleSubmit(onSubmit)}
                    style={styles.addButton}
                />
            </ScrollView>

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
});
