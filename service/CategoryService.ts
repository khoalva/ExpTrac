import { db } from "./database";
import * as Sentry from "@sentry/react-native";

interface Category {
    name: string;
}

class CategoryService {
    private static instance: CategoryService;

    private constructor() {}

    public static getInstance(): CategoryService {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService();
        }
        return CategoryService.instance;
    }

    public async createCategory(name: string): Promise<boolean> {
        try {
            console.log(`Attempting to create category: ${name}`);

            // First check if category already exists
            const existingCategory = await this.getCategoryByName(name);
            if (existingCategory) {
                console.log(
                    `Category ${name} already exists, skipping creation`
                );
                return true; // Return true to indicate "success" even though we didn't create it
            }

            console.log(
                `Category ${name} does not exist, creating new category`
            );

            // If we get here, category doesn't exist, so create it
            await db.executeParameterizedQuery(
                "INSERT INTO category (name) VALUES (?)",
                [name]
            );

            // Verify the category was created
            const verifyCategory = await this.getCategoryByName(name);
            if (verifyCategory) {
                console.log(
                    `Successfully created and verified category: ${name}`
                );
                return true;
            } else {
                console.error(`Failed to verify creation of category: ${name}`);
                return false;
            }
        } catch (error) {
            console.error(`Error creating category ${name}:`, error);
            Sentry.captureException(error, {
                tags: {
                    service: "CategoryService",
                    operation: "createCategory",
                },
                extra: {
                    categoryName: name,
                },
            });
            throw error;
        }
    }

    public async getAllCategories(): Promise<Category[]> {
        try {
            const results = await db.executeQuery<Category>(
                "SELECT name FROM category ORDER BY name"
            );
            return results;
        } catch (error) {
            console.error("Error fetching categories:", error);
            Sentry.captureException(error, {
                tags: {
                    service: "CategoryService",
                    operation: "getAllCategories",
                },
            });
            throw error;
        }
    }

    public async updateCategory(
        oldName: string,
        newName: string
    ): Promise<boolean> {
        try {
            await db.executeParameterizedQuery(
                "UPDATE category SET name = ? WHERE name = ?",
                [newName, oldName]
            );

            // Also update all transactions that use this category
            await db.executeParameterizedQuery(
                "UPDATE transaction_log SET category = ? WHERE category = ?",
                [newName, oldName]
            );

            return true;
        } catch (error) {
            console.error(`Error updating category ${oldName}:`, error);
            Sentry.captureException(error, {
                tags: {
                    service: "CategoryService",
                    operation: "updateCategory",
                },
                extra: {
                    oldName,
                    newName,
                },
            });
            throw error;
        }
    }

    public async deleteCategory(name: string): Promise<boolean> {
        try {
            // Check if category is used in transactions
            const transactionsWithCategory =
                await db.executeParameterizedQuery<{ count: number }>(
                    "SELECT COUNT(*) as count FROM transaction_log WHERE category = ?",
                    [name]
                );

            if (transactionsWithCategory[0]?.count > 0) {
                throw new Error(
                    "Cannot delete category that is used in transactions"
                );
            }

            await db.executeParameterizedQuery(
                "DELETE FROM category WHERE name = ?",
                [name]
            );
            return true;
        } catch (error) {
            console.error(`Error deleting category ${name}:`, error);
            Sentry.captureException(error, {
                tags: {
                    service: "CategoryService",
                    operation: "deleteCategory",
                },
                extra: {
                    categoryName: name,
                },
            });
            throw error;
        }
    }

    public async getCategoryByName(name: string): Promise<Category | null> {
        try {
            console.log(`Looking for category with name: ${name}`);
            const results = await db.executeParameterizedQuery<Category>(
                "SELECT name FROM category WHERE name = ?",
                [name]
            );
            console.log(`Query results for ${name}:`, results);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error(`Error fetching category ${name}:`, error);
            Sentry.captureException(error, {
                tags: {
                    service: "CategoryService",
                    operation: "getCategoryByName",
                },
                extra: {
                    categoryName: name,
                },
            });
            throw error;
        }
    }
}

export const categoryService = CategoryService.getInstance();
export default categoryService;
