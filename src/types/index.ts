export type TravelStyle = 'Budget' | 'Balanced' | 'Premium';
export type TransportType = 'Walking' | 'Public' | 'Car' | 'Taxi' | 'Flight' | 'Train';
export type ExpenseCategory = 'Transport' | 'Stay' | 'Food' | 'Activities' | 'Other';
export type TripStatus = 'planned' | 'active' | 'completed' | 'draft';

export interface TravelPreferences {
  travelStyle: TravelStyle;
  interests: string[];
  preferredTransport: TransportType;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  location: string;
  phone: string;
  joinedDate: string;
  preferences: TravelPreferences;
  bio?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  bloodGroup?: string;
  govtIdType?: 'Aadhaar' | 'Passport' | 'Driving License' | 'Voter ID';
  govtIdNumber?: string;
  homeAirport?: string;
  languages?: string[];
  dietaryPreference?: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Jain' | 'Halal' | 'Gluten-Free';
  instagramHandle?: string;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  location: string;
  duration: string;
  estimatedCost: number;
  category: ExpenseCategory;
  notes?: string;
  isCompleted?: boolean;
}

export interface TripDay {
  dayNumber: number;
  title: string;
  date: string;
  activities: ItineraryActivity[];
}

export interface LiveTripStatus {
  currentLocationName: string;
  destinationName: string;
  etaNormal: string;
  etaCurrent: string;
  delayMinutes: number;
  currentSpeedKmH: number;
  weatherAlert?: {
    icon: string;
    temp: string;
    condition: string;
    alertMessage?: string;
  };
  trafficAlert?: {
    level: 'low' | 'moderate' | 'heavy';
    message: string;
    alternativeAvailable?: boolean;
    savedMinutes?: number;
  };
  vehicleCoords: [number, number];
  destinationCoords: [number, number];
  waypoints: [number, number][];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  stateOrCountry: string;
  pickupPoint?: string;
  dropPoint?: string;
  pickupCoords?: [number, number];
  dropCoords?: [number, number];
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelers: number;
  travelStyle: TravelStyle;
  transportation: TransportType;
  interests: string[];
  budget: number;
  estimatedCost: number;
  actualSpent: number;
  appliedOfferId?: string;
  appliedOfferDiscount: number;
  creditsUsed: number;
  status: TripStatus;
  isPaid: boolean;
  itinerary: TripDay[];
  liveStatus?: LiveTripStatus;
}

export interface Expense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  discountAmount: number;
  discountPercent?: number;
  category: 'Hotel' | 'Restaurant' | 'Activity' | 'All';
  minSpend: number;
  validUntil: string;
  description: string;
  tag: string;
  imageUrl?: string;
}

export interface CreditTransaction {
  id: string;
  date: string;
  type: 'earned' | 'redeemed' | 'bonus';
  amount: number;
  description: string;
  tripId?: string;
}

export interface NielMessageAction {
  label: string;
  actionType: 'accept_alt' | 'view_itinerary' | 'book_hotel' | 'add_expense' | 'apply_coupon' | 'plan_trip';
  payload?: any;
}

export interface NielMessageCard {
  type: 'hotel' | 'activity' | 'weather' | 'budget';
  title: string;
  subtitle: string;
  price?: string;
  savings?: string;
  imageUrl?: string;
}

export interface NielMessage {
  id: string;
  sender: 'user' | 'niel';
  timestamp: string;
  content: string;
  actions?: NielMessageAction[];
  card?: NielMessageCard;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'trip' | 'offer' | 'credit' | 'alert' | 'navigation' | 'safety' | 'general';
  isRead: boolean;
  link?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'navigation' | 'safety' | 'general' | 'updates' | 'credit' | 'offer';
}

export type NotificationCategory = 'navigation' | 'safety' | 'general' | 'updates' | 'credit' | 'offer';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationChannelId = 'safro-navigation' | 'safro-safety-alerts' | 'safro-general' | 'safro-updates';

export interface SafroNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface SafroNotificationPayload {
  notificationId?: string;
  type?: NotificationCategory | 'ROUTE_UPDATED' | 'NAVIGATION_STARTED' | 'DESTINATION_NEAR' | 'DESTINATION_REACHED' | 'ROUTE_DEVIATION' | 'SAFETY_ALERT' | 'GENERAL_UPDATE' | 'CREDIT_EARNED' | 'OFFER_UNLOCKED';
  title: string;
  body: string;
  message?: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  destination?: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  channelId?: NotificationChannelId;
  data?: Record<string, any>;
  actions?: SafroNotificationAction[];
  requireInteraction?: boolean;
  sound?: boolean | string;
  vibrate?: number[];
  timestamp?: number;
}

export interface SafroNotificationPreferences {
  navigationEnabled: boolean;
  routeUpdatesEnabled: boolean;
  destinationAlertsEnabled: boolean;
  safetyAlertsEnabled: boolean;
  generalUpdatesEnabled: boolean;
  promotionalEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface SafroNotificationHistoryItem {
  id: string;
  notificationId?: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  time: string;
  timestamp: number;
  isRead: boolean;
  link?: string;
  image?: string;
  actions?: SafroNotificationAction[];
  data?: Record<string, any>;
}

export interface DevicePushToken {
  deviceId: string;
  userId: string;
  token: string;
  platform: 'android' | 'ios' | 'web' | 'desktop';
  deviceName?: string;
  lastActive: string;
  createdAt: string;
}

// ==============================================================================
// SAFRO ADMIN SYSTEM TYPES
// ==============================================================================

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl: string;
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
  status: 'active' | 'suspended';
}

export interface AdminLiveUser {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  coords: [number, number];
  speedKmH: number;
  status: 'active' | 'in_transit' | 'alert' | 'inactive';
  locationName: string;
  tripStatus: string;
  destinationName?: string;
  destinationCoords?: [number, number];
  lastUpdated: string;
  phone?: string;
  alertDetails?: {
    severity: 'high' | 'medium' | 'low';
    message: string;
    time: string;
  };
}

export interface AdminActivityItem {
  id: string;
  title: string;
  user: string;
  time: string;
  type: 'alert' | 'trip' | 'user' | 'notification' | 'route' | 'system';
  badge: string;
  badgeVariant: 'rose' | 'emerald' | 'blue' | 'purple' | 'amber';
}

export interface AdminSafetyAlert {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  locationName: string;
  coords: [number, number];
  time: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Acknowledged' | 'Resolved';
  description: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
}

export interface AdminKpiMetrics {
  totalUsers: number;
  totalUsersChange: number;
  activeUsers: number;
  activeUsersChange: number;
  usersOnline: number;
  usersOnlineChange: number;
  activeTrips: number;
  activeTripsChange: number;
  safetyAlerts: number;
  safetyAlertsChange: number;
  notificationsSent: number;
  notificationsSentChange: number;
}
