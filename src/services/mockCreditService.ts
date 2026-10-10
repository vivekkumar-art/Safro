import { CreditTransaction } from '../types';
import { safeLocalStorage } from './storageHelper';

const CREDITS_PREFIX = 'safro_credits_balance';
const TRANSACTIONS_PREFIX = 'safro_credits_transactions';
const DEMO_USER_ID = 'usr_safro_001';

const DEMO_INITIAL_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'tx_01',
    date: '14 Nov 2026',
    type: 'earned',
    amount: 3200,
    description: 'Trip Savings Reward — Rishikesh Rafting (Saved ₹3,200 under budget!)',
    tripId: 'trip_rishikesh_03',
  },
  {
    id: 'tx_02',
    date: '10 Dec 2026',
    type: 'redeemed',
    amount: 1000,
    description: 'Redeemed on Manali Adventure & Solang Escape booking',
    tripId: 'trip_manali_01',
  },
];

function getCreditsKey(userId?: string): string {
  return userId ? `${CREDITS_PREFIX}_${userId}` : CREDITS_PREFIX;
}

function getTransactionsKey(userId?: string): string {
  return userId ? `${TRANSACTIONS_PREFIX}_${userId}` : TRANSACTIONS_PREFIX;
}

export const mockCreditService = {
  /**
   * Retrieve active credits balance for a specific user (or active session).
   * New users always strictly start from 0 credits.
   */
  getBalance(userId?: string): number {
    const key = getCreditsKey(userId);
    const raw = safeLocalStorage.getItem(key);

    if (raw !== null) {
      const val = parseInt(raw, 10);
      return isNaN(val) ? 0 : val;
    }

    // Only the seeded demo profile with prior trip history starts with demo credits
    if (userId === DEMO_USER_ID) {
      safeLocalStorage.setItem(key, '2200');
      return 2200;
    }

    // All new signups, new logins, and custom Google accounts start cleanly at 0
    safeLocalStorage.setItem(key, '0');
    safeLocalStorage.setItem(CREDITS_PREFIX, '0');
    return 0;
  },

  /**
   * Retrieve transaction history. New users start with an empty list.
   */
  getTransactions(userId?: string): CreditTransaction[] {
    const key = getTransactionsKey(userId);
    const raw = safeLocalStorage.getItem(key);

    if (raw !== null) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }

    if (userId === DEMO_USER_ID) {
      safeLocalStorage.setItem(key, JSON.stringify(DEMO_INITIAL_TRANSACTIONS));
      return DEMO_INITIAL_TRANSACTIONS;
    }

    safeLocalStorage.setItem(key, JSON.stringify([]));
    safeLocalStorage.setItem(TRANSACTIONS_PREFIX, JSON.stringify([]));
    return [];
  },

  /**
   * Reset / initialize credits explicitly to 0 for a new user account
   */
  resetCredits(userId?: string, startingBalance: number = 0): void {
    const key = getCreditsKey(userId);
    const txKey = getTransactionsKey(userId);
    const balStr = startingBalance.toString();

    safeLocalStorage.setItem(key, balStr);
    safeLocalStorage.setItem(txKey, JSON.stringify([]));
    safeLocalStorage.setItem(CREDITS_PREFIX, balStr);
    safeLocalStorage.setItem(TRANSACTIONS_PREFIX, JSON.stringify([]));
  },

  /**
   * Credit rewards to the user wallet
   */
  addCredits(amount: number, description: string, tripId?: string, userId?: string): number {
    const current = this.getBalance(userId);
    const updated = current + amount;
    const key = getCreditsKey(userId);
    const txKey = getTransactionsKey(userId);

    safeLocalStorage.setItem(key, updated.toString());
    safeLocalStorage.setItem(CREDITS_PREFIX, updated.toString());

    const txs = this.getTransactions(userId);
    txs.unshift({
      id: `tx_${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      type: 'earned',
      amount,
      description,
      tripId,
    });

    safeLocalStorage.setItem(txKey, JSON.stringify(txs));
    safeLocalStorage.setItem(TRANSACTIONS_PREFIX, JSON.stringify(txs));
    return updated;
  },

  /**
   * Redeem available credits against a booking
   */
  redeemCredits(
    amount: number,
    description: string,
    tripId?: string,
    userId?: string
  ): { success: boolean; newBalance: number; message: string } {
    const current = this.getBalance(userId);
    if (amount > current) {
      return {
        success: false,
        newBalance: current,
        message: `Insufficient SAFRO Credits. You have ₹${current.toLocaleString('en-IN')} available.`,
      };
    }

    const updated = Math.max(0, current - amount);
    const key = getCreditsKey(userId);
    const txKey = getTransactionsKey(userId);

    safeLocalStorage.setItem(key, updated.toString());
    safeLocalStorage.setItem(CREDITS_PREFIX, updated.toString());

    const txs = this.getTransactions(userId);
    txs.unshift({
      id: `tx_${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      type: 'redeemed',
      amount,
      description,
      tripId,
    });

    safeLocalStorage.setItem(txKey, JSON.stringify(txs));
    safeLocalStorage.setItem(TRANSACTIONS_PREFIX, JSON.stringify(txs));

    return {
      success: true,
      newBalance: updated,
      message: `Successfully redeemed ₹${amount.toLocaleString('en-IN')} SAFRO Credits!`,
    };
  },
};
