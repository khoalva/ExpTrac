import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Wallet } from "@/types";
import { colors } from "@/constants/Colors";
import { walletService } from "@/service/WalletService";
import { db } from "@/service/database";

interface WalletState {
    wallets: Wallet[];
    selectedWalletId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadWallets: () => Promise<void>;
    addWallet: (wallet: Omit<Wallet, "id">) => Promise<string>;
    updateWallet: (id: string, wallet: Partial<Wallet>) => Promise<void>;
    deleteWallet: (id: string) => Promise<void>;
    getWalletById: (id: string) => Wallet | undefined;
    selectWallet: (id: string | null) => void;
    getSelectedWallet: () => Wallet | undefined;

    // Statistics
    getTotalBalance: () => Promise<number>;

    // Initialize with default wallet
    initializeDefaultWallet: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            wallets: [],
            selectedWalletId: null,
            isLoading: false,
            error: null,

            loadWallets: async () => {
                try {
                    set({ isLoading: true, error: null });

                    // Initialize database if not already
                    await db.initDatabase();

                    // Get wallets from database
                    const dbWallets = await walletService.getAllWallets();

                    // Convert to Wallet[] format and calculate balances
                    const wallets: Wallet[] = [];

                    for (const dbWallet of dbWallets) {
                        const balance = await walletService.getWalletBalance(
                            dbWallet.name
                        );

                        wallets.push({
                            id: dbWallet.name, // Use name as id
                            name: dbWallet.name,
                            init_amount: balance,
                            currency: dbWallet.currency,
                            visible_category: dbWallet.visible_category,
                        });
                    }

                    set({
                        wallets,
                        isLoading: false,
                        // Select first wallet if none is selected
                        selectedWalletId:
                            get().selectedWalletId ||
                            (wallets.length > 0 ? wallets[0].id : null),
                    });

                    // If no wallets exist, create default wallet
                    // if (wallets.length === 0) {
                    //     await get().initializeDefaultWallet();
                    // }
                } catch (error) {
                    console.error("Error loading wallets:", error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error loading wallets",
                        isLoading: false,
                    });
                }
            },

            addWallet: async (wallet) => {
                try {
                    set({ isLoading: true, error: null });

                    // Check if wallet with this name already exists
                    const existingWallet = await walletService.getWalletByName(
                        wallet.name
                    );
                    if (existingWallet) {
                        throw new Error(
                            `Wallet with name "${wallet.name}" already exists`
                        );
                    }

                    // Format for database
                    const dbWallet = {
                        name: wallet.name,
                        init_amount: wallet.init_amount,
                        currency: wallet.currency,
                        visible_category: "",
                    };

                    // Add to database
                    await walletService.createWallet(dbWallet);

                    // Update state
                    const id = wallet.name; // Use name as ID
                    const newWallet = { ...wallet, id };

                    set((state) => ({
                        wallets: [...state.wallets, newWallet],
                        selectedWalletId: state.selectedWalletId || id,
                        isLoading: false,
                    }));

                    return id;
                } catch (error) {
                    console.error("Error creating wallet:", error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error creating wallet",
                        isLoading: false,
                    });
                    return "";
                }
            },

            updateWallet: async (id, wallet) => {
                try {
                    set({ isLoading: true, error: null });

                    // Find existing wallet
                    const existingWallet = get().getWalletById(id);
                    if (!existingWallet) {
                        throw new Error(`Wallet with id ${id} not found`);
                    }

                    // Format for database
                    const dbWallet: Partial<{
                        name: string;
                        init_amount: number;
                        currency: string;
                        visible_category: string;
                    }> = {};

                    if (wallet.name) dbWallet.name = wallet.name;
                    if (wallet.init_amount !== undefined)
                        dbWallet.init_amount = wallet.init_amount;
                    if (wallet.currency) dbWallet.currency = wallet.currency;
                    if (wallet.visible_category)
                        dbWallet.visible_category = wallet.visible_category;

                    // Update in database
                    await walletService.updateWallet(
                        existingWallet.name,
                        dbWallet
                    );

                    // If name changed, we need to reload wallets
                    if (wallet.name && wallet.name !== existingWallet.name) {
                        await get().loadWallets();
                    } else {
                        // Just update the state
                        set((state) => ({
                            wallets: state.wallets.map((w) =>
                                w.id === id ? { ...w, ...wallet } : w
                            ),
                            isLoading: false,
                        }));
                    }
                } catch (error) {
                    console.error(`Error updating wallet ${id}:`, error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error updating wallet",
                        isLoading: false,
                    });
                }
            },

            deleteWallet: async (id) => {
                try {
                    set({ isLoading: true, error: null });

                    // Find wallet name
                    const wallet = get().getWalletById(id);
                    if (!wallet) {
                        throw new Error(`Wallet with id ${id} not found`);
                    }

                    // Delete from database
                    await walletService.deleteWallet(wallet.name);

                    // Update state
                    set((state) => {
                        const newWallets = state.wallets.filter(
                            (w) => w.id !== id
                        );
                        const newSelectedId =
                            state.selectedWalletId === id
                                ? newWallets.length > 0
                                    ? newWallets[0].id
                                    : null
                                : state.selectedWalletId;

                        return {
                            wallets: newWallets,
                            selectedWalletId: newSelectedId,
                            isLoading: false,
                        };
                    });
                } catch (error) {
                    console.error(`Error deleting wallet ${id}:`, error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error deleting wallet",
                        isLoading: false,
                    });
                }
            },

            getWalletById: (id) => {
                return get().wallets.find((w) => w.id === id);
            },

            selectWallet: (id) => {
                set({ selectedWalletId: id });
            },

            getSelectedWallet: () => {
                const { selectedWalletId, wallets } = get();
                if (!selectedWalletId && wallets.length > 0) {
                    // Auto-select first wallet if none is selected
                    set({ selectedWalletId: wallets[0].id });
                    return wallets[0];
                }
                return wallets.find((w) => w.id === selectedWalletId);
            },

            getTotalBalance: async () => {
                try {
                    return await walletService.getTotalBalance();
                } catch (error) {
                    console.error("Error calculating total balance:", error);
                    return get().wallets.reduce(
                        (sum, wallet) => sum + wallet.init_amount,
                        0
                    );
                }
            },

            // Initialize default wallet if none exist
            initializeDefaultWallet: async () => {
                try {
                    set({ isLoading: true, error: null });

                    // Check if any wallets exist
                    const dbWallets = await walletService.getAllWallets();

                    if (dbWallets.length === 0) {
                        const defaultWallet: Omit<Wallet, "id"> = {
                            name: "My Wallet",
                            init_amount: 1500000,
                            currency: "VND",
                            visible_category: "default",
                        };

                        // Add to database
                        await walletService.createWallet({
                            name: defaultWallet.name,
                            init_amount: defaultWallet.init_amount,
                            currency: defaultWallet.currency,
                            visible_category: "",
                        });

                        // Reload wallets
                        await get().loadWallets();
                    }

                    set({ isLoading: false });
                } catch (error) {
                    console.error("Error initializing default wallet:", error);
                    set({
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error initializing wallet",
                        isLoading: false,
                    });
                }
            },
        }),
        {
            name: "exptrac-wallets-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
