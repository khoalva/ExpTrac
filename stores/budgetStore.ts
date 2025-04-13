import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget } from '@/types';
import { useTransactionStore } from './transactionStore';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface BudgetState {
  budgets: Budget[];
  
  // Actions
  addBudget: (budget: Omit<Budget, 'id' | 'spent' | 'remaining'>) => string;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgetById: (id: string) => Budget | undefined;
  
  // Calculations
  calculateBudgetProgress: (budgetId: string) => { spent: number; remaining: number; percentage: number };
  refreshAllBudgets: () => void;
  
  // Filters
  getBudgetsByCategory: (categoryId: string) => Budget[];
  getActiveBudgets: () => Budget[];
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      
      addBudget: (budget) => {
        const id = Date.now().toString();
        const newBudget = { 
          ...budget, 
          id,
          spent: 0,
          remaining: budget.amount,
        };
        
        set((state) => ({
          budgets: [...state.budgets, newBudget],
        }));
        
        // Calculate initial progress
        get().refreshAllBudgets();
        
        return id;
      },
      
      updateBudget: (id, budget) => {
        set((state) => ({
          budgets: state.budgets.map((b) => {
            if (b.id === id) {
              // If amount is being updated, recalculate remaining
              const updatedBudget = { ...b, ...budget };
              if (budget.amount !== undefined) {
                updatedBudget.remaining = budget.amount - b.spent;
              }
              return updatedBudget;
            }
            return b;
          }),
        }));
        
        // Recalculate progress after update
        get().refreshAllBudgets();
      },
      
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },
      
      getBudgetById: (id) => {
        return get().budgets.find((b) => b.id === id);
      },
      
      calculateBudgetProgress: (budgetId) => {
        const budget = get().getBudgetById(budgetId);
        if (!budget) {
          return { spent: 0, remaining: 0, percentage: 0 };
        }
        
        // Get transactions within the budget period and category
        const transactions = useTransactionStore.getState().transactions.filter(t => {
          const isInPeriod = isWithinInterval(new Date(t.date), {
            start: budget.startDate,
            end: budget.endDate,
          });
          
          const matchesCategory = !budget.categoryId || t.categoryId === budget.categoryId;
          const matchesWallet = !budget.walletId || t.walletId === budget.walletId;
          const isExpense = t.type === 'expense';
          
          return isInPeriod && matchesCategory && matchesWallet && isExpense;
        });
        
        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const remaining = Math.max(0, budget.amount - spent);
        const percentage = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0;
        
        return { spent, remaining, percentage };
      },
      
      refreshAllBudgets: () => {
        set((state) => ({
          budgets: state.budgets.map(budget => {
            const { spent, remaining } = get().calculateBudgetProgress(budget.id);
            return { ...budget, spent, remaining };
          }),
        }));
      },
      
      getBudgetsByCategory: (categoryId) => {
        return get().budgets.filter((b) => b.categoryId === categoryId);
      },
      
      getActiveBudgets: () => {
        const now = new Date();
        return get().budgets.filter((b) => {
          return isWithinInterval(now, {
            start: b.startDate,
            end: b.endDate,
          });
        });
      },
    }),
    {
      name: 'exptrac-budgets-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);