import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Navigation,
  Compass,
  Layers,
  MapPin,
  Search,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Locate,
  LocateFixed,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  RotateCcw,
  Navigation2,
  Clock,
  Car,
  X,
  RefreshCw,
  Play,
  Pause,
  Gauge,
  Box,
} from 'lucide-react';
import { locationService, LocationCoordinates } from '../../services/locationService';
import { routingService, RouteResult, DirectionsResponse } from '../../services/routingService';
import { geocodingService, PlaceSearchResult } from '../../services/geocodingService';
import { GOOGLE_MAPS_API_KEY, loadGoogleMaps } from '../../services/googleMapsLoader';

// Configure MapLibre Web Worker for Vite
if (typeof (maplibregl as any).setWorkerUrl === 'function' && !(maplibregl as any).getWorkerUrl()) {
  (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
}

// Google Maps API Key from environment or loader
const MAPS_API_KEY = GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// High-definition tile layer configuration powered by Google Maps API / MapLibre
function createMapLibreStyle(layerType: 'streets' | 'satellite' | 'terrain'): maplibregl.StyleSpecification {
  let tiles: string[];
  if (MAPS_API_KEY) {
    const lyrs = layerType === 'satellite' ? 'y' : layerType === 'terrain' ? 'p' : 'm';
    tiles = [
      `https://mt0.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}&key=${MAPS_API_KEY}`,
      `https://mt1.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}&key=${MAPS_API_KEY}`,
      `https://mt2.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}&key=${MAPS_API_KEY}`,
      `https://mt3.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}&key=${MAPS_API_KEY}`,
    ];
  } else {
    if (layerType === 'satellite') {
      tiles = ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'];
    } else if (layerType === 'terrain') {
      tiles = ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'];
    } else {
      tiles = [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      ];
    }
  }

  return {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles,
        tileSize: 256,
        attribution: MAPS_API_KEY ? '&copy; Google Maps' : '&copy; OpenStreetMap contributors &copy; CARTO',
      },
    },
    layers: [
      {
        id: 'raster-tiles-layer',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  };
}

export interface LiveTrackingStats {
  currentPos: [number, number];
  currentSpeedKmH: number;
  currentHeading: number;
  remainingDistanceKm: number;
  remainingDistanceFormatted: string;
  remainingDurationMin: number;
  etaFormatted: string;
  progressPercent: number;
  isOffRoute: boolean;
  nextStepInstruction?: string;
  nextStepDistanceFormatted?: string;
  isSimulating: boolean;
  gpsStatus: 'active' | 'requesting' | 'denied' | 'simulated';
}

export interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  vehiclePos?: [number, number];
  destinationPos?: [number, number];
  waypoints?: [number, number][];
  showAlternativeRoute?: boolean;
  onAcceptAlternative?: () => void;
  destinationName?: string;
  delayMinutes?: number;
  height?: string;
  interactive?: boolean;
  enableLiveGps?: boolean;
  onRouteCalculated?: (route: RouteResult) => void;
  onArrival?: () => void;
  onProgressUpdate?: (stats: LiveTrackingStats) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center = [32.2798, 77.1685],
  zoom = 16,
  vehiclePos = [32.2798, 77.1685],
  destinationPos: initialDestPos = [32.3168, 77.1578],
  destinationName: initialDestName = 'Solang Valley Adventure Point',
  waypoints = [],
  delayMinutes = 26,
  height = '520px',
  interactive = true,
  enableLiveGps = true,
  onRouteCalculated,
  onArrival,
  onProgressUpdate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  // Markers references
  const userMarkerRef = useRef<MapLibreMarker | null>(null);
  const destMarkerRef = useRef<MapLibreMarker | null>(null);

  // 3D Navigation Camera States
  const [is3DMode, setIs3DMode] = useState<boolean>(true); // Default to 3D Google Maps Navigation mode
  const [isNavigating, setIsNavigating] = useState<boolean>(true); // Active navigation HUD
  const [isAutoFollowing, setIsAutoFollowing] = useState<boolean>(true);

  // Core States
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(vehiclePos);
  const [currentHeading, setCurrentHeading] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [routeProgress, setRouteProgress] = useState<number>(0);
  const [destination, setDestination] = useState<[number, number]>(initialDestPos);
  const [destinationName, setDestinationName] = useState<string>(initialDestName);

  // Route states
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [altRouteInfo, setAltRouteInfo] = useState<RouteResult | null>(null);
  const [activeRouteType, setActiveRouteType] = useState<'primary' | 'alternative'>('primary');
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'active' | 'denied' | 'simulated'>('requesting');

  // Live Drive Simulation Mode
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);
  const simIntervalRef = useRef<number | null>(null);
  const simProgressIndexRef = useRef<number>(0);

  // Map Controls State
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Destination Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Debounce tracker
  const lastRecalculateTime = useRef<number>(0);

  // Stable mutable refs for persistent GPS stream
  const is3DModeRef = useRef(is3DMode);
  is3DModeRef.current = is3DMode;

  const isAutoFollowingRef = useRef(isAutoFollowing);
  isAutoFollowingRef.current = isAutoFollowing;

  const destinationRef = useRef(destination);
  destinationRef.current = destination;

  const routeInfoRef = useRef(routeInfo);
  routeInfoRef.current = routeInfo;

  const hasArrivedRef = useRef(hasArrived);
  hasArrivedRef.current = hasArrived;

  const onArrivalRef = useRef(onArrival);
  onArrivalRef.current = onArrival;

  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;

  // Preload Google Maps JS SDK when API key is available
  useEffect(() => {
    if (MAPS_API_KEY) {
      loadGoogleMaps(MAPS_API_KEY).catch(() => {});
    }
  }, []);

  // Custom 3D Vehicle Navigation Puck DOM Element (Google Maps Navigation Style)
  const createVehicleMarkerElement = () => {
    const el = document.createElement('div');
    el.className = 'safro-3d-vehicle-marker';
    el.style.width = '52px';
    el.style.height = '52px';
    el.style.position = 'relative';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';

    el.innerHTML = `
      <div style="position: absolute; width: 52px; height: 52px; border-radius: 50%; background: rgba(18, 103, 214, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 34px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.35); transform: translateY(14px); filter: blur(3px);"></div>
      <div id="safro-nav-chevron-core" style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.35); border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; transform: rotate(0deg); transition: transform 0.25s ease-out;">
        <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #1267D6 0%, #062B5C 100%); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 3px rgba(255,255,255,0.45);">
          <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: #ffffff; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));">
            <path d="M12 2L3 21l9-4.5 9 4.5L12 2z" />
          </svg>
        </div>
      </div>
    `;
    return el;
  };

  // Destination Target Marker DOM Element
  const createDestinationMarkerElement = () => {
    const el = document.createElement('div');
    el.className = 'safro-dest-marker';
    el.style.width = '36px';
    el.style.height = '46px';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.cursor = 'pointer';

    el.innerHTML = `
      <div style="width: 32px; height: 32px; border-radius: 50% 50% 50% 0; background: #E11D48; transform: rotate(-45deg); box-shadow: 0 8px 18px rgba(225,29,72,0.45); display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffffff; transform: rotate(45deg);"></div>
      </div>
      <div style="width: 16px; height: 5px; border-radius: 50%; background: rgba(0,0,0,0.35); filter: blur(2px); margin-top: 2px;"></div>
    `;
    return el;
  };

  // Helper: Setup Route Vector Layers on MapLibre
  const setupRouteLayers = (map: MapLibreMap) => {
    if (!map.getSource('primary-route')) {
      map.addSource('primary-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
          properties: {},
        },
      });

      // 3D Route Casing with Glow
      map.addLayer({
        id: 'primary-route-casing',
        type: 'line',
        source: 'primary-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#062B5C',
          'line-width': 11,
          'line-opacity': 0.55,
        },
      });

      // 3D Navigation Route Blue Core
      map.addLayer({
        id: 'primary-route-line',
        type: 'line',
        source: 'primary-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#1267D6',
          'line-width': 7.5,
        },
      });
    }

    if (!map.getSource('alt-route')) {
      map.addSource('alt-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
          properties: {},
        },
      });

      map.addLayer({
        id: 'alt-route-line',
        type: 'line',
        source: 'alt-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#10B981',
          'line-width': 5.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.85,
        },
      });
    }
  };

  // Helper: Update GeoJSON data of routes
  const updateRouteData = useCallback(
    (primaryCoords: [number, number][], altCoords?: [number, number][]) => {
      const map = mapRef.current;
      if (!map) return;

      const primarySource = map.getSource('primary-route') as maplibregl.GeoJSONSource;
      if (primarySource) {
        primarySource.setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: primaryCoords.map(([lat, lng]) => [lng, lat]),
          },
          properties: {},
        });
      }

      const altSource = map.getSource('alt-route') as maplibregl.GeoJSONSource;
      if (altSource) {
        altSource.setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: (altCoords || []).map(([lat, lng]) => [lng, lat]),
          },
          properties: {},
        });
      }
    },
    []
  );

  // Smooth 3D Camera & Marker Update (Google Maps Following Mode)
  const updateCameraAndMarker = useCallback((newPos: [number, number], heading: number) => {
    // 1. Move vehicle marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([newPos[1], newPos[0]]);
    }

    // 2. Rotate 3D Chevron Arrow:
    // In 3D Navigation mode, the map rotates to heading so chevron points UP.
    // In 2D North-Up mode, map is fixed to North and chevron rotates to heading.
    const chevronEl = document.getElementById('safro-nav-chevron-core');
    if (chevronEl) {
      if (is3DModeRef.current) {
        chevronEl.style.transform = 'rotate(0deg)';
      } else {
        chevronEl.style.transform = `rotate(${heading}deg)`;
      }
    }

    // 3. Smooth Camera Follow (Tilted 3D Google Maps Perspective)
    if (isAutoFollowingRef.current && mapRef.current) {
      mapRef.current.easeTo({
        center: [newPos[1], newPos[0]],
        pitch: is3DModeRef.current ? 60 : 0, // 60° 3D Tilt perspective!
        bearing: is3DModeRef.current ? heading : 0, // Rotates with driving direction!
        duration: 700,
        easing: (t) => t,
      });
    }
  }, []);

  // 1. Initialize MapLibre 3D WebGL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const initialStyle = createMapLibreStyle(mapLayer);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [currentLocation[1], currentLocation[0]], // [lng, lat]
      zoom: 16.5,
      pitch: is3DMode ? 60 : 0, // 3D Camera tilt
      bearing: currentHeading,
      attributionControl: false,
      dragRotate: true,
      touchPitch: true,
    });

    map.on('load', () => {
      setupRouteLayers(map);

      // Create 3D Vehicle Marker
      const vehicleEl = createVehicleMarkerElement();
      const userMarker = new maplibregl.Marker({
        element: vehicleEl,
        anchor: 'center',
      })
        .setLngLat([currentLocation[1], currentLocation[0]])
        .addTo(map);
      userMarkerRef.current = userMarker;

      // Create Destination Target Marker
      if (destination) {
        const destEl = createDestinationMarkerElement();
        const destMarker = new maplibregl.Marker({
          element: destEl,
          anchor: 'bottom',
        })
          .setLngLat([destination[1], destination[0]])
          .addTo(map);
        destMarkerRef.current = destMarker;
      }

      // Initial route calculate
      if (destination) {
        calculateAndRenderRoute(currentLocation, destination);
      }
    });

    // Detect user manual interaction to pause auto-following
    map.on('dragstart', () => {
      setIsAutoFollowing(false);
    });
    map.on('rotatestart', () => {
      setIsAutoFollowing(false);
    });

    // Interactive click anywhere to pick new destination
    if (interactive) {
      map.on('click', async (e) => {
        const clickedLng = e.lngLat.lng;
        const clickedLat = e.lngLat.lat;
        setDestination([clickedLat, clickedLng]);

        const placeName = await geocodingService.reverseGeocode(clickedLat, clickedLng);
        const shortName = placeName.split(',')[0] || 'Selected Location';
        setDestinationName(shortName);
        setHasArrived(false);
        simProgressIndexRef.current = 0;
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle Layer Style Switching
  useEffect(() => {
    if (!mapRef.current) return;
    const newStyle = createMapLibreStyle(mapLayer);
    mapRef.current.setStyle(newStyle);
    mapRef.current.once('style.load', () => {
      if (mapRef.current) {
        setupRouteLayers(mapRef.current);
        if (routeInfo) {
          updateRouteData(routeInfo.coordinates, altRouteInfo?.coordinates);
        }
      }
    });
  }, [mapLayer]);

  // 3. Persistent Live Geolocation Watcher
  useEffect(() => {
    if (!enableLiveGps || isSimulating) {
      if (!enableLiveGps) setGpsStatus('simulated');
      return;
    }

    let isMounted = true;

    const handleGpsUpdate = (loc: LocationCoordinates) => {
      if (!isMounted) return;
      const newPos: [number, number] = [loc.latitude, loc.longitude];
      setCurrentLocation(newPos);
      const heading = loc.heading ?? 0;
      setCurrentHeading(heading);
      const speed = Math.max(0, Math.round(loc.speed || 0));
      setCurrentSpeed(speed);
      setGpsStatus('active');

      // Update 3D Camera & Marker
      updateCameraAndMarker(newPos, heading);

      // Check arrival (< 35 meters)
      const currentDest = destinationRef.current;
      if (currentDest) {
        const distToDest = locationService.calculateDistance(
          newPos[0],
          newPos[1],
          currentDest[0],
          currentDest[1]
        );
        if (distToDest < 35 && !hasArrivedRef.current) {
          setHasArrived(true);
          onArrivalRef.current?.();
        }
      }

      // Check route progress & off-route
      const currentRoute = routeInfoRef.current;
      if (currentRoute && currentRoute.coordinates.length > 0) {
        const progress = locationService.calculateRouteProgress(newPos, currentRoute.coordinates);
        setRouteProgress(Math.round(progress.progressFraction * 100));

        onProgressUpdateRef.current?.({
          currentPos: newPos,
          currentSpeedKmH: speed,
          currentHeading: heading,
          remainingDistanceKm: Math.round(progress.remainingDistanceMeters / 100) / 10,
          remainingDistanceFormatted: routingService.formatDistance(progress.remainingDistanceMeters),
          remainingDurationMin: Math.max(1, Math.round(progress.remainingDistanceMeters / ((Math.max(25, speed) * 1000) / 60))),
          etaFormatted: currentRoute.etaFormatted,
          progressPercent: Math.round(progress.progressFraction * 100),
          isOffRoute: false,
          nextStepInstruction: currentRoute.steps?.[0]?.instruction,
          nextStepDistanceFormatted: routingService.formatDistance(currentRoute.steps?.[0]?.distanceMeters || 300),
          isSimulating: false,
          gpsStatus: 'active',
        });

        // Recalculate if off-route (>75m)
        const isOff = locationService.isOffRoute(newPos, currentRoute.coordinates, 75);
        const now = Date.now();
        if (isOff && now - lastRecalculateTime.current > 7000) {
          lastRecalculateTime.current = now;
          if (currentDest) calculateAndRenderRoute(newPos, currentDest);
        }
      }
    };

    const handleGpsError = (err: any) => {
      if (!isMounted) return;
      console.warn('GPS notice:', err.message);
      setGpsStatus('denied');
    };

    const watchId = locationService.watchLocation(handleGpsUpdate, handleGpsError);
    locationService.getCurrentLocation(8000).then(handleGpsUpdate).catch(handleGpsError);

    return () => {
      isMounted = false;
      if (watchId !== null) {
        locationService.stopWatching();
      }
    };
  }, [enableLiveGps, isSimulating, updateCameraAndMarker]);

  const currentActiveRoute = activeRouteType === 'primary' ? routeInfo : altRouteInfo || routeInfo;

  // 4. Live 3D Route Simulation Drive Engine
  useEffect(() => {
    if (!isSimulating) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      return;
    }

    const currentCoords = currentActiveRoute?.coordinates || waypoints || [];
    if (currentCoords.length < 2) return;

    if (simProgressIndexRef.current >= currentCoords.length - 1) {
      simProgressIndexRef.current = 0;
    }

    const tickMs = Math.max(120, Math.floor(750 / simSpeedMultiplier));

    simIntervalRef.current = window.setInterval(() => {
      const idx = simProgressIndexRef.current;
      if (idx >= currentCoords.length - 1) {
        setHasArrived(true);
        setIsSimulating(false);
        onArrivalRef.current?.();
        return;
      }

      const p1 = currentCoords[idx];
      const p2 = currentCoords[idx + 1];
      const bearing = locationService.calculateBearing(p1[0], p1[1], p2[0], p2[1]);
      const simSpeed = Math.round(48 * (0.9 + Math.random() * 0.2));

      simProgressIndexRef.current = idx + 1;
      setCurrentLocation(p2);
      setCurrentHeading(bearing);
      setCurrentSpeed(simSpeed);

      // Smooth 3D Camera & Marker Update
      updateCameraAndMarker(p2, bearing);

      // Calculate progress & ETA
      const progress = locationService.calculateRouteProgress(p2, currentCoords);
      const pct = Math.round(progress.progressFraction * 100);
      setRouteProgress(pct);

      const remMin = Math.max(1, Math.round(progress.remainingDistanceMeters / ((simSpeed * 1000) / 60)));
      const etaStr = routingService.calculateEta(remMin * 60);

      onProgressUpdateRef.current?.({
        currentPos: p2,
        currentSpeedKmH: simSpeed,
        currentHeading: bearing,
        remainingDistanceKm: Math.round(progress.remainingDistanceMeters / 100) / 10,
        remainingDistanceFormatted: routingService.formatDistance(progress.remainingDistanceMeters),
        remainingDurationMin: remMin,
        etaFormatted: etaStr,
        progressPercent: pct,
        isOffRoute: false,
        nextStepInstruction: currentActiveRoute?.steps?.[0]?.instruction,
        nextStepDistanceFormatted: routingService.formatDistance(progress.remainingDistanceMeters),
        isSimulating: true,
        gpsStatus: 'simulated',
      });
    }, tickMs);

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, [isSimulating, simSpeedMultiplier, currentActiveRoute, waypoints, updateCameraAndMarker]);

  // 5. Calculate Road Route (via RoutingService)
  const calculateAndRenderRoute = useCallback(
    async (origin: [number, number], dest: [number, number]) => {
      if (!mapRef.current) return;
      setIsRecalculating(true);

      try {
        const directions: DirectionsResponse = await routingService.calculateRoute(
          origin,
          dest,
          true
        );

        const primary = directions.primaryRoute;
        setRouteInfo(primary);
        setAltRouteInfo(directions.alternativeRoute || null);
        if (onRouteCalculated) onRouteCalculated(primary);

        updateRouteData(primary.coordinates, directions.alternativeRoute?.coordinates);

        // Update Destination Marker position
        if (destMarkerRef.current) {
          destMarkerRef.current.setLngLat([dest[1], dest[0]]);
        }

        // Fit camera to route bounds initially if not in tight driving follow
        if (!isNavigating && primary.coordinates.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          primary.coordinates.forEach(([lat, lng]) => bounds.extend([lng, lat]));
          mapRef.current.fitBounds(bounds, {
            padding: 80,
            pitch: is3DMode ? 60 : 0,
            duration: 900,
          });
        }
      } catch (err) {
        console.error('Error drawing road route:', err);
      } finally {
        setIsRecalculating(false);
      }
    },
    [isNavigating, is3DMode, onRouteCalculated, updateRouteData]
  );

  // Recalculate route on destination change
  useEffect(() => {
    if (currentLocation && destination) {
      calculateAndRenderRoute(currentLocation, destination);
    }
  }, [destination]);

  // Destination Search Handler
  const handleSearchInputChange = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);
    try {
      const results = await geocodingService.searchPlaces(val, 5);
      setSearchResults(results);
    } catch (e) {
      console.warn('Place search notice:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (place: PlaceSearchResult) => {
    setDestination([place.latitude, place.longitude]);
    setDestinationName(place.name);
    setSearchQuery(place.name);
    setShowSearchDropdown(false);
    setHasArrived(false);
    simProgressIndexRef.current = 0;
  };

  // Toggle 3D Driving Perspective vs 2D Flat Overview
  const toggle3DMode = () => {
    const nextMode = !is3DMode;
    setIs3DMode(nextMode);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: nextMode ? 60 : 0,
        bearing: nextMode ? currentHeading : 0,
        duration: 800,
      });
    }
  };

  // Re-center on vehicle
  const handleRecenter = () => {
    setIsAutoFollowing(true);
    if (mapRef.current && currentLocation) {
      mapRef.current.easeTo({
        center: [currentLocation[1], currentLocation[0]],
        pitch: is3DMode ? 60 : 0,
        bearing: is3DMode ? currentHeading : 0,
        zoom: 16.5,
        duration: 800,
      });
    }
  };

  // Reset North (Bearing to 0)
  const handleResetNorth = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        bearing: 0,
        duration: 500,
      });
    }
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Maneuver Turn Arrow Icon selection (Google Maps Style)
  const getManeuverIcon = (instruction: string) => {
    const text = (instruction || '').toLowerCase();
    if (text.includes('right')) return <CornerUpRight className="w-8 h-8 text-white" />;
    if (text.includes('left')) return <CornerUpLeft className="w-8 h-8 text-white" />;
    if (text.includes('u-turn')) return <RotateCcw className="w-8 h-8 text-white" />;
    return <ArrowUp className="w-8 h-8 text-white" />;
  };

  return (
    <div
      className={`relative isolate z-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 !z-50 rounded-none w-screen h-screen' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* 1. WebGL 3D MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-900" />

      {/* 2. Top Trip Route Progress Bar */}
      {routeProgress > 0 && (
        <div className="absolute top-0 left-0 right-0 z-30 h-1.5 bg-slate-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1267D6] via-cyan-400 to-[#19A974] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, routeProgress))}%` }}
          />
        </div>
      )}

      {/* 3. Top Google Maps Turn-by-Turn 3D Navigation Banner (Prominent Driving Guidance) */}
      {isNavigating && (
        <div className="absolute top-3.5 left-3.5 right-3.5 sm:left-4 sm:max-w-md z-30 animate-in slide-in-from-top duration-300">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#031D3D]/98 via-[#062B5C]/98 to-[#0B3D7B]/98 backdrop-blur-md text-white shadow-2xl border border-white/20 flex items-center gap-3.5">
            {/* Big 3D Maneuver Icon */}
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 shrink-0">
              {getManeuverIcon(currentActiveRoute?.steps?.[0]?.instruction || '')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  In {routingService.formatDistance(currentActiveRoute?.steps?.[0]?.distanceMeters || 350)}
                </span>
                <span className="text-[10px] text-blue-200 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                  3D Live Nav
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold truncate mt-0.5 text-white">
                {currentActiveRoute?.steps?.[0]?.instruction || 'Continue on main road'}
              </h3>
              <p className="text-[11px] text-blue-200 font-medium truncate">
                Towards {destinationName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Top-Right Mode & 3D Telemetry Controls */}
      <div className="absolute top-3.5 right-3.5 hidden sm:flex items-center gap-2 z-30">
        {/* Drive Simulation Toggle */}
        <div className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200/80 dark:border-slate-800 gap-1 text-[11px]">
          <button
            onClick={() => {
              setIsSimulating(false);
              simProgressIndexRef.current = 0;
            }}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              !isSimulating
                ? 'bg-[#1267D6] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-black'
            }`}
          >
            Live GPS
          </button>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
              isSimulating
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-black'
            }`}
            title="Simulate 3D vehicle driving along route"
          >
            {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isSimulating ? 'Simulating' : 'Sim Drive'}
          </button>
          {isSimulating && (
            <button
              onClick={() => {
                const nextMult = simSpeedMultiplier === 1 ? 2 : simSpeedMultiplier === 2 ? 4 : 1;
                setSimSpeedMultiplier(nextMult);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold text-[#1267D6]"
              title="Change simulation speed"
            >
              {simSpeedMultiplier}x
            </button>
          )}
        </div>

        {isRecalculating && (
          <div className="px-3 py-1.5 rounded-xl bg-[#031D3D]/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            Recalculating...
          </div>
        )}

        {gpsStatus === 'active' && !isSimulating && (
          <div className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            GPS Active
          </div>
        )}
      </div>

      {/* 5. Live Speedometer Pill HUD */}
      <div className="absolute left-3.5 bottom-28 sm:bottom-24 z-20">
        <div className="px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/90 dark:border-slate-800 flex items-center gap-2 text-[#031D3D] dark:text-white">
          <div className={`p-1.5 rounded-xl ${currentSpeed > 0 ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-black ${currentSpeed > 0 ? 'text-[#1267D6] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                {currentSpeed}
              </span>
              <span className="text-[10px] font-bold text-slate-500">km/h</span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold block -mt-0.5">
              {isSimulating ? 'Simulated Pace' : currentSpeed > 0 ? 'In Motion' : 'Stationary / Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Floating Right-Side 3D Navigation Controls Suite */}
      <div className="absolute right-3.5 bottom-28 sm:bottom-24 flex flex-col items-center gap-2 z-20">
        {/* 3D / 2D Perspective Toggle Button (Google Maps Style) */}
        <button
          onClick={toggle3DMode}
          title={is3DMode ? 'Switch to 2D Flat View' : 'Switch to 3D Driving Perspective'}
          className={`p-2.5 rounded-2xl backdrop-blur-md shadow-lg border transition-all ${
            is3DMode
              ? 'bg-[#1267D6] text-white border-[#1267D6] shadow-[#1267D6]/30 ring-2 ring-[#1267D6]/20'
              : 'bg-white/95 dark:bg-slate-900/95 text-[#031D3D] dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex flex-col items-center">
            <Box className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">
              {is3DMode ? '3D' : '2D'}
            </span>
          </div>
        </button>

        {/* Compass Button (Tap to re-align North) */}
        <button
          onClick={handleResetNorth}
          title="Reset orientation to North"
          className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <Compass className="w-4 h-4 text-rose-500" />
        </button>

        {/* Re-center / Follow My Location Button */}
        <button
          onClick={handleRecenter}
          title={isAutoFollowing ? 'Tracking location' : 'Re-center 3D Camera on vehicle'}
          className={`p-2.5 rounded-2xl backdrop-blur-md shadow-lg border transition-all ${
            isAutoFollowing
              ? 'bg-[#1267D6] text-white border-[#1267D6] shadow-[#1267D6]/30 ring-2 ring-[#1267D6]/20'
              : 'bg-white/95 dark:bg-slate-900/95 text-[#031D3D] dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {isAutoFollowing ? (
            <LocateFixed className="w-4 h-4 animate-pulse" />
          ) : (
            <Locate className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          )}
        </button>

        {/* Map Layers (Streets / Satellite / Terrain) */}
        <button
          onClick={() => {
            const nextLayer = mapLayer === 'streets' ? 'satellite' : mapLayer === 'satellite' ? 'terrain' : 'streets';
            setMapLayer(nextLayer);
          }}
          title={`Switch map view (current: ${mapLayer})`}
          className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 transition-colors"
            title="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen 3D map'}
          className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-[#031D3D] dark:text-slate-200 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 7. Bottom Re-center Floating Pill (appears when user panned away) */}
      {!isAutoFollowing && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 animate-in fade-in zoom-in duration-200">
          <button
            onClick={handleRecenter}
            className="px-4 py-2 rounded-full bg-[#031D3D]/95 text-white font-bold text-xs shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 hover:bg-[#1267D6] transition-colors"
          >
            <Locate className="w-3.5 h-3.5 text-sky-400" />
            <span>Re-center 3D View</span>
          </button>
        </div>
      )}

      {/* 8. Bottom Navigation Telemetry Sheet (Google Maps Style) */}
      <div className="absolute bottom-3 left-3.5 right-3.5 z-20">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-slate-200/90 dark:border-slate-800 text-[#031D3D] dark:text-slate-100">
          {/* Arrival State */}
          {hasArrived ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#19A974] dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#031D3D] dark:text-white">
                    You have arrived!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Welcome to {destinationName}. Trip destination reached safely.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHasArrived(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* ETA, Distance & Route Summary */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-2xl bg-[#1267D6]/10 dark:bg-blue-900/40 text-[#1267D6] dark:text-blue-400 shrink-0">
                  <Navigation className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-xl font-black text-[#19A974] dark:text-emerald-400 tracking-tight">
                      {currentActiveRoute?.durationFormatted || '18 min'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">
                      {currentActiveRoute?.distanceFormatted || '8.4 km'}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                      (ETA {currentActiveRoute?.etaFormatted || '12:06 PM'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    <span>To: <strong className="text-slate-800 dark:text-white">{destinationName}</strong></span>
                  </p>
                </div>
              </div>

              {/* Action Buttons & Alternatives */}
              <div className="flex items-center gap-2 shrink-0">
                {altRouteInfo && (
                  <button
                    onClick={() =>
                      setActiveRouteType(
                        activeRouteType === 'primary' ? 'alternative' : 'primary'
                      )
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      activeRouteType === 'alternative'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {activeRouteType === 'alternative' ? 'Bypass Selected' : 'Scenic Bypass (+18m saved)'}
                  </button>
                )}

                <button
                  onClick={() => setIsNavigating(!isNavigating)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 ${
                    isNavigating
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                      : 'bg-[#1267D6] hover:bg-[#062B5C] text-white shadow-[#1267D6]/20'
                  }`}
                >
                  <Navigation2 className="w-3.5 h-3.5" />
                  <span>{isNavigating ? 'Exit Nav' : 'Start 3D Nav'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
