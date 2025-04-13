import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface TransactionState {
  transactions: Transaction[];
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => string;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  
  // Filters
  getTransactionsByType: (type: 'income' | 'expense') => Transaction[];
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByWallet: (walletId: string) => Transaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  
  // Statistics
  getTotalIncome: (startDate?: Date, endDate?: Date) => number;
  getTotalExpense: (startDate?: Date, endDate?: Date) => number;
  getBalance: (startDate?: Date, endDate?: Date) => number;
  
  // Time periods
  getTransactionsToday: () => Transaction[];
  getTransactionsThisWeek: () => Transaction[];
  getTransactionsThisMonth: () => Transaction[];
  getTransactionsThisYear: () => Transaction[];
  
  // Clear all data (for testing)
  clearAllTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      addTransaction: (transaction) => {
        const id = Date.now().toString();
        const newTransaction = { ...transaction, id };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        return id;
      },
      
      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...transaction } : t
          ),
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      
      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },
      
      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },
      
      getTransactionsByCategory: (categoryId) => {
        return get().transactions.filter((t) => t.categoryId === categoryId);
      },
      
      getTransactionsByWallet: (walletId) => {
        return get().transactions.filter((t) => t.walletId === walletId);
      },
      
      getTransactionsByDateRange: (startDate, endDate) => {
        return get().transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      },
      
      getTotalIncome: (startDate, endDate) => {
        let transactions = get().transactions.filter((t) => t.type === 'income');
        
        if (startDate && endDate) {
          transactions = transactions.filter((t) => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
          });
        }
        
        return transactions.reduce((sum, t) => sum + t.amount, 0);
      },
      
      getTotalExpense: (startDate, endDate) => {
        let transactions = get().transactions.filter((t) => t.type === 'expense');
        
        if (startDate && endDate) {
          transactions = transactions.filter((t) => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
          });
        }
        
        return transactions.reduce((sum, t) => sum + t.amount, 0);
      },
      
      getBalance: (startDate, endDate) => {
        return get().getTotalIncome(startDate, endDate) - get().getTotalExpense(startDate, endDate);
      },
      
      getTransactionsToday: () => {
        const now = new Date();
        return get().getTransactionsByDateRange(startOfDay(now), endOfDay(now));
      },
      
      getTransactionsThisWeek: () => {
        const now = new Date();
        return get().getTransactionsByDateRange(startOfWeek(now), endOfWeek(now));
      },
      
      getTransactionsThisMonth: () => {
        const now = new Date();
        return get().getTransactionsByDateRange(startOfMonth(now), endOfMonth(now));
      },
      
      getTransactionsThisYear: () => {
        const now = new Date();
        return get().getTransactionsByDateRange(startOfYear(now), endOfYear(now));
      },
      
      clearAllTransactions: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'exptrac-transactions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);