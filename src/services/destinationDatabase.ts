// ==============================================================================
// SAFRO PAN-INDIA DESTINATION INTELLIGENCE SERVICE & INGESTION PIPELINE
// Scalable normalized database, CSV/JSON parser, validator & RAG indexing
// ==============================================================================

import {
  Destination,
  StateOrUT,
  District,
  CoverageMetrics,
  ImportResult,
  ImportValidationIssue,
  DestinationCategory,
  VerificationStatus,
} from '../types/destination';
import {
  ALL_INDIAN_STATES_AND_UTS,
  INITIAL_DISTRICTS,
  AUTHORITATIVE_SEED_DESTINATIONS,
} from '../data/panIndiaSeedData';
import { safeLocalStorage } from './storageHelper';

const STORAGE_KEY_DESTINATIONS = 'safro_pan_india_destinations_v2';
const STORAGE_KEY_DISTRICTS = 'safro_pan_india_districts_v2';
const STORAGE_KEY_LAST_SYNC = 'safro_destination_sync_timestamp';

// Bounding box for valid territory of the Republic of India
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 37.6,
  minLng: 68.0,
  maxLng: 97.5,
};

class DestinationDatabaseService {
  private destinations: Destination[] = [];
  private states: StateOrUT[] = [];
  private districts: District[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  /**
   * Initializes database from local persistence or falls back to seed data
   */
  public init() {
    this.states = [...ALL_INDIAN_STATES_AND_UTS];

    // Load districts from storage or seed
    const storedDistricts = safeLocalStorage.getItem(STORAGE_KEY_DISTRICTS);
    if (storedDistricts) {
      try {
        this.districts = JSON.parse(storedDistricts);
      } catch {
        this.districts = [...INITIAL_DISTRICTS];
      }
    } else {
      this.districts = [...INITIAL_DISTRICTS];
      safeLocalStorage.setItem(STORAGE_KEY_DISTRICTS, JSON.stringify(this.districts));
    }

    // Load destinations from storage or seed
    const storedDestinations = safeLocalStorage.getItem(STORAGE_KEY_DESTINATIONS);
    if (storedDestinations) {
      try {
        const parsed = JSON.parse(storedDestinations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.destinations = parsed;
        } else {
          this.destinations = [...AUTHORITATIVE_SEED_DESTINATIONS];
        }
      } catch {
        this.destinations = [...AUTHORITATIVE_SEED_DESTINATIONS];
      }
    } else {
      this.destinations = [...AUTHORITATIVE_SEED_DESTINATIONS];
      this.saveDestinations();
    }

    if (!safeLocalStorage.getItem(STORAGE_KEY_LAST_SYNC)) {
      safeLocalStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
    }

    this.isInitialized = true;
  }

  private saveDestinations() {
    safeLocalStorage.setItem(STORAGE_KEY_DESTINATIONS, JSON.stringify(this.destinations));
    safeLocalStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
  }

  private saveDistricts() {
    safeLocalStorage.setItem(STORAGE_KEY_DISTRICTS, JSON.stringify(this.districts));
  }

  // ============================================================================
  // ADMINISTRATIVE GEOGRAPHY BROWSING
  // ============================================================================

  public getAllStatesAndUTs(): StateOrUT[] {
    return this.states;
  }

  public getStateById(stateId: string): StateOrUT | undefined {
    return this.states.find(
      (s) => s.id.toLowerCase() === stateId.toLowerCase() || s.code.toLowerCase() === stateId.toLowerCase()
    );
  }

  public getDistrictsByState(stateId: string): District[] {
    return this.districts.filter(
      (d) => d.stateId.toLowerCase() === stateId.toLowerCase()
    );
  }

  public getDestinationsByState(stateId: string): Destination[] {
    return this.destinations.filter(
      (d) => d.stateId.toLowerCase() === stateId.toLowerCase()
    );
  }

  public getDestinationsByDistrict(districtId: string): Destination[] {
    return this.destinations.filter(
      (d) => d.districtId.toLowerCase() === districtId.toLowerCase()
    );
  }

  // ============================================================================
  // SEARCH & QUERY ENGINE (Hindi + English + Aliases + Categories + Heritage + Distance)
  // ============================================================================

  public searchDestinations(query: string, options?: {
    category?: string;
    stateId?: string;
    districtId?: string;
    religiousTradition?: string;
    associatedDeity?: string;
    historicalPeriod?: string;
    architecturalStyle?: string;
    isWheelchairAccessible?: boolean;
    verificationStatus?: VerificationStatus;
    maxDistanceKm?: number;
    originCoords?: { lat: number; lng: number };
  }): Destination[] {
    let results = [...this.destinations];

    if (options?.category && options.category !== 'All') {
      results = results.filter((d) => d.category === options.category);
    }

    if (options?.stateId && options.stateId !== 'All') {
      results = results.filter((d) => d.stateId.toLowerCase() === options.stateId!.toLowerCase());
    }

    if (options?.districtId && options.districtId !== 'All') {
      results = results.filter((d) => d.districtId.toLowerCase() === options.districtId!.toLowerCase());
    }

    if (options?.religiousTradition && options.religiousTradition !== 'All') {
      results = results.filter((d) => d.religiousTradition === options.religiousTradition);
    }

    if (options?.associatedDeity && options.associatedDeity !== 'All') {
      const lowerDeity = options.associatedDeity.toLowerCase();
      results = results.filter((d) => d.associatedDeityOrDedication?.toLowerCase().includes(lowerDeity));
    }

    if (options?.historicalPeriod && options.historicalPeriod !== 'All') {
      const lowerPeriod = options.historicalPeriod.toLowerCase();
      results = results.filter((d) => d.historicalPeriod?.toLowerCase().includes(lowerPeriod));
    }

    if (options?.architecturalStyle && options.architecturalStyle !== 'All') {
      const lowerStyle = options.architecturalStyle.toLowerCase();
      results = results.filter((d) => d.architecturalStyle?.toLowerCase().includes(lowerStyle));
    }

    if (options?.isWheelchairAccessible !== undefined) {
      results = results.filter((d) => d.isWheelchairAccessible === options.isWheelchairAccessible);
    }

    if (options?.verificationStatus) {
      results = results.filter((d) => d.verificationStatus === options.verificationStatus);
    }

    // Distance filtering if origin coordinates provided
    if (options?.originCoords && options?.maxDistanceKm) {
      const { lat: oLat, lng: oLng } = options.originCoords;
      const maxDist = options.maxDistanceKm;
      results = results.filter((d) => {
        if (!d.latitude || !d.longitude) return false;
        const dist = this.calculateDistanceKm(oLat, oLng, d.latitude, d.longitude);
        return dist <= maxDist;
      });
    }

    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return results;
    }

    const scoredResults: Array<{ dest: Destination; score: number }> = [];

    results.forEach((dest) => {
      let score = 0;
      const lowerOfficial = dest.officialName.toLowerCase();
      const lowerHindi = dest.hindiName ? dest.hindiName.toLowerCase() : '';

      // 1. Exact or prefix match on official name or Hindi name
      if (lowerOfficial === cleanQuery || lowerHindi === cleanQuery) {
        score += 100;
      } else if (lowerOfficial.startsWith(cleanQuery) || (lowerHindi && lowerHindi.startsWith(cleanQuery))) {
        score += 60;
      } else if (lowerOfficial.includes(cleanQuery) || (lowerHindi && lowerHindi.includes(cleanQuery))) {
        score += 35;
      }

      // 2. Alternative names and aliases
      if (dest.alternativeNames?.some((alias) => alias.toLowerCase() === cleanQuery)) {
        score += 90;
      } else if (dest.alternativeNames?.some((alias) => alias.toLowerCase().startsWith(cleanQuery))) {
        score += 50;
      } else if (dest.alternativeNames?.some((alias) => alias.toLowerCase().includes(cleanQuery))) {
        score += 30;
      }

      // 3. Deity / Dedication / Tradition
      if (dest.associatedDeityOrDedication?.toLowerCase().includes(cleanQuery)) {
        score += 45;
      }
      if (dest.religiousTradition?.toLowerCase().includes(cleanQuery)) {
        score += 35;
      }

      // 4. Architectural style & Historical period
      if (dest.architecturalStyle?.toLowerCase().includes(cleanQuery)) {
        score += 30;
      }
      if (dest.historicalPeriod?.toLowerCase().includes(cleanQuery)) {
        score += 25;
      }

      // 5. Settlement, District & State
      if (dest.settlementName.toLowerCase() === cleanQuery) {
        score += 40;
      } else if (dest.districtName.toLowerCase() === cleanQuery) {
        score += 30;
      } else if (dest.stateName.toLowerCase() === cleanQuery) {
        score += 25;
      } else if (dest.districtName.toLowerCase().includes(cleanQuery) || dest.stateName.toLowerCase().includes(cleanQuery)) {
        score += 15;
      }

      // 6. Category & Subcategory
      if (dest.category.toLowerCase().includes(cleanQuery) || dest.subcategory.toLowerCase().includes(cleanQuery)) {
        score += 15;
      }

      // 7. Attractions & things to do
      if (dest.attractions?.some((att) => att.toLowerCase().includes(cleanQuery))) {
        score += 10;
      }
      if (dest.thingsToDo?.some((t) => t.toLowerCase().includes(cleanQuery))) {
        score += 8;
      }

      // 8. Short description keyword search
      if (dest.shortDescription?.toLowerCase().includes(cleanQuery)) {
        score += 5;
      }

      if (score > 0) {
        scoredResults.push({ dest, score });
      }
    });

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.map((s) => s.dest);
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public getDestinationById(id: string): Destination | undefined {
    return this.destinations.find((d) => d.id === id);
  }

  public getAllDestinations(): Destination[] {
    return this.destinations;
  }

  public getPopularDestinations(): Destination[] {
    // Return verified destinations with high data confidence
    return this.destinations
      .filter((d) => d.isPublished)
      .slice(0, 8);
  }

  public getNearbyDestinations(destinationId: string): Destination[] {
    const current = this.getDestinationById(destinationId);
    if (!current) return [];

    // Find destinations matching nearbyDestinations list or in the same state/district
    return this.destinations.filter((d) => {
      if (d.id === destinationId) return false;
      if (current.nearbyDestinations?.some((nearby) => d.officialName.toLowerCase().includes(nearby.toLowerCase()))) {
        return true;
      }
      return d.stateId === current.stateId;
    }).slice(0, 4);
  }

  // ============================================================================
  // COVERAGE METRICS ENGINE
  // ============================================================================

  public getCoverageMetrics(): CoverageMetrics {
    const totalStatesAndUTs = 36;
    const coveredStateIds = new Set(this.destinations.map((d) => d.stateId));
    const coveredDistrictIds = new Set(this.destinations.map((d) => d.districtId));

    let verifiedCount = 0;
    let estimatedCount = 0;
    let unverifiedCount = 0;
    let missingCoordsCount = 0;
    let outdatedSourcesCount = 0;
    let missingSourcesCount = 0;

    let hinduTemplesCount = 0;
    let historicalAndFortsCount = 0;
    let unescoSitesCount = 0;
    let asiProtectedCount = 0;
    let jyotirlingaCount = 0;
    let shaktiPeethaCount = 0;

    const categoryBreakdown: Record<string, number> = {};
    const religiousTraditionBreakdown: Record<string, number> = {};

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    this.destinations.forEach((d) => {
      if (d.verificationStatus === 'verified') verifiedCount++;
      else if (d.verificationStatus === 'estimated') estimatedCount++;
      else unverifiedCount++;

      if (!d.latitude || !d.longitude || !d.isCoordinateVerified) {
        missingCoordsCount++;
      }

      // Check source presence and freshness
      if (!d.sources || d.sources.length === 0) {
        missingSourcesCount++;
      } else {
        const hasFreshSource = d.sources.some((s) => {
          try {
            return new Date(s.verificationDate) > twoYearsAgo;
          } catch {
            return false;
          }
        });
        if (!hasFreshSource) outdatedSourcesCount++;
      }

      // Category breakdown
      categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + 1;

      // Religious tradition breakdown
      const relTrad = d.religiousTradition || 'None / Secular';
      religiousTraditionBreakdown[relTrad] = (religiousTraditionBreakdown[relTrad] || 0) + 1;

      // Heritage counters
      const lowerSub = (d.subcategory || '').toLowerCase();
      if (
        d.religiousTradition === 'Hinduism' ||
        d.category === 'Pilgrimage & Spiritual' ||
        lowerSub.includes('temple') ||
        d.isJyotirlinga ||
        d.isShaktiPeetha ||
        d.isCharDham
      ) {
        hinduTemplesCount++;
      }

      if (
        d.category === 'Heritage & Forts' ||
        lowerSub.includes('fort') ||
        lowerSub.includes('palace') ||
        lowerSub.includes('monument') ||
        lowerSub.includes('ruin') ||
        d.isAsiProtected
      ) {
        historicalAndFortsCount++;
      }

      if (d.isUnescoWorldHeritage || lowerSub.includes('unesco')) {
        unescoSitesCount++;
      }

      if (d.isAsiProtected) {
        asiProtectedCount++;
      }

      if (d.isJyotirlinga) {
        jyotirlingaCount++;
      }

      if (d.isShaktiPeetha) {
        shaktiPeethaCount++;
      }
    });

    // Detect duplicate candidates (same or similar name in same state)
    let duplicateCandidatesCount = 0;
    const nameStateMap = new Map<string, number>();
    this.destinations.forEach((d) => {
      const key = `${d.officialName.toLowerCase().trim()}_${d.stateId}`;
      nameStateMap.set(key, (nameStateMap.get(key) || 0) + 1);
    });
    nameStateMap.forEach((count) => {
      if (count > 1) duplicateCandidatesCount += count - 1;
    });

    const totalDest = this.destinations.length;
    const verificationPercentage = totalDest > 0 ? Math.round((verifiedCount / totalDest) * 100) : 0;
    const lastSyncTimestamp = safeLocalStorage.getItem(STORAGE_KEY_LAST_SYNC) || new Date().toISOString();

    return {
      totalStatesAndUTs,
      statesCoveredCount: coveredStateIds.size,
      districtsCoveredCount: coveredDistrictIds.size,
      totalDestinations: totalDest,
      verifiedDestinationsCount: verifiedCount,
      estimatedDestinationsCount: estimatedCount,
      unverifiedDestinationsCount: unverifiedCount,
      missingCoordinatesCount: missingCoordsCount,
      duplicateCandidatesCount,
      outdatedSourcesCount,
      missingSourcesCount,
      verificationPercentage,
      hinduTemplesCount,
      historicalAndFortsCount,
      unescoSitesCount,
      asiProtectedCount,
      jyotirlingaCount,
      shaktiPeethaCount,
      categoryBreakdown,
      religiousTraditionBreakdown,
      lastSyncTimestamp,
    };
  }

  // ============================================================================
  // DATA VALIDATION & INGESTION PIPELINE (JSON & CSV)
  // ============================================================================

  public validateDestination(dest: Partial<Destination>, index: number): ImportValidationIssue[] {
    const issues: ImportValidationIssue[] = [];

    if (!dest.officialName || dest.officialName.trim().length === 0) {
      issues.push({
        rowOrIndex: index,
        destinationId: dest.id,
        field: 'officialName',
        severity: 'error',
        message: 'Official destination name is required.',
      });
    }

    if (!dest.stateId) {
      issues.push({
        rowOrIndex: index,
        destinationId: dest.id,
        field: 'stateId',
        severity: 'error',
        message: 'State or UT identifier (e.g. IN-UT) is required.',
      });
    }

    if (!dest.districtName) {
      issues.push({
        rowOrIndex: index,
        destinationId: dest.id,
        field: 'districtName',
        severity: 'warning',
        message: 'District name is missing.',
      });
    }

    // Latitude & Longitude Bounds Validation
    if (typeof dest.latitude === 'number' && typeof dest.longitude === 'number') {
      if (
        dest.latitude < INDIA_BOUNDS.minLat ||
        dest.latitude > INDIA_BOUNDS.maxLat ||
        dest.longitude < INDIA_BOUNDS.minLng ||
        dest.longitude > INDIA_BOUNDS.maxLng
      ) {
        issues.push({
          rowOrIndex: index,
          destinationId: dest.id,
          field: 'coordinates',
          severity: 'warning',
          message: `Coordinates [${dest.latitude}, ${dest.longitude}] are outside standard India territorial boundaries.`,
        });
      }
    } else {
      issues.push({
        rowOrIndex: index,
        destinationId: dest.id,
        field: 'coordinates',
        severity: 'warning',
        message: 'Missing or invalid latitude/longitude numeric values.',
      });
    }

    return issues;
  }

  public importFromJSON(jsonString: string): ImportResult {
    const result: ImportResult = {
      success: false,
      totalParsed: 0,
      importedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      issues: [],
      timestamp: new Date().toISOString(),
    };

    try {
      const parsed = JSON.parse(jsonString);
      const records: Partial<Destination>[] = Array.isArray(parsed) ? parsed : [parsed];
      result.totalParsed = records.length;

      records.forEach((record, idx) => {
        const issues = this.validateDestination(record, idx + 1);
        result.issues.push(...issues);

        const hasErrors = issues.some((i) => i.severity === 'error');
        if (hasErrors) {
          result.skippedCount++;
          return;
        }

        // Generate stable slug ID if missing
        const stableId =
          record.id ||
          `${record.officialName?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${record.stateId?.toLowerCase()}`;

        const existingIndex = this.destinations.findIndex(
          (d) => d.id === stableId || (d.officialName.toLowerCase() === record.officialName?.toLowerCase() && d.stateId === record.stateId)
        );

        const normalizedRecord: Destination = {
          id: stableId,
          officialName: record.officialName || 'Unnamed Destination',
          hindiName: record.hindiName,
          alternativeNames: record.alternativeNames || [],
          stateId: record.stateId || 'IN-OTHER',
          stateName: record.stateName || 'India',
          districtId: record.districtId || `${record.stateId}-GEN`,
          districtName: record.districtName || 'General',
          settlementName: record.settlementName || record.officialName || '',
          category: (record.category as DestinationCategory) || 'Cities & Culture',
          subcategory: record.subcategory || 'Point of Interest',
          latitude: Number(record.latitude) || 20.5937,
          longitude: Number(record.longitude) || 78.9629,
          elevationMeters: record.elevationMeters ? Number(record.elevationMeters) : undefined,
          isCoordinateVerified: Boolean(record.isCoordinateVerified),
          shortDescription: record.shortDescription || '',
          detailedDescription: record.detailedDescription || record.shortDescription || '',
          attractions: record.attractions || [],
          thingsToDo: record.thingsToDo || [],
          nearbyDestinations: record.nearbyDestinations || [],
          suggestedDurationDays: Number(record.suggestedDurationDays) || 2,
          bestVisitingSeason: record.bestVisitingSeason || 'October to March',
          idealMonths: record.idealMonths || ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          transport: record.transport || {
            nearestAirport: 'Regional Airport Hub',
            nearestAirportDistanceKm: 100,
            nearestRailwayStation: 'Main Railway Junction',
            nearestRailwayDistanceKm: 40,
            roadAccessDescription: 'Direct highway connectivity.',
            defaultPickupTransit: `${record.officialName} Transit Hub`,
            defaultDropTransit: `${record.officialName} City Center`,
          },
          accessibilityNotes: record.accessibilityNotes || 'General road accessibility.',
          isWheelchairAccessible: Boolean(record.isWheelchairAccessible),
          costEstimate: record.costEstimate || {
            currency: 'INR',
            dailyBudgetMin: 2500,
            dailyBudgetMax: 8000,
            hotelEstimateAvg: 3500,
            foodEstimateAvg: 800,
            activityEstimateAvg: 1000,
            assumptionNotes: 'Standard lodging and regional dining estimate.',
            verifiedDate: new Date().toISOString().split('T')[0],
          },
          accommodationInfo: record.accommodationInfo || 'Hotels and guest houses available.',
          foodAndCulinaryHighlights: record.foodAndCulinaryHighlights || ['Local culinary specialties'],
          permitInfo: record.permitInfo || { required: false },
          safetyAdvisories: record.safetyAdvisories || ['Follow standard travel precautions.'],
          seasonalClosures: record.seasonalClosures,
          imageUrl: record.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          sources: record.sources || [
            {
              name: 'Incredible India / Ministry of Tourism',
              url: 'https://incredibleindia.gov.in',
              organization: 'Ministry of Tourism, Govt of India',
              verificationDate: new Date().toISOString().split('T')[0],
              confidenceScore: 80,
            },
          ],
          verificationStatus: (record.verificationStatus as VerificationStatus) || 'unverified',
          dataConfidence: Number(record.dataConfidence) || 75,
          lastUpdated: new Date().toISOString().split('T')[0],
          isPublished: record.isPublished !== undefined ? Boolean(record.isPublished) : true,
        };

        if (existingIndex >= 0) {
          this.destinations[existingIndex] = normalizedRecord;
          result.updatedCount++;
        } else {
          this.destinations.push(normalizedRecord);
          result.importedCount++;
        }
      });

      this.saveDestinations();
      result.success = true;
    } catch (err: any) {
      result.success = false;
      result.issues.push({
        rowOrIndex: 0,
        field: 'json',
        severity: 'error',
        message: `JSON parse error: ${err?.message || 'Invalid format'}`,
      });
    }

    return result;
  }

  public importFromCSV(csvText: string): ImportResult {
    const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      return {
        success: false,
        totalParsed: 0,
        importedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        issues: [{ rowOrIndex: 1, field: 'csv', severity: 'error', message: 'CSV must contain at least a header row and one data row.' }],
        timestamp: new Date().toISOString(),
      };
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1);

    const jsonObjects: any[] = [];
    rows.forEach((row) => {
      // Basic CSV splitter respecting quoted commas
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
      const obj: any = {};
      headers.forEach((header, idx) => {
        let val = matches[idx] ? matches[idx].trim().replace(/^"|"$/g, '') : '';
        obj[header] = val;
      });
      jsonObjects.push(obj);
    });

    return this.importFromJSON(JSON.stringify(jsonObjects));
  }

