import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

class DatabaseService {
    private db: SQLiteDatabase | null = null;
    private static instance: DatabaseService;
    private initialized: boolean = false;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async initDatabase(): Promise<void> {
        if (this.initialized && this.db) {
            console.log(
                "Database already initialized, reusing existing connection"
            );
            return;
        }

        try {
            // Check if database exists in FileSystem
            const dbName = "storage.db";
            const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
            const fileInfo = await FileSystem.getInfoAsync(dbPath);

            if (!fileInfo.exists) {
                console.log(
                    "Database file does not exist, copying from assets..."
                );

                // Ensure directory exists
                await FileSystem.makeDirectoryAsync(
                    `${FileSystem.documentDirectory}SQLite`,
                    { intermediates: true }
                );

                // Copy database file from assets
                const asset = Asset.fromModule(require("../assets/storage.db"));
                await asset.downloadAsync();

                if (asset.localUri) {
                    await FileSystem.copyAsync({
                        from: asset.localUri,
                        to: dbPath,
                    });
                    console.log("Database copied from assets to:", dbPath);
                } else {
                    console.error(
                        "Failed to download asset, localUri is undefined"
                    );
                }
            } else {
                console.log("Using existing database file at:", dbPath);
            }

            // Open the database using the new Expo SQLite API
            this.db = openDatabaseSync("storage.db");
            console.log("Database initialized successfully");

            // Test the database connection with a simple query
            try {
                await this.testDatabaseConnection();
                this.initialized = true;
            } catch (e) {
                console.error("Database connection test failed:", e);
                throw e;
            }
        } catch (error) {
            console.error("Error initializing database:", error);
            throw error;
        }
    }

    private async testDatabaseConnection(): Promise<void> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            // For execAsync, pass SQL statement as a string directly
            const result = await this.db.getAllAsync("SELECT sqlite_version()");
            console.log("Database connection test successful:", result);
        } catch (error) {
            console.error("Database test query failed:", error);
            throw error;
        }
    }

    public getDatabase(): SQLiteDatabase {
        if (!this.db) {
            throw new Error(
                "Database not initialized. Call initDatabase() first."
            );
        }
        return this.db;
    }

    public async executeQuery<T>(query: string): Promise<T[]> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            const result = await this.db.getAllAsync<T>(query);
            return result;
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    public async executeParameterizedQuery<T>(
        query: string,
        params: (string | number | boolean | null)[]
    ): Promise<T[]> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            const result = await this.db.getAllAsync<T>(query, params);
            return result;
        } catch (error) {
            console.error("Error executing parameterized query:", error);
            throw error;
        }
    }

    public async executeTransaction(
        queries: { sql: string; args?: any[] }[]
    ): Promise<void> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            await this.db.withTransactionAsync(async () => {
                for (const query of queries) {
                    await this.db!.runAsync(query.sql, query.args || []);
                }
            });
        } catch (error) {
            console.error("Transaction error:", error);
            throw error;
        }
    }

    // Helper method to check if a table exists
    public async tableExists(tableName: string): Promise<boolean> {
        try {
            const result = await this.executeParameterizedQuery<{
                name: string;
            }>("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [
                tableName,
            ]);
            return result.length > 0;
        } catch (error) {
            console.error(
                `Error checking if table ${tableName} exists:`,
                error
            );
            return false;
        }
    }

    // Get a single result
    public async getFirstAsync<T>(
        query: string,
        params: (string | number | boolean | null)[]
    ): Promise<T | null> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            const result = await this.db.getFirstAsync<T>(query, params);
            return result;
        } catch (error) {
            console.error("Error executing single query:", error);
            throw error;
        }
    }

    // Run a non-query command
    public async runAsync(
        query: string,
        params: (string | number | boolean | null)[]
    ): Promise<void> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            await this.db.runAsync(query, params);
        } catch (error) {
            console.error("Error running query:", error);
            throw error;
        }
    }

    // Execute multiple queries - Fixed for proper format
    public async execAsync(queries: string[]): Promise<any[]> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            const result = (await this.db.execAsync(queries.join(";"))) as any;
            return result;
        } catch (error) {
            console.error("Error executing multiple queries:", error);
            throw error;
        }
    }

    // Clear the database after logout
    public async clearDatabase(): Promise<void> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            console.log("Starting database cleanup...");

            // Delete data in the correct order to respect foreign key constraints
            // 1. First delete records that have RESTRICT foreign keys
            await this.db.runAsync("DELETE FROM transaction_log", []);
            console.log("Cleared transaction_log table");

            await this.db.runAsync("DELETE FROM subscription", []);
            console.log("Cleared subscription table");

            // 2. Then delete records that reference other tables with CASCADE/SET NULL
            await this.db.runAsync("DELETE FROM budget", []);
            console.log("Cleared budget table");

            await this.db.runAsync("DELETE FROM wallet", []);
            console.log("Cleared wallet table");

            // 3. Delete categories (no longer referenced)
            await this.db.runAsync("DELETE FROM category", []);
            console.log("Cleared category table");

            // 4. Delete user profile (independent table)
            await this.db.runAsync("DELETE FROM user_profile", []);
            console.log("Cleared user_profile table");

            console.log("Database cleanup completed successfully");
        } catch (error) {
            console.error("Error clearing database:", error);
            throw error;
        }
    }

    // Alternative method: Clear database by disabling foreign keys temporarily
    public async clearDatabaseFast(): Promise<void> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }

        try {
            console.log("Starting fast database cleanup...");

            await this.db.withTransactionAsync(async () => {
                // Disable foreign key constraints temporarily
                await this.db!.runAsync("PRAGMA foreign_keys = OFF", []);

                // Delete all data from all tables
                await this.db!.runAsync("DELETE FROM transaction_log", []);
                await this.db!.runAsync("DELETE FROM subscription", []);
                await this.db!.runAsync("DELETE FROM budget", []);
                await this.db!.runAsync("DELETE FROM wallet", []);
                await this.db!.runAsync("DELETE FROM category", []);
                await this.db!.runAsync("DELETE FROM user_profile", []);

                // Re-enable foreign key constraints
                await this.db!.runAsync("PRAGMA foreign_keys = ON", []);
            });

            console.log("Fast database cleanup completed successfully");
        } catch (error) {
            console.error("Error in fast database cleanup:", error);
            throw error;
        }
    }
}

export const db = DatabaseService.getInstance();
export default db;
