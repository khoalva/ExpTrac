import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category } from "@/types";
import { categoryService } from "@/service/CategoryService";
import { db } from "@/service/database";

interface CategoryState {
    categories: Category[];
    selectedCategoryName: string | null;
    isLoading: boolean;
    error: string | null;

    loadCategories: () => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    updateCategory: (oldName: string, newName: string) => Promise<void>;
    deleteCategory: (name: string) => Promise<void>;
    getCategoryByName: (name: string) => Category | undefined;
    selectCategory: (name: string | null) => void;

    initializeDefaultCategory: () => Promise<void>;

    resetCategories: () => void;
}

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set, get) => ({
            categories: [],
            selectedCategoryName: null,
            isLoading: false,
            error: null,

            loadCategories: async () => {
                try {
                    set({ isLoading: true, error: null });

                    // Initialize database if not already
                    await db.initDatabase();

                    // Get categories from database
                    const dbCategories =
                        await categoryService.getAllCategories();

                    // Convert to Category[] format
                    const categories = dbCategories.map((category) => ({
                        name: category.name,
                    }));

                    set({ categories, isLoading: false });

                    // If no categories exist, create defaults
                    // if (categories.length === 0) {
                    //     await get().initializeDefaultCategory();
                    // }
                } catch (error) {
                    console.error("Error loading categories:", error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error loading categories",
                        isLoading: false,
                    });
                }
            },

            addCategory: async (name) => {
                try {
                    set({ isLoading: true, error: null });

                    // Check if category exists in store
                    const existsInStore = get().categories.some(
                        (category) => category.name === name
                    );

                    if (existsInStore) {
                        set({
                            error: `Category "${name}" already exists.`,
                            isLoading: false,
                        });
                        return;
                    }

                    // Check if category exists in database
                    const existingCategory =
                        await categoryService.getCategoryByName(name);
                    if (existingCategory) {
                        set({
                            error: `Category "${name}" already exists in database.`,
                            isLoading: false,
                        });
                        return;
                    }

                    // Add to database
                    await categoryService.createCategory(name);

                    // Update state
                    set((state) => ({
                        categories: [...state.categories, { name }],
                        selectedCategoryName:
                            state.selectedCategoryName || name,
                        isLoading: false,
                    }));
                } catch (error) {
                    console.error(`Error creating category ${name}:`, error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error creating category",
                        isLoading: false,
                    });
                }
            },

            updateCategory: async (oldName, newName) => {
                try {
                    set({ isLoading: true, error: null });

                    // Check if new name already exists (not equal to old name)
                    if (oldName !== newName) {
                        const existsInStore = get().categories.some(
                            (category) => category.name === newName
                        );

                        if (existsInStore) {
                            set({
                                error: `Category "${newName}" already exists.`,
                                isLoading: false,
                            });
                            return;
                        }

                        // Check database
                        const existingCategory =
                            await categoryService.getCategoryByName(newName);
                        if (existingCategory) {
                            set({
                                error: `Category "${newName}" already exists in database.`,
                                isLoading: false,
                            });
                            return;
                        }
                    }

                    // Update in database
                    await categoryService.updateCategory(oldName, newName);

                    // Update state
                    set((state) => ({
                        categories: state.categories.map((category) =>
                            category.name === oldName
                                ? { name: newName }
                                : category
                        ),
                        selectedCategoryName:
                            state.selectedCategoryName === oldName
                                ? newName
                                : state.selectedCategoryName,
                        isLoading: false,
                    }));
                } catch (error) {
                    console.error(`Error updating category ${oldName}:`, error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error updating category",
                        isLoading: false,
                    });
                }
            },

            deleteCategory: async (name) => {
                try {
                    set({ isLoading: true, error: null });

                    // Delete from database
                    await categoryService.deleteCategory(name);

                    // Update state
                    set((state) => ({
                        categories: state.categories.filter(
                            (category) => category.name !== name
                        ),
                        selectedCategoryName:
                            state.selectedCategoryName === name
                                ? state.categories.length > 0
                                    ? state.categories[0].name
                                    : null
                                : state.selectedCategoryName,
                        isLoading: false,
                    }));
                } catch (error) {
                    console.error(`Error deleting category ${name}:`, error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error deleting category",
                        isLoading: false,
                    });
                }
            },

            getCategoryByName: (name) => {
                return get().categories.find(
                    (category) => category.name === name
                );
            },

            selectCategory: (name) => {
                set({ selectedCategoryName: name });
            },

            initializeDefaultCategory: async () => {
                try {
                    set({ isLoading: true, error: null });

                    // Define default categories
                    const defaultCategories = [
                        "Food",
                        "Transportation",
                        "Entertainment",
                        "Shopping",
                    ];

                    // Check if the database already has any categories
                    const existingCategories =
                        await categoryService.getAllCategories();

                    if (existingCategories.length === 0) {
                        console.log("No categories found, creating defaults");

                        // Add each default category
                        for (const categoryName of defaultCategories) {
                            try {
                                await categoryService.createCategory(
                                    categoryName
                                );
                                console.log(
                                    `Created category: ${categoryName}`
                                );
                            } catch (err) {
                                console.error(
                                    `Failed to create category ${categoryName}:`,
                                    err
                                );
                                // Continue with other categories even if one fails
                            }
                        }

                        // Reload categories to update the store
                        const updatedCategories =
                            await categoryService.getAllCategories();
                        set({
                            categories: updatedCategories.map((cat) => ({
                                name: cat.name,
                            })),
                            isLoading: false,
                        });
                    } else {
                        console.log(
                            "Categories already exist, skipping default creation"
                        );
                        set({ isLoading: false });
                    }
                } catch (error) {
                    console.error(
                        "Error initializing default categories:",
                        error
                    );
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error initializing categories",
                        isLoading: false,
                    });
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
