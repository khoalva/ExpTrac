import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category } from "@/types";

interface CategoryState {
    categories: Category[];
    selectedCategoryName: string | null;

    addCategory: (name: string) => void;
    updateCategory: (oldName: string, newName: string) => void;
    deleteCategory: (name: string) => void;
    getCategoryByName: (name: string) => Category | undefined;
    selectCategory: (name: string | null) => void;

    initializeDefaultCategory: () => void;

    resetCategories: () => void;
}

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set, get) => ({
            categories: [
                { name: "Food" },
                { name: "Transportation" },
                { name: "Entertainment" },
                { name: "Shopping" },
            ],
            selectedCategoryName: null,

            addCategory: (name) => {
                set((state) => {
                    const exists = state.categories.some(
                        (category) => category.name === name
                    );
                    if (exists) {
                        console.warn(`Category "${name}" already exists.`);
                        return state;
                    }
                    return {
                        categories: [...state.categories, { name }],
                        selectedCategoryName:
                            state.selectedCategoryName || name,
                    };
                });
            },

            updateCategory: (oldName, newName) => {
                set((state) => ({
                    categories: state.categories.map((category) =>
                        category.name === oldName ? { name: newName } : category
                    ),
                }));
            },

            deleteCategory: (name) => {
                set((state) => ({
                    categories: state.categories.filter(
                        (category) => category.name !== name
                    ),
                }));
            },

            getCategoryByName: (name) => {
                return get().categories.find(
                    (category) => category.name === name
                );
            },

            selectCategory: (name) => {
                set({ selectedCategoryName: name });
            },

            initializeDefaultCategory: () => {
                const defaultCategory = {
                    name: "Food & Drinks",
                };
                const { categories } = get();
                if (categories.length === 0) {
                    set({ categories: [defaultCategory] });
                }
            },

            resetCategories: () => {
                set({ categories: [], selectedCategoryName: null });
            },
        }),
        {
            name: "exptrac-categories-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
