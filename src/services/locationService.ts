/**
 * SAFRO Location Service
 * High-accuracy device GPS tracking, distance calculation & off-route detection
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  private watchId: number | null = null;
  private lastKnownLocation: LocationCoordinates | null = null;
  private smoothedLocation: LocationCoordinates | null = null;
  private lastSmoothedHeading: number | null = null;
  private lastRouteIndexCache: number = 0;

  /**
   * Check if browser supports Geolocation API
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  /**
   * Smooths incoming raw GPS coordinates using adaptive moving average
   * to eliminate stationary jitter while preserving responsive turns.
   */
  private applySmoothing(raw: LocationCoordinates): LocationCoordinates {
    if (!this.smoothedLocation) {
      this.smoothedLocation = { ...raw };
      this.lastSmoothedHeading = raw.heading ?? null;
      return raw;
    }

    const prev = this.smoothedLocation;
    const distMoved = this.calculateDistance(prev.latitude, prev.longitude, raw.latitude, raw.longitude);
    const dt = Math.max(0.1, (raw.timestamp - prev.timestamp) / 1000);

    // Adaptive smoothing factor:
    // If movement is very small (< 4m) and accuracy is low, dampen heavily to stop jitter.
    // If moving fast (> 15m), track closely with minimal lag.
    let alpha = 0.55;
    if (distMoved < 3) {
      alpha = 0.25; // heavy stationary damping
    } else if (distMoved > 25) {
      alpha = 0.90; // fast tracking
    }

    const smoothedLat = prev.latitude + alpha * (raw.latitude - prev.latitude);
    const smoothedLng = prev.longitude + alpha * (raw.longitude - prev.longitude);

    // Speed calculation:
    // If movement is under 2.5m (GPS stationary jitter) or raw.speed is below 0.6 m/s (~2 km/h), user is stationary!
    let computedSpeed = 0;
    if (distMoved >= 2.5) {
      if (raw.speed !== null && raw.speed !== undefined && !isNaN(raw.speed) && raw.speed > 0.5) {
        computedSpeed = raw.speed * 3.6; // convert m/s to km/h
      } else {
        computedSpeed = (distMoved / dt) * 3.6; // derived displacement speed
      }
    } else {
      computedSpeed = 0; // Strictly 0 km/h when user is not moving
    }

    // Heading calculation & circular low-pass filter
    let rawHeading = raw.heading;
    if ((rawHeading === null || rawHeading === undefined || isNaN(rawHeading)) && distMoved > 2.5) {
      rawHeading = this.calculateBearing(prev.latitude, prev.longitude, raw.latitude, raw.longitude);
    }

    let smoothedHeading = this.lastSmoothedHeading;
    if (rawHeading !== null && rawHeading !== undefined && !isNaN(rawHeading)) {
      if (smoothedHeading === null) {
        smoothedHeading = rawHeading;
      } else {
        // Shortest angular delta to prevent 360/0 wrap glitches
        let diff = ((rawHeading - smoothedHeading + 540) % 360) - 180;
        smoothedHeading = (smoothedHeading + 0.35 * diff + 360) % 360;
      }
      this.lastSmoothedHeading = smoothedHeading;
    }

    const result: LocationCoordinates = {
      latitude: smoothedLat,
      longitude: smoothedLng,
      accuracy: raw.accuracy,
      altitude: raw.altitude,
      heading: smoothedHeading,
      speed: Math.max(0, computedSpeed),
      timestamp: raw.timestamp,
    };

    this.smoothedLocation = result;
    return result;
  }

  /**
   * Reset smoothing cache (e.g. on new trip start or destination change)
   */
  resetSmoothing(): void {
    this.smoothedLocation = null;
    this.lastSmoothedHeading = null;
    this.lastRouteIndexCache = 0;
  }

  /**
   * Get single GPS position with high accuracy
   */
  getCurrentLocation(
    timeoutMs: number = 10000
  ): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        return reject({
          code: 0,
          message: 'Geolocation is not supported by your browser/device.',
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const rawLoc: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };
          const loc = this.applySmoothing(rawLoc);
          this.lastKnownLocation = loc;
          resolve(loc);
        },
        (error) => {
          reject({
            code: error.code,
            message: this.getErrorMessage(error),
          });
        },
        {
          enableHighAccuracy: true,
          timeout: timeoutMs,
          maximumAge: 3000,
        }
      );
    });
  }

  /**
   * Start watching GPS position continuously with smoothing
   */
  watchLocation(
    onLocation: (loc: LocationCoordinates) => void,
    onError: (err: LocationError) => void,
    options?: PositionOptions
  ): number | null {
    if (!this.isSupported()) {
      onError({
        code: 0,
        message: 'Geolocation is not supported by your browser/device.',
      });
      return null;
    }

    // Clear any existing watcher
    this.stopWatching();

    const config: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 15000,
      ...options,
    };

    try {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const rawLoc: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };
          const smoothed = this.applySmoothing(rawLoc);
          this.lastKnownLocation = smoothed;
          onLocation(smoothed);
        },
        (error) => {
          onError({
            code: error.code,
            message: this.getErrorMessage(error),
          });
        },
        config
      );
      return this.watchId;
    } catch (e) {
      onError({
        code: -1,
        message: 'Failed to start GPS location watch.',
      });
      return null;
    }
  }

  /**
   * Stop watching GPS position
   */
  stopWatching(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Returns the cached last known location
   */
  getLastKnownLocation(): LocationCoordinates | null {
    return this.lastKnownLocation;
  }

  /**
   * Calculate distance between two coordinates in meters using the Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate bearing (heading direction 0-360°) from point A to point B
   */
  calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360; // In degrees 0-360
  }

  /**
   * Interpolate linearly between two coordinates
   */
  interpolateCoords(
    from: [number, number],
    to: [number, number],
    ratio: number
  ): [number, number] {
    const clamped = Math.max(0, Math.min(1, ratio));
    return [
      from[0] + (to[0] - from[0]) * clamped,
      from[1] + (to[1] - from[1]) * clamped,
    ];
  }

  /**
   * Check if current position is off the planned route with fast spatial bounding check
   */
  isOffRoute(
    currentPos: [number, number],
    routeWaypoints: [number, number][],
    thresholdMeters: number = 75
  ): boolean {
    if (!routeWaypoints || routeWaypoints.length < 2) return false;

    const [cLat, cLon] = currentPos;
    // Bounding degree delta (~100m in lat/lon space)
    const latDelta = (thresholdMeters * 1.8) / 111320;
    const lonDelta = (thresholdMeters * 1.8) / (111320 * Math.cos((cLat * Math.PI) / 180));

    let minDistance = Infinity;

    // Search around cached last index first for fast O(1) response
    const startIndex = Math.max(0, this.lastRouteIndexCache - 5);
    const endIndex = Math.min(routeWaypoints.length - 1, this.lastRouteIndexCache + 20);

    for (let i = startIndex; i < endIndex; i++) {
      const p1 = routeWaypoints[i];
      const p2 = routeWaypoints[i + 1];

      // Fast AABB check
      const minSegLat = Math.min(p1[0], p2[0]) - latDelta;
      const maxSegLat = Math.max(p1[0], p2[0]) + latDelta;
      const minSegLon = Math.min(p1[1], p2[1]) - lonDelta;
      const maxSegLon = Math.max(p1[1], p2[1]) + lonDelta;

      if (cLat >= minSegLat && cLat <= maxSegLat && cLon >= minSegLon && cLon <= maxSegLon) {
        const dist = this.distanceToSegment(cLat, cLon, p1[0], p1[1], p2[0], p2[1]);
        if (dist < minDistance) {
          minDistance = dist;
          this.lastRouteIndexCache = i;
        }
      }
    }

    // If not found in local window, scan entire route as fallback
    if (minDistance > thresholdMeters) {
      for (let i = 0; i < routeWaypoints.length - 1; i++) {
        const p1 = routeWaypoints[i];
        const p2 = routeWaypoints[i + 1];
        const dist = this.distanceToSegment(cLat, cLon, p1[0], p1[1], p2[0], p2[1]);
        if (dist < minDistance) {
          minDistance = dist;
          this.lastRouteIndexCache = i;
        }
      }
    }

    return minDistance > thresholdMeters;
  }

  /**
   * Computes vehicle progress along a polyline route:
   * Returns remaining distance in meters, closest waypoint index, and progress percentage.
   */
  calculateRouteProgress(
    currentPos: [number, number],
    routeWaypoints: [number, number][]
  ): {
    closestIndex: number;
    remainingDistanceMeters: number;
    totalDistanceMeters: number;
    progressFraction: number;
  } {
    if (!routeWaypoints || routeWaypoints.length < 2) {
      return {
        closestIndex: 0,
        remainingDistanceMeters: 0,
        totalDistanceMeters: 0,
        progressFraction: 0,
      };
    }

    let closestIdx = 0;
    let minD = Infinity;
    const [cLat, cLon] = currentPos;

    for (let i = 0; i < routeWaypoints.length; i++) {
      const d = this.calculateDistance(cLat, cLon, routeWaypoints[i][0], routeWaypoints[i][1]);
      if (d < minD) {
        minD = d;
        closestIdx = i;
      }
    }

    // Calculate total route distance
    let totalDist = 0;
    for (let i = 0; i < routeWaypoints.length - 1; i++) {
      totalDist += this.calculateDistance(
        routeWaypoints[i][0],
        routeWaypoints[i][1],
        routeWaypoints[i + 1][0],
        routeWaypoints[i + 1][1]
      );
    }

    // Calculate remaining distance from current vehicle to end
    let remaining = minD;
    for (let i = closestIdx; i < routeWaypoints.length - 1; i++) {
      remaining += this.calculateDistance(
        routeWaypoints[i][0],
        routeWaypoints[i][1],
        routeWaypoints[i + 1][0],
        routeWaypoints[i + 1][1]
      );
    }

    const progressFraction = totalDist > 0 ? Math.max(0, Math.min(1, (totalDist - remaining) / totalDist)) : 0;

    return {
      closestIndex: closestIdx,
      remainingDistanceMeters: Math.max(0, remaining),
      totalDistanceMeters: totalDist,
      progressFraction,
    };
  }

  /**
   * Distance in meters from point P to line segment AB
   */
  private distanceToSegment(
    pLat: number,
    pLon: number,
    aLat: number,
    aLon: number,
    bLat: number,
    bLon: number
  ): number {
    const dAB = this.calculateDistance(aLat, aLon, bLat, bLon);
    if (dAB === 0) return this.calculateDistance(pLat, pLon, aLat, aLon);

    const dAP = this.calculateDistance(aLat, aLon, pLat, pLon);
    const dBP = this.calculateDistance(bLat, bLon, pLat, pLon);

    // If point is beyond ends, return distance to nearest endpoint
    if (dAP * dAP > dBP * dBP + dAB * dAB) return dBP;
    if (dBP * dBP > dAP * dAP + dAB * dAB) return dAP;

    // Heron's formula for perpendicular distance
    const s = (dAB + dAP + dBP) / 2;
    const area = Math.sqrt(Math.max(0, s * (s - dAB) * (s - dAP) * (s - dBP)));
    return (2 * area) / dAB;
  }

  private getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission was denied. Please allow location access in your browser.';
      case error.POSITION_UNAVAILABLE:
        return 'GPS position unavailable. Please ensure location services are enabled.';
      case error.TIMEOUT:
        return 'Location request timed out. Retrying GPS connection...';
      default:
        return error.message || 'An unknown location error occurred.';
    }
  }
}

export const locationService = new LocationService();
