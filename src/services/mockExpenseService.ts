import { Expense, ExpenseCategory } from '../types';

const EXPENSES_STORAGE_KEY = 'safro_expenses_data';

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_01',
    tripId: 'trip_manali_01',
    category: 'Stay',
    description: 'Sterling Himalayan Resort (2 Nights)',
    amount: 7200,
    date: '12 Dec 2026',
    paymentMethod: 'UPI / HDFC Bank',
  },
  {
    id: 'exp_02',
    tripId: 'trip_manali_01',
    category: 'Transport',
    description: 'Private 4x4 Cab to Solang & Rohtang Pass',
    amount: 3400,
    date: '13 Dec 2026',
    paymentMethod: 'Google Pay',
  },
  {
    id: 'exp_03',
    tripId: 'trip_manali_01',
    category: 'Food',
    description: 'Cafe 1947 & Riverside Trout Dinner',
    amount: 1850,
    date: '12 Dec 2026',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'exp_04',
    tripId: 'trip_manali_01',
    category: 'Activities',
    description: 'Solang Tandem Paragliding & HD Drone Video',
    amount: 4200,
    date: '13 Dec 2026',
    paymentMethod: 'Cash / UPI',
  },
  {
    id: 'exp_05',
    tripId: 'trip_manali_01',
    category: 'Other',
    description: 'Thermal Snow Boots, Woolens & Local Honey',
    amount: 1750,
    date: '13 Dec 2026',
    paymentMethod: 'Paytm Wallet',
  },
];

export const mockExpenseService = {
  getExpenses(): Expense[] {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXPENSES;
    }
  },

  getExpensesByTrip(tripId: string): Expense[] {
    return this.getExpenses().filter((e) => e.tripId === tripId);
  },

  addExpense(expense: Omit<Expense, 'id'>): Expense {
    const all = this.getExpenses();
    const newExp: Expense = {
      ...expense,
      id: `exp_${Date.now()}`,
    };
    all.unshift(newExp);
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(all));
    return newExp;
  },

  deleteExpense(id: string): void {
    const all = this.getExpenses().filter((e) => e.id !== id);
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(all));
  },

  getSummary(tripId: string, totalBudget: number) {
    const tripExpenses = this.getExpensesByTrip(tripId);
    const totalSpent = tripExpenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = Math.max(0, totalBudget - totalSpent);
    const percentUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

    const categories: Record<ExpenseCategory, number> = {
      Transport: 0,
      Stay: 0,
      Food: 0,
      Activities: 0,
      Other: 0,
    };

    tripExpenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentUsed,
      categories,
      count: tripExpenses.length,
    };
  },
};
