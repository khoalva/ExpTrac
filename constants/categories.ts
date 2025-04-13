import { Category } from '@/types';
import { categoryColors } from './Colors';

export const expenseCategories: Category[] = [
  {
    id: '1',
    name: 'Food',
    icon: 'utensils',
    color: categoryColors.food,
    type: 'expense',
  },
  {
    id: '2',
    name: 'Transport',
    icon: 'car',
    color: categoryColors.transport,
    type: 'expense',
  },
  {
    id: '3',
    name: 'Shopping',
    icon: 'shopping-bag',
    color: categoryColors.shopping,
    type: 'expense',
  },
  {
    id: '4',
    name: 'Entertainment',
    icon: 'film',
    color: categoryColors.entertainment,
    type: 'expense',
  },
  {
    id: '5',
    name: 'Health',
    icon: 'heart',
    color: categoryColors.health,
    type: 'expense',
  },
  {
    id: '6',
    name: 'Education',
    icon: 'book',
    color: categoryColors.education,
    type: 'expense',
  },
  {
    id: '7',
    name: 'Housing',
    icon: 'home',
    color: categoryColors.housing,
    type: 'expense',
  },
  {
    id: '8',
    name: 'Utilities',
    icon: 'zap',
    color: categoryColors.utilities,
    type: 'expense',
  },
  {
    id: '9',
    name: 'Other',
    icon: 'more-horizontal',
    color: categoryColors.other,
    type: 'expense',
  },
];

export const incomeCategories: Category[] = [
  {
    id: '10',
    name: 'Salary',
    icon: 'briefcase',
    color: categoryColors.income,
    type: 'income',
  },
  {
    id: '11',
    name: 'Investment',
    icon: 'trending-up',
    color: categoryColors.investment,
    type: 'income',
  },
  {
    id: '12',
    name: 'Gift',
    icon: 'gift',
    color: categoryColors.income,
    type: 'income',
  },
  {
    id: '13',
    name: 'Scholarship',
    icon: 'award',
    color: categoryColors.education,
    type: 'income',
  },
  {
    id: '14',
    name: 'Part-time job',
    icon: 'clock',
    color: categoryColors.income,
    type: 'income',
  },
  {
    id: '15',
    name: 'Other',
    icon: 'more-horizontal',
    color: categoryColors.other,
    type: 'income',
  },
];

export const getAllCategories = () => [...expenseCategories, ...incomeCategories];

export const getCategoryById = (id: string) => {
  return getAllCategories().find(category => category.id === id);
};

export const getCategoriesByType = (type: 'income' | 'expense') => {
  return getAllCategories().filter(category => category.type === type);
};