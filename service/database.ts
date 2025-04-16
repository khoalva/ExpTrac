import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

interface Database {
    transaction: (
        callback: (tx: Transaction) => void,
        error?: (error: Error) => void,
        success?: () => void
    ) => void;
}

interface Transaction {
    executeSql: (
        sqlStatement: string,
        args?: (string | number)[],
        success?: (tx: Transaction, resultSet: ResultSet) => void,
        error?: (tx: Transaction, error: Error) => boolean
    ) => void;
}

interface ResultSet {
    insertId: number;
    rowsAffected: number;
    rows: {
        length: number;
        _array: any[];
        item: (index: number) => any;
    };
}

class DatabaseService {
    private db: SQLiteDatabase | null = null;
    private static instance: DatabaseService;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async initDatabase(): Promise<void> {
        try {
            // Check if database exists in FileSystem
            const dbName = "storage.db";
            const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
            const fileInfo = await FileSystem.getInfoAsync(dbPath);

            if (!fileInfo.exists) {
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
                }
            }

            // Open the database
            this.db = openDatabaseSync("storage.db");
            console.log("Database initialized successfully");
        } catch (error) {
            console.error("Error initializing database:", error);
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
        const db = this.getDatabase();
        const result = db.execSync(query);
        // @ts-ignore
        return (result || []) as T[];
    }

    public async executeParameterizedQuery<T>(
        query: string,
        params: (string | number)[]
    ): Promise<T[]> {
        const parameterizedQuery = this.createParameterizedQuery(query, params);
        return this.executeQuery<T>(parameterizedQuery);
    }

    private createParameterizedQuery(
        query: string,
        params: (string | number)[]
    ): string {
        let paramIndex = 0;
        return query.replace(/\?/g, () => {
            const param = params[paramIndex++];
            if (typeof param === "string") {
                return `'${param.replace(/'/g, "''")}'`;
            }
            return param.toString();
        });
    }

    public async executeTransaction<T>(
        queries: { sql: string; params?: (string | number)[] }[]
    ): Promise<T[][]> {
        const results: T[][] = [];

        for (const query of queries) {
            if (query.params) {
                results.push(
                    await this.executeParameterizedQuery<T>(
                        query.sql,
                        query.params
                    )
                );
            } else {
                results.push(await this.executeQuery<T>(query.sql));
            }
        }

        return results;
    }
}

export const db = DatabaseService.getInstance();
export default db;
