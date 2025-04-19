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
import { z } from "zod";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletSchema } from "@/libs/validation";
import { Wallpaper } from "lucide-react-native";
import { db } from "@/service/database";
import Button from "@/components/ui/Button";
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
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem,
} from "@/components/ui/select";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/ui/icon";

export default function NewWalletScreen() {
    const router = useRouter();

    // Wallet store
    const addWallet = useWalletStore((state) => state.addWallet);
    const isWalletLoading = useWalletStore((state) => state.isLoading);
    const walletError = useWalletStore((state) => state.error);

    // Category store - use categories from the store instead of loading from database
    const categories = useCategoryStore((state) => state.categories);
    const isCategoriesLoading = useCategoryStore((state) => state.isLoading);

    const [formSubmitting, setFormSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<z.infer<typeof WalletSchema>>({
        resolver: zodResolver(WalletSchema),
        defaultValues: {
            name: "",
            init_amount: 0,
            currency: "vnd",
            visible_category: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof WalletSchema>) => {
        console.log("Form data:", data);

        try {
            setFormSubmitting(true);

            // Convert to wallet format for store
            const walletData = {
                name: data.name,
                balance: data.init_amount,
                currency: data.currency,
            };

            // Add wallet through store (which updates database)
            const result = await addWallet(walletData);

            if (result) {
                // Navigate back to wallet list on success
                router.push("/(tabs)/wallet");
            }
        } catch (err) {
            console.error("Error creating wallet:", err);
        } finally {
            setFormSubmitting(false);
        }
    };

    // Combined loading state
    const isLoading = isWalletLoading || isCategoriesLoading || formSubmitting;

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
                <Text style={styles.title}>New Wallet</Text>
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
                    title={isLoading ? "Creating..." : "Create Wallet"}
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
