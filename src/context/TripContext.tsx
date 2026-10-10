import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Trip, Expense, Offer, CreditTransaction } from '../types';
import { mockTripService } from '../services/mockTripService';
import { mockExpenseService } from '../services/mockExpenseService';
import { mockOfferService } from '../services/mockOfferService';
import { mockCreditService } from '../services/mockCreditService';
import { useAuth } from './AuthContext';

const DEFAULT_NEW_TRIP_DRAFT: Partial<Trip> = {
  destination: 'Manali',
  stateOrCountry: 'Himachal Pradesh, India',
  pickupPoint: 'Delhi Kashmere Gate ISBT / IGI Airport',
  dropPoint: 'Solang Valley Resort & Adventure Hub, Manali',
  startDate: '12 Dec 2026',
  endDate: '15 Dec 2026',
  durationDays: 4,
  travelers: 2,
  budget: 25000,
  travelStyle: 'Balanced',
  transportation: 'Car',
  interests: ['Nature', 'Adventure', 'Food'],
  imageUrl: '/assets/images/manali-resort.jpg',
  estimatedCost: 22800,
  appliedOfferDiscount: 1200,
  creditsUsed: 1000,
};

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | undefined;
  credits: number;
  transactions: CreditTransaction[];
  offers: Offer[];
  expenses: Expense[];
  newTripDraft: Partial<Trip>;
  setNewTripDraft: React.Dispatch<React.SetStateAction<Partial<Trip>>>;
  updateDraft: (fields: Partial<Trip>) => void;
  resetNewTripDraft: () => void;
  createTrip: (data: Partial<Trip>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => Trip | undefined;
  completeTrip: (id: string) => { trip: Trip; savings: number; creditsEarned: number } | undefined;
  setActiveTrip: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;
  redeemCredits: (amount: number, tripId?: string) => boolean;
  addCredits: (amount: number, description: string, tripId?: string) => void;
  applyOfferToTrip: (tripId: string, offer: Offer) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [credits, setCredits] = useState<number>(() =>
    user?.id ? mockCreditService.getBalance(user.id) : 0
  );
  const [transactions, setTransactions] = useState<CreditTransaction[]>(() =>
    user?.id ? mockCreditService.getTransactions(user.id) : []
  );
  const [offers, setOffers] = useState<Offer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newTripDraft, setNewTripDraft] = useState<Partial<Trip>>(DEFAULT_NEW_TRIP_DRAFT);

  // Initialize general data from services
  useEffect(() => {
    setTrips(mockTripService.getTrips());
    setOffers(mockOfferService.getOffers());
    setExpenses(mockExpenseService.getExpenses());
  }, []);

  // Synchronize credits whenever active user changes (or new user logs in/signs up)
  useEffect(() => {
    if (user?.id) {
      setCredits(mockCreditService.getBalance(user.id));
      setTransactions(mockCreditService.getTransactions(user.id));
    } else {
      setCredits(0);
      setTransactions([]);
    }
  }, [user?.id]);

  const activeTrip = trips.find((t) => t.status === 'active') || trips[0];

  const updateDraft = useCallback((fields: Partial<Trip>) => {
    setNewTripDraft((prev) => ({ ...prev, ...fields }));
  }, []);

  const resetNewTripDraft = useCallback(() => {
    setNewTripDraft(DEFAULT_NEW_TRIP_DRAFT);
  }, []);

  const createTrip = useCallback((data: Partial<Trip>): Trip => {
    const created = mockTripService.createTrip(data);
    setTrips(mockTripService.getTrips());
    return created;
  }, []);

  const updateTrip = useCallback((id: string, updates: Partial<Trip>): Trip | undefined => {
    const updated = mockTripService.updateTrip(id, updates);
    if (updated) {
      setTrips(mockTripService.getTrips());
    }
    return updated;
  }, []);

  const completeTrip = useCallback(
    (id: string) => {
      const res = mockTripService.completeTrip(id);
      if (res) {
        setTrips(mockTripService.getTrips());
        if (res.creditsEarned > 0) {
          const newBal = mockCreditService.addCredits(
            res.creditsEarned,
            `Trip Savings Reward — ${res.trip.destination} (Saved ₹${res.savings.toLocaleString('en-IN')} under budget!)`,
            res.trip.id,
            user?.id
          );
          setCredits(newBal);
          setTransactions(mockCreditService.getTransactions(user?.id));
        }
      }
      return res;
    },
    [user?.id]
  );

  const setActiveTrip = useCallback((id: string) => {
    const updatedTrips = trips.map((t) => ({
      ...t,
      status: (t.id === id ? 'active' : t.status === 'active' ? 'planned' : t.status) as any,
    }));
    mockTripService.saveTrips(updatedTrips);
    setTrips(updatedTrips);
  }, [trips]);

  const addExpense = useCallback((exp: Omit<Expense, 'id'>): Expense => {
    const newExp = mockExpenseService.addExpense(exp);
    setExpenses(mockExpenseService.getExpenses());

    // Update actualSpent on trip
    const trip = trips.find((t) => t.id === exp.tripId);
    if (trip) {
      const newTotalSpent = trip.actualSpent + exp.amount;
      updateTrip(trip.id, { actualSpent: newTotalSpent });
    }
    return newExp;
  }, [trips, updateTrip]);

  const deleteExpense = useCallback((id: string) => {
    const target = expenses.find((e) => e.id === id);
    mockExpenseService.deleteExpense(id);
    setExpenses(mockExpenseService.getExpenses());
    if (target) {
      const trip = trips.find((t) => t.id === target.tripId);
      if (trip) {
        const newTotalSpent = Math.max(0, trip.actualSpent - target.amount);
        updateTrip(trip.id, { actualSpent: newTotalSpent });
      }
    }
  }, [expenses, trips, updateTrip]);

  const redeemCredits = useCallback(
    (amount: number, tripId?: string): boolean => {
      const res = mockCreditService.redeemCredits(amount, `Redeemed on trip booking`, tripId, user?.id);
      if (res.success) {
        setCredits(res.newBalance);
        setTransactions(mockCreditService.getTransactions(user?.id));
        return true;
      }
      return false;
    },
    [user?.id]
  );

  const addCredits = useCallback(
    (amount: number, description: string, tripId?: string) => {
      const newBal = mockCreditService.addCredits(amount, description, tripId, user?.id);
      setCredits(newBal);
      setTransactions(mockCreditService.getTransactions(user?.id));
    },
    [user?.id]
  );

  const applyOfferToTrip = useCallback((tripId: string, offer: Offer) => {
    updateTrip(tripId, {
      appliedOfferId: offer.id,
      appliedOfferDiscount: offer.discountAmount,
    });
  }, [updateTrip]);

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        credits,
        transactions,
        offers,
        expenses,
        newTripDraft,
        setNewTripDraft,
        updateDraft,
        resetNewTripDraft,
        createTrip,
        updateTrip,
        completeTrip,
        setActiveTrip,
        addExpense,
        deleteExpense,
        redeemCredits,
        addCredits,
        applyOfferToTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
