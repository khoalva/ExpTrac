import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import { useCategoryStore } from "@/stores/categoryStore";
import { Text, TextInput, View, ActivityIndicator } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Card } from "@/components/custom/Card";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { colors } from "@/constants/Colors";
import { CategorySchema } from "@/libs/validation";
import { db } from "@/service/database";
import categoryService from "@/service/CategoryService";
import {
    createCategory as createCategoryOnline,
    updateCategory as updateCategoryOnline,
} from "@/service/online/CategoryService";

type CategoryFormProps = {
    isOpen: boolean;
    onClose: () => void;
    editCategory?: string | null; // Changed to just use the category name
};

const testDatabaseConnection = async () => {
    try {
        console.log("=== TESTING DATABASE CONNECTION ===");

        // Initialize database
        await db.initDatabase();
        console.log("Database initialized");

        // Test category creation
        console.log("Testing category creation...");
        try {
            const testCategoryName =
                "TestCategory" + Math.floor(Math.random() * 1000);
            console.log(
                `Attempting to create test category: ${testCategoryName}`
            );

            // First check if the table exists
            try {
                const tables = await db.executeQuery(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='category'"
                );
                console.log("Tables found:", tables);
            } catch (e) {
                console.error("Error checking tables:", e);
            }

            const result = await categoryService.createCategory(
                testCategoryName
            );
            console.log(`Category creation result: ${result}`);

            // Verify category was created
            const category = await categoryService.getCategoryByName(
                testCategoryName
            );
            console.log("Retrieved category:", category);

            // Get all categories
            const allCats = await categoryService.getAllCategories();
            console.log("All categories after creation:", allCats);

            // Delete test category if it exists
            if (category) {
                await categoryService.deleteCategory(testCategoryName);
                console.log(
                    `Successfully deleted category: ${testCategoryName}`
                );

                // Verify deletion
                const deletedCategory = await categoryService.getCategoryByName(
                    testCategoryName
                );
                console.log(
                    "Category after deletion (should be null):",
                    deletedCategory
                );
            }
        } catch (e) {
            console.error("Category test failed:", e);
        }

        // Test getting all categories
        console.log("Testing getAllCategories...");
        const allCategories = await categoryService.getAllCategories();
        console.log("All categories:", allCategories);

        console.log("=== DATABASE TEST COMPLETED ===");
    } catch (e) {
        console.error("Database test failed:", e);
    }
};

export default function CategoryModalForm({
    isOpen,
    onClose,
    editCategory = null,
}: CategoryFormProps) {
    const addCategory = useCategoryStore((state) => state.addCategory);
    const updateCategory = useCategoryStore((state) => state.updateCategory);
    const isLoading = useCategoryStore((state) => state.isLoading);
    const error = useCategoryStore((state) => state.error);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<z.infer<typeof CategorySchema>>({
        resolver: zodResolver(CategorySchema),
        defaultValues: {
            name: editCategory || "", // Use the name directly
        },
    });

    // Test database connection when the component mounts
    // useEffect(() => {
    //     const testDatabase = async () => {
    //         await testDatabaseConnection();
    //     };
    //     testDatabase();
    // }, []);

    useEffect(() => {
        // Reset form with category name or empty string
        reset({ name: editCategory || "" });
    }, [editCategory, reset, isOpen]);

    const onSubmit = async (data: z.infer<typeof CategorySchema>) => {
        console.log("Form submitted with data:", data);
        try {
            if (editCategory) {
                // UPDATE OPERATION - Local first, then online sync
                console.log(
                    `Updating category "${editCategory}" to "${data.name}" locally...`
                );
                await updateCategory(editCategory, data.name).then(() => {
                    reset();
                    onClose();
                });
                console.log(
                    `Successfully updated category "${editCategory}" to "${data.name}" in local database`
                );

                // Check internet connectivity and sync with online database
                const netInfo = await NetInfo.fetch();
                const isConnected =
                    netInfo.isConnected && netInfo.isInternetReachable;

                if (isConnected) {
                    try {
                        console.log(
                            `Syncing category update with online database...`
                        );
                        await updateCategoryOnline(editCategory, data.name);
                        console.log(
                            `Successfully synced category update with online database`
                        );
                    } catch (onlineError) {
                        // Online operation failed, but local succeeded
                        console.warn(
                            `Failed to sync category update with online database:`,
                            onlineError
                        );
                        // Note: You might want to queue this for retry later
                    }
                } else {
                    console.log(
                        "No internet connection - category update will sync when online"
                    );
                }
            } else {
                // CREATE OPERATION - Local first, then online sync
                console.log(`Creating category "${data.name}" locally...`);
                await addCategory(data.name);
                console.log(
                    `Successfully created category "${data.name}" in local database`
                );

                // Check internet connectivity and sync with online database
                const netInfo = await NetInfo.fetch();
                const isConnected =
                    netInfo.isConnected && netInfo.isInternetReachable;

                if (isConnected) {
                    try {
                        console.log(
                            `Syncing category creation with online database...`
                        );
                        await createCategoryOnline(data.name);
                        console.log(
                            `Successfully synced category creation with online database`
                        );
                    } catch (onlineError) {
                        // Online operation failed, but local succeeded
                        console.warn(
                            `Failed to sync category creation with online database:`,
                            onlineError
                        );
                        // Note: You might want to queue this for retry later
                    }
                } else {
                    console.log(
                        "No internet connection - category creation will sync when online"
                    );
                }
            }
        } catch (localError) {
            // Local operation failed - this is critical
            console.error(
                "Failed to save category to local database:",
                localError
            );
            // The error will be displayed in the UI via the error state
        }
    };

    return (
        <Modal isOpen={isOpen}>
            <ModalBackdrop />
            <ModalContent>
                <View className="w-[90%] p-4 rounded-xl bg-white">
                    <Text className="text-xl font-bold mb-4 text-center">
                        {editCategory ? "Edit Category" : "Add New Category"}
                    </Text>

                    <View className="mb-4">
                        <Text className="mb-1 text-gray-700">
                            Category Name
                        </Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <TextInput
                                    className="border border-gray-300 rounded-md p-2"
                                    placeholder="Enter category name"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    autoFocus
                                    editable={!isLoading}
                                />
                            )}
                        />
                        {errors.name && (
                            <Text className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </Text>
                        )}
                    </View>

                    {error && (
                        <View className="mb-3">
                            <Text className="text-red-500 text-sm">
                                {error}
                            </Text>
                        </View>
                    )}

                    <View className="flex-row justify-end gap-2 mt-2">
                        <Button
                            className="bg-gray-200"
                            onPress={onClose}
                            disabled={isLoading}>
                            <ButtonText className="text-gray-800">
                                Cancel
                            </ButtonText>
                        </Button>

                        <Button
                            className="bg-[#5D4275]"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading || isSubmitting}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <ButtonText className="text-white">
                                    {editCategory ? "Update" : "Add"}
                                </ButtonText>
                            )}
                        </Button>
                    </View>
                </View>
            </ModalContent>
        </Modal>
    );
}
