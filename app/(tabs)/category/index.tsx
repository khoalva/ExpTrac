import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useCategoryStore } from "@/stores/categoryStore";
import Avatar from "@/components/ui/Avatar";
import { Button, ButtonText } from "@/components/ui/button/index";
import CategoryModalForm from "@/components/modals/form/CategoryModalForm";

export default function CategoryScreen() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const categories = useCategoryStore((state) => state.categories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);

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

    const deleteCategory = useCategoryStore((state) => state.deleteCategory);

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

                <View className="flex flex-row justify-end items-center">
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

                {categories.map((category) => (
                    <View
                        key={category.name}
                        className="flex flex-row  justify-between items-center mt-2 gap-2">
                        <View className="p-4 bg-slate-300 rounded-xl flex items-center justify-center flex-1">
                            <Text>{category.name}</Text>
                        </View>
                        <View className="flex flex-col">
                            <Button
                                className="p-1 border-none bg-transparent"
                                size="sm"
                                onPress={() => openEditModal(category.name)}>
                                <ButtonText className="text-black">
                                    Edit
                                </ButtonText>
                            </Button>
                            <Button
                                className="p-1 border-none bg-transparent"
                                size="sm"
                                onPress={() => deleteCategory(category.name)}>
                                <ButtonText className="text-red-500">
                                    Delete
                                </ButtonText>
                            </Button>
                        </View>
                    </View>
                ))}
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
