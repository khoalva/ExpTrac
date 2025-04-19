import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useCategoryStore } from "@/stores/categoryStore";
import Avatar from "@/components/ui/Avatar";
import { Button, ButtonText } from "@/components/ui/button/index";
import CategoryModalForm from "@/components/modals/form/CategoryModalForm";
import { db } from "@/service/database";

export default function CategoryScreen() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const categories = useCategoryStore((state) => state.categories);
    const deleteCategory = useCategoryStore((state) => state.deleteCategory);
    const isLoading = useCategoryStore((state) => state.isLoading);
    const error = useCategoryStore((state) => state.error);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);

    // Load categories when component mounts

    const openAddModal = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (categoryName: string) => {
        setEditingCategory(categoryName);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = async (categoryName: string) => {
        try {
            await deleteCategory(categoryName);
        } catch (err) {
            console.error(`Error deleting category ${categoryName}:`, err);
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
                <View className="bg-primaryLight rounded-xl p-4">
                    <Text className="text-textSecondary mb-1 font-bold text-2xl">
                        My Categories
                    </Text>
                </View>

                <View className="flex flex-row justify-end items-center mt-3">
                    <View className="flex flex-row justify-between gap-2 items-center">
                        <Text>Add New Category</Text>
                        <Button
                            className="bg-[#5D4275] rounded-xl flex justify-center items-center w-[30px] h-[30px] active:bg-[#5D4275]/90 p-0"
                            size="md"
                            onPress={openAddModal}>
                            <ButtonText className="text-white text-xl">
                                +
                            </ButtonText>
                        </Button>
                    </View>
                </View>

                {error && (
                    <View className="mt-2 p-2 bg-red-100 rounded-lg">
                        <Text className="text-red-500">{error}</Text>
                    </View>
                )}

                {isLoading ? (
                    <View className="flex items-center justify-center py-8">
                        <ActivityIndicator
                            size="large"
                            color={colors.primary}
                        />
                        <Text className="mt-2 text-textSecondary">
                            Loading categories...
                        </Text>
                    </View>
                ) : categories.length === 0 ? (
                    <View className="mt-4 p-4 bg-slate-100 rounded-xl">
                        <Text className="text-center text-textSecondary">
                            No categories found. Add a category to get started.
                        </Text>
                    </View>
                ) : (
                    categories.map((category) => (
                        <View
                            key={category.name}
                            className="flex flex-row justify-between items-center mt-2 gap-2">
                            <View className="p-4 bg-slate-300 rounded-xl flex items-center justify-center flex-1">
                                <Text>{category.name}</Text>
                            </View>
                            <View className="flex flex-col">
                                <Button
                                    className="p-1 border-none bg-transparent"
                                    size="sm"
                                    onPress={() =>
                                        openEditModal(category.name)
                                    }>
                                    <ButtonText className="text-black">
                                        Edit
                                    </ButtonText>
                                </Button>
                                <Button
                                    className="p-1 border-none bg-transparent"
                                    size="sm"
                                    onPress={() =>
                                        handleDeleteCategory(category.name)
                                    }>
                                    <ButtonText className="text-red-500">
                                        Delete
                                    </ButtonText>
                                </Button>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <CategoryModalForm
                isOpen={isModalOpen}
                onClose={closeModal}
                editCategory={editingCategory}
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
