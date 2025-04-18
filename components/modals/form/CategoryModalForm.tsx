import Modal from "@/components/ui/Modal";
import { Button, ButtonText } from "@/components/ui/button/index";
import { useCategoryStore } from "@/stores/categoryStore";
import { Text, TextInput, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { colors } from "@/constants/Colors";
import { CategorySchema } from "@/libs/validation";

type CategoryFormProps = {
    isOpen: boolean;
    onClose: () => void;
    editCategory?: string | null; // Changed to just use the category name
};

export default function CategoryModalForm({
    isOpen,
    onClose,
    editCategory = null,
}: CategoryFormProps) {
    const addCategory = useCategoryStore((state) => state.addCategory);
    const updateCategory = useCategoryStore((state) => state.updateCategory);

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

    useEffect(() => {
        // Reset form with category name or empty string
        reset({ name: editCategory || "" });
    }, [editCategory, reset, isOpen]);

    const onSubmit = async (data: z.infer<typeof CategorySchema>) => {
        console.log("Form submitted with data:", data);
        try {
            if (editCategory) {
                // Use old name and new name for updating
                updateCategory(editCategory, data.name);
            } else {
                addCategory(data.name);
            }
            reset();
            onClose();
        } catch (error) {
            console.error("Failed to save category:", error);
        }
    };

    return (
        <Modal visible={isOpen} onClose={onClose}>
            <View className="w-[90%] p-4 rounded-xl bg-white">
                <Text className="text-xl font-bold mb-4 text-center">
                    {editCategory ? "Edit Category" : "Add New Category"}
                </Text>

                <View className="mb-4">
                    <Text className="mb-1 text-gray-700">Category Name</Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-md p-2"
                                placeholder="Enter category name"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                autoFocus
                            />
                        )}
                    />
                    {errors.name && (
                        <Text className="text-red-500 text-sm mt-1">
                            {errors.name.message}
                        </Text>
                    )}
                </View>

                <View className="flex-row justify-end gap-2 mt-2">
                    <Button className="bg-gray-200" onPress={onClose}>
                        <ButtonText className="text-gray-800">
                            Cancel
                        </ButtonText>
                    </Button>

                    <Button
                        className="bg-[#5D4275]"
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}>
                        <ButtonText className="text-white">
                            {editCategory ? "Update" : "Add"}
                        </ButtonText>
                    </Button>
                </View>
            </View>
        </Modal>
    );
}
