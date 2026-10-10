import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useToast } from '../context/ToastContext';
import { ExpenseCategory } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Receipt,
  Plus,
  Trash2,
  Car,
  Home,
  Utensils,
  Flame,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';

const CATEGORY_ICONS: Record<ExpenseCategory, React.ComponentType<{ className?: string }>> = {
  Transport: Car,
  Stay: Home,
  Food: Utensils,
  Activities: Flame,
  Other: MoreHorizontal,
};

export const ExpensesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { trips, activeTrip, expenses, addExpense, deleteExpense } = useTrip();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const selectedTrip = (id ? trips.find((t) => t.id === id) : null) || activeTrip || trips[0];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  if (!selectedTrip) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">No trips available for expense tracking</h2>
        <Button onClick={() => navigate('/trips/new')} className="mt-4">
          Plan a Trip
        </Button>
      </div>
    );
  }

  const tripExpenses = expenses.filter((e) => e.tripId === selectedTrip.id);
  const totalBudget = selectedTrip.budget;
  const totalSpent = tripExpenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const percentUsed = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  // Category breakdown
  const categoryTotals: Record<ExpenseCategory, number> = {
    Transport: 0,
    Stay: 0,
    Food: 0,
    Activities: 0,
    Other: 0,
  };
  tripExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Invalid Amount', 'Please enter a valid expense amount.', 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Missing Description', 'Please provide a description.', 'warning');
      return;
    }

    addExpense({
      tripId: selectedTrip.id,
      category,
      description: description.trim(),
      amount: numAmount,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      paymentMethod,
    });

    showToast('Expense Added', `Added ₹${numAmount.toLocaleString('en-IN')} under ${category}.`, 'success');
    setDescription('');
    setAmount('');
    setIsAddModalOpen(false);
  };

  const handleDeleteExpense = (expId: string) => {
    deleteExpense(expId);
    showToast('Expense Removed', 'Expense successfully removed from budget calculations.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            FINANCIAL HEALTH & TRACKING
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
            Trip Expense Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time expenditures for {selectedTrip.destination} ({selectedTrip.title})
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-md shadow-[#1267D6]/20 font-bold self-start sm:self-auto"
        >
          Add Expense
        </Button>
      </div>

      {/* Main Budget Health Summary Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#062B5C] to-[#031D3D] text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Total Budget
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
              ₹{totalBudget.toLocaleString('en-IN')}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-300">Spent So Far</span>
              <p className="text-xl sm:text-2xl font-extrabold text-sky-300 mt-0.5">
                ₹{totalSpent.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <span className="text-xs text-slate-300">Remaining</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5">
                ₹{remaining.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
            <span>Budget Utilization</span>
            <span>{percentUsed}% Used</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-[#F5A623]' : 'bg-[#19A974]'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {/* NIEL AI Tip */}
        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-2.5 text-xs text-blue-100">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <p>
            <strong>NIEL AI Insight:</strong> You're on track! Completing this trip without exceeding ₹{totalBudget.toLocaleString('en-IN')} will earn you <strong>₹{remaining.toLocaleString('en-IN')} in SAFRO Credits</strong>.
          </p>
        </div>
      </Card>

      {/* Category Breakdown Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-3">
          Spending by Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['Stay', 'Transport', 'Food', 'Activities', 'Other'] as ExpenseCategory[]).map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const catSpent = categoryTotals[cat];
            const catPercent = totalSpent > 0 ? Math.round((catSpent / totalSpent) * 100) : 0;

            return (
              <div
                key={cat}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[#1267D6]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">{catPercent}%</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{cat}</span>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#031D3D] dark:text-white mt-0.5">
                    ₹{catSpent.toLocaleString('en-IN')}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses List */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#031D3D] dark:text-white">Recent Transactions</h3>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            {tripExpenses.length} Records
          </span>
        </div>

        {tripExpenses.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tripExpenses.map((exp) => {
              const Icon = CATEGORY_ICONS[exp.category] || Receipt;
              return (
                <div
                  key={exp.id}
                  className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#EAF4FF] dark:bg-blue-950/40 text-[#1267D6] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">{exp.description}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                        {exp.category} • {exp.date} • {exp.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-[#062B5C] dark:text-slate-100">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-slate-300 dark:text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">No expenses recorded yet. Click "Add Expense" to start.</p>
          </div>
        )}
      </Card>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
        subtitle={`Record a payment for your ${selectedTrip.destination} trip`}
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Stay', 'Transport', 'Food', 'Activities', 'Other'] as ExpenseCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#1267D6] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Lunch at Mountain Bistro, Taxi fare..."
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1500"
              required
              min="1"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
            >
              <option value="UPI / Google Pay">UPI / Google Pay</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Paytm Wallet">Paytm Wallet</option>
            </select>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full font-bold shadow-md shadow-[#1267D6]/20"
            >
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
