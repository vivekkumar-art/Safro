// ==============================================================================
// SAFRO PAN-INDIA DESTINATION INTELLIGENCE — DATA SCHEMAS & TYPES
// Authoritative geospatial, heritage, architectural, and provenance schemas
// ==============================================================================

export type DestinationCategory =
  | 'Hill Station'
  | 'Pilgrimage & Spiritual'
  | 'Heritage & Forts'
  | 'Beaches & Coastal'
  | 'Nature & Waterfalls'
  | 'Wildlife & Sanctuaries'
  | 'Adventure & Trekking'
  | 'Cities & Culture'
  | 'Offbeat & Hidden Gems';

export type ReligiousTradition =
  | 'Hinduism'
  | 'Buddhism'
  | 'Jainism'
  | 'Sikhism'
  | 'Christianity'
  | 'Islam'
  | 'Sufism'
  | 'Spiritual & Inter-faith'
  | 'None / Secular';

export type VerificationStatus = 'verified' | 'estimated' | 'unverified';

export type AdministrativeType = 'state' | 'ut';

export type GeographicZone =
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'Central'
  | 'Northeast';

export interface StateOrUT {
  id: string; // ISO-like e.g., 'IN-UT' for Uttarakhand, 'IN-RJ' for Rajasthan
  name: string;
  hindiName?: string;
  code: string; // ISO 3166-2:IN code e.g., 'UT', 'RJ', 'KL'
  type: AdministrativeType;
  zone: GeographicZone;
  capital: string;
  districtsCount: number;
  officialPortalUrl: string;
  description: string;
}

export interface District {
  id: string; // e.g., 'IN-UT-RUD' for Rudraprayag
  name: string;
  hindiName?: string;
  stateId: string;
  stateName: string;
  headquarters: string;
  subdistrictsCount?: number;
}

export interface DestinationSource {
  name: string; // e.g., 'Archaeological Survey of India', 'Badrinath-Kedarnath Temple Committee'
  url: string;
  organization: string;
  verificationDate: string; // ISO date e.g., '2026-08-15'
  confidenceScore: number; // 0 to 100
  licenseNotes?: string; // e.g. 'GODL India / Open Government Data'
}

export interface PermitRequirement {
  required: boolean;
  permitType?: string; // e.g., 'Char Dham Biometric Yatra Pass', 'Inner Line Permit (ILP)'
  details?: string;
  portalUrl?: string;
  applicableNationalities?: 'all' | 'foreign_only' | 'indian_only';
}

export interface CostBreakdown {
  currency: 'INR';
  dailyBudgetMin: number;
  dailyBudgetMax: number;
  hotelEstimateAvg: number;
  foodEstimateAvg: number;
  activityEstimateAvg: number;
  assumptionNotes: string;
  verifiedDate: string;
}

export interface TransportHubs {
  nearestAirport: string;
  nearestAirportDistanceKm: number;
  nearestRailwayStation: string;
  nearestRailwayDistanceKm: number;
  roadAccessDescription: string;
  defaultPickupTransit: string;
  defaultDropTransit: string;
}

export interface Destination {
  id: string; // Stable slug e.g., 'kedarnath-rudraprayag'
  officialName: string;
  hindiName?: string;
  alternativeNames: string[]; // Aliases, old names, phonetic variations e.g., ['Kedar', 'Kedarnath Dham']
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  subdistrictName?: string; // Tehsil / Taluk / Block
  settlementName: string; // City / Town / Village / Locality
  fullAddressOrLocality?: string;
  
  category: DestinationCategory;
  subcategory: string; // e.g., 'Jyotirlinga Temple', 'UNESCO World Heritage', 'High Altitude Trek'
  
  // Religious & Heritage Attributes
  religiousTradition?: ReligiousTradition;
  associatedDeityOrDedication?: string; // e.g., 'Lord Shiva', 'Lord Vishnu', 'Maa Durga'
  isJyotirlinga?: boolean;
  isShaktiPeetha?: boolean;
  isCharDham?: boolean;
  isUnescoWorldHeritage?: boolean;
  isAsiProtected?: boolean;
  
  // Historical & Architectural Attributes
  historicalPeriod?: string; // e.g., 'Ancient / 8th Century CE', 'Chola Dynasty', 'Mughal Period'
  architecturalStyle?: string; // e.g., 'Nagara Style', 'Dravidian Style', 'Indo-Islamic'
  culturalSignificance?: string;
  
  // Geospatial Information
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  isCoordinateVerified: boolean;
  
  // Descriptions
  shortDescription: string;
  detailedDescription: string;
  
  // Exploration
  attractions: string[];
  thingsToDo: string[];
  nearbyDestinations: string[];
  
  // Timing & Seasons
  suggestedDurationDays: number;
  bestVisitingSeason: string;
  idealMonths: string[];
  openingHours?: string;
  entryFee?: string;
  photographyRules?: string;
  dressCodeOrVisitorGuidance?: string;
  
  // Connectivity & Logistics
  transport: TransportHubs;
  accessibilityNotes: string;
  isWheelchairAccessible: boolean;
  
  costEstimate: CostBreakdown;
  accommodationInfo: string;
  foodAndCulinaryHighlights: string[];
  
  // Permits, Safety & Seasonal Rules
  permitInfo: PermitRequirement;
  safetyAdvisories: string[];
  seasonalClosures?: string;
  contactInformation?: string;
  officialWebsite?: string;
  
  // Media & Provenance
  imageUrl: string;
  galleryImages?: string[];
  imageCredits?: string;
  
  sources: DestinationSource[];
  sourceLicense?: string;
  verificationStatus: VerificationStatus;
  dataConfidence: number; // 0 to 100
  lastVerifiedAt?: string;
  lastUpdated: string;
  isPublished: boolean;
}

export interface SourceRegistryEntry {
  id: string;
  organization: string;
  category:
    | 'Government Ministry'
    | 'Archaeological Authority'
    | 'State Tourism Board'
    | 'Temple Shrine Board'
    | 'Official Heritage Body';
  baseUrl: string;
  termsUrl?: string;
  license: string;
  allowedReuse: boolean;
  attributionRequired: boolean;
  attributionStatement: string;
  apiAvailable: boolean;
  lastAudited: string;
}

export interface CoverageMetrics {
  totalStatesAndUTs: number; // 36 in India
  statesCoveredCount: number;
  districtsCoveredCount: number;
  totalDestinations: number;
  verifiedDestinationsCount: number;
  estimatedDestinationsCount: number;
  unverifiedDestinationsCount: number;
  missingCoordinatesCount: number;
  duplicateCandidatesCount: number;
  outdatedSourcesCount: number;
  missingSourcesCount: number;
  verificationPercentage: number;
  
  // Specialized Heritage Counts
  hinduTemplesCount: number;
  historicalAndFortsCount: number;
  unescoSitesCount: number;
  asiProtectedCount: number;
  jyotirlingaCount: number;
  shaktiPeethaCount: number;
  
  categoryBreakdown: Record<string, number>;
  religiousTraditionBreakdown: Record<string, number>;
  lastSyncTimestamp: string;
}

export interface ImportValidationIssue {
  rowOrIndex: number;
  destinationId?: string;
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ImportResult {
  success: boolean;
  totalParsed: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  issues: ImportValidationIssue[];
  timestamp: string;
}