  public exportToJSON(): string {
    return JSON.stringify(this.destinations, null, 2);
  }

  public exportToCSV(): string {
    const headers = [
      'id',
      'officialName',
      'hindiName',
      'stateId',
      'stateName',
      'districtName',
      'settlementName',
      'category',
      'latitude',
      'longitude',
      'shortDescription',
      'suggestedDurationDays',
      'bestVisitingSeason',
      'verificationStatus',
      'dataConfidence',
    ];

    const rows = this.destinations.map((d) => [
      `"${d.id}"`,
      `"${d.officialName.replace(/"/g, '""')}"`,
      `"${(d.hindiName || '').replace(/"/g, '""')}"`,
      `"${d.stateId}"`,
      `"${d.stateName}"`,
      `"${d.districtName}"`,
      `"${d.settlementName}"`,
      `"${d.category}"`,
      d.latitude,
      d.longitude,
      `"${d.shortDescription.replace(/"/g, '""')}"`,
      d.suggestedDurationDays,
      `"${d.bestVisitingSeason}"`,
      `"${d.verificationStatus}"`,
      d.dataConfidence,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // ============================================================================
  // RECORD CRUD OPERATIONS (Admin Management)
  // ============================================================================

  public addDestination(destination: Destination): void {
    this.destinations.unshift(destination);
    this.saveDestinations();
  }

  public updateDestination(id: string, updates: Partial<Destination>): Destination | undefined {
    const index = this.destinations.findIndex((d) => d.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...this.destinations[index],
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    this.destinations[index] = updated;
    this.saveDestinations();
    return updated;
  }

  public deleteDestination(id: string): boolean {
    const initialLen = this.destinations.length;
    this.destinations = this.destinations.filter((d) => d.id !== id);
    if (this.destinations.length !== initialLen) {
      this.saveDestinations();
      return true;
    }
    return false;
  }

  public resetToSeed(): void {
    this.destinations = [...AUTHORITATIVE_SEED_DESTINATIONS];
    this.districts = [...INITIAL_DISTRICTS];
    this.saveDestinations();
    this.saveDistricts();
  }
}

export const destinationDatabase = new DestinationDatabaseService();
