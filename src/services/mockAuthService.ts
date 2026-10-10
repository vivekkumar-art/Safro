import { UserProfile, TravelPreferences } from '../types';
import { safeLocalStorage } from './storageHelper';
import { mockCreditService } from './mockCreditService';

const STORAGE_KEY = 'safro_user_profile';

const DEFAULT_USER: UserProfile = {
  id: 'usr_safro_001',
  name: 'Vivek Kumar',
  email: 'vivek82794158@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  location: 'Dehradun, India',
  phone: '+91 82794 15800',
  joinedDate: 'March 2026',
  bio: 'Mountain trekker, road trip enthusiast & passionate travel creator.',
  emergencyContactName: 'Rohan Kumar (Brother)',
  emergencyContactPhone: '+91 98123 45678',
  dob: '1998-08-15',
  gender: 'Male',
  bloodGroup: 'O+',
  govtIdType: 'Aadhaar',
  govtIdNumber: '•••• •••• 4892',
  homeAirport: 'Dehradun Airport (DED) / DEL',
  languages: ['Hindi', 'English', 'Punjabi'],
  dietaryPreference: 'Vegetarian',
  instagramHandle: '@vivek_travels',
  preferences: {
    travelStyle: 'Balanced',
    interests: ['Nature', 'Adventure', 'Food'],
    preferredTransport: 'Car',
  },
};

export const mockAuthService = {
  getCurrentUser(): UserProfile | null {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Default initial login for smooth demo experience
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER;
    }
  },

  async login(email: string, _password: string): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const cleanEmail = email.trim().toLowerCase();
    const isDemo = cleanEmail === 'aarav.sharma@safro.travel';
    const userId = isDemo
      ? 'usr_safro_001'
      : `usr_${encodeURIComponent(cleanEmail).replace(/[^a-zA-Z0-9]/g, '_')}`;

    const user: UserProfile = {
      ...DEFAULT_USER,
      id: userId,
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/^\w/, (c) => c.toUpperCase()) || 'Explorer',
    };
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    if (!isDemo) {
      const existing = safeLocalStorage.getItem(`safro_credits_balance_${user.id}`);
      if (existing === null) {
        mockCreditService.resetCredits(user.id, 0);
      }
    }
    return user;
  },

  async loginWithGoogle(account?: { name?: string; email?: string; avatarUrl?: string }): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const name = account?.name || 'Aarav Sharma';
    const email = account?.email || 'aarav.sharma@safro.travel';
    const avatarUrl =
      account?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    const isPresetDemo = email.toLowerCase() === 'aarav.sharma@safro.travel';
    const userId = isPresetDemo
      ? 'usr_safro_001'
      : `usr_google_${encodeURIComponent(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_')}`;

    const user: UserProfile = {
      ...DEFAULT_USER,
      id: userId,
      name,
      email,
      avatarUrl,
    };
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    if (!isPresetDemo) {
      const existing = safeLocalStorage.getItem(`safro_credits_balance_${user.id}`);
      if (existing === null) {
        mockCreditService.resetCredits(user.id, 0);
      }
    }
    return user;
  },

  async signup(name: string, email: string, _password: string): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const cleanEmail = email.trim().toLowerCase();
    const user: UserProfile = {
      ...DEFAULT_USER,
      id: `usr_${Date.now()}`,
      name,
      email: cleanEmail,
    };
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    // New user registrations always start strictly with 0 credits
    mockCreditService.resetCredits(user.id, 0);
    return user;
  },

  async updatePreferences(preferences: TravelPreferences): Promise<UserProfile> {
    const current = this.getCurrentUser() || DEFAULT_USER;
    const updated = { ...current, preferences };
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.getCurrentUser() || DEFAULT_USER;
    const updated = { ...current, ...updates };
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  logout(): void {
    safeLocalStorage.removeItem(STORAGE_KEY);
    safeLocalStorage.setItem('safro_credits_balance', '0');
  },
};
