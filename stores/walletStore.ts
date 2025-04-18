import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Wallet } from "@/types";
import { colors } from "@/constants/Colors";

interface WalletState {
    wallets: Wallet[];
    selectedWalletId: string | null;

    // Actions
    addWallet: (wallet: Omit<Wallet, "id">) => string;
    updateWallet: (id: string, wallet: Partial<Wallet>) => void;
    deleteWallet: (id: string) => void;
    getWalletById: (id: string) => Wallet | undefined;
    selectWallet: (id: string | null) => void;
    getSelectedWallet: () => Wallet | undefined;

    // Statistics
    getTotalBalance: () => number;

    // Initialize with default wallet
    initializeDefaultWallet: () => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            wallets: [],
            selectedWalletId: null,

            addWallet: (wallet) => {
                const id = Date.now().toString();
                const newWallet = { ...wallet, id };
                set((state) => ({
                    wallets: [...state.wallets, newWallet],
                    selectedWalletId: state.selectedWalletId || id, // Select this wallet if none is selected
                }));
                return id;
            },

            updateWallet: (id, wallet) => {
                set((state) => ({
                    wallets: state.wallets.map((w) =>
                        w.id === id ? { ...w, ...wallet } : w
                    ),
                }));
            },

            deleteWallet: (id) => {
                set((state) => {
                    const newWallets = state.wallets.filter((w) => w.id !== id);
                    const newSelectedId =
                        state.selectedWalletId === id
                            ? newWallets.length > 0
                                ? newWallets[0].id
                                : null
                            : state.selectedWalletId;

                    return {
                        wallets: newWallets,
                        selectedWalletId: newSelectedId,
                    };
                });
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

            getTotalBalance: () => {
                return get().wallets.reduce(
                    (sum, wallet) => sum + wallet.balance,
                    0
                );
            },

            // temporary function to initialize default wallet
            // to be removed later
            initializeDefaultWallet: () => {
                const { wallets } = get();
                if (wallets.length === 0) {
                    const defaultWallet: Omit<Wallet, "id"> = {
                        name: "My Wallet",
                        balance: 1500000,
                        currency: "VND",
                    };
                    const id = get().addWallet(defaultWallet);
                    set({ selectedWalletId: id });
                }
            },
        }),
        {
            name: "exptrac-wallets-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
