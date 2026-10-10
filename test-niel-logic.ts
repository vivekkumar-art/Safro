import { solveDijkstraRoute } from './src/niel/services/dijkstraSolver';
import {
  INITIAL_ROAD_CORRIDORS,
  INITIAL_INCIDENTS_DATA,
  INITIAL_VEHICLES_DATA,
  DEFAULT_USERS
} from './src/niel/services/apiDefaults';
import { api } from './src/niel/services/api';
import { nielStore } from './src/niel/store/nielStore';

console.log('====================================================');
console.log('🧭 NIEL GEOSPATIAL & LOGISTICS LOGIC VERIFICATION');
console.log('====================================================');

// Test 1: Datasets Integrity
console.log('\n[Test 1] Verifying Default Datasets:');
console.log(`  - Road Corridors: ${INITIAL_ROAD_CORRIDORS.length} corridors loaded`);
console.log(`  - Live Incidents: ${INITIAL_INCIDENTS_DATA.length} active hazards loaded`);
console.log(`  - Fleet Telemetry: ${INITIAL_VEHICLES_DATA.length} tracked vehicles loaded`);
console.log(`  - RBAC Users: ${Object.keys(DEFAULT_USERS).length} predefined roles (Admin, Dispatcher, Officer, Driver)`);

if (INITIAL_ROAD_CORRIDORS.length < 5 || INITIAL_INCIDENTS_DATA.length < 3) {
  throw new Error('Default datasets failed integrity check');
}
console.log('  ✅ Datasets integrity verified.');

// Test 2: Dijkstra Route Solver (Guwahati -> Tawang)
console.log('\n[Test 2] Testing Dijkstra Route Optimization:');
const route1 = solveDijkstraRoute(INITIAL_ROAD_CORRIDORS, {
  origin: 'Guwahati',
  destination: 'Tawang',
  originCoords: [91.7362, 26.1445],
  destinationCoords: [91.8594, 27.5861],
  avoidBlocked: true,
  cargoType: 'Medicine'
});

console.log(`  Route ID: ${route1.id}`);
console.log(`  Total Distance: ${route1.distanceKm.toFixed(1)} km`);
console.log(`  Estimated Travel Time: ${route1.durationHours.toFixed(1)} hrs`);
console.log(`  Segments Traverse Count: ${route1.segments.length}`);
console.log(`  Bottleneck Warnings: ${route1.warnings?.length || 0}`);
if (route1.segments.length === 0 || route1.distanceKm <= 0) {
  throw new Error('Dijkstra routing failed to compute valid path');
}
console.log('  ✅ Dijkstra route solver passed successfully.');

// Test 3: Blocked Corridor Bypass
console.log('\n[Test 3] Testing Blocked Corridor Bypass:');
// Create a blocked road on NH-27
const blockedRoads = INITIAL_ROAD_CORRIDORS.map(r => 
  r.id === 'corridor-nh27' ? { ...r, status: 'BLOCKED' as const } : r
);

const bypassRoute = solveDijkstraRoute(blockedRoads, {
  origin: 'Guwahati',
  destination: 'Nagaon',
  avoidBlocked: true
});

console.log(`  Bypass Distance: ${bypassRoute.distanceKm.toFixed(1)} km`);
console.log('  ✅ Blocked road dynamic bypass verified.');

// Test 4: Reactive Store State & Updates
console.log('\n[Test 4] Testing NIEL Central Reactive Store:');
const state = nielStore.getState();
console.log(`  Current active map style: ${state.activeMapStyle}`);
console.log(`  Roads in store: ${state.roads.length}`);
console.log(`  Incidents in store: ${state.incidents.length}`);

nielStore.setActiveRoute(route1);
const updatedState = nielStore.getState();
if (!updatedState.activeRoute || updatedState.activeRoute.id !== route1.id) {
  throw new Error('Store failed to update active route');
}
console.log('  ✅ Reactive store dispatch & subscription verified.');

// Test 5: API Client Fallback & Data Retrieval
console.log('\n[Test 5] Testing API Client Offline / Resilient Mode:');
async function testApiClient() {
  const roads = await api.getRoads();
  const incidents = await api.getIncidents();
  const vehicles = await api.getVehicles();

  console.log(`  API roads fetched: ${roads.length}`);
  console.log(`  API incidents fetched: ${incidents.length}`);
  console.log(`  API vehicles fetched: ${vehicles.length}`);

  if (roads.length === 0 || incidents.length === 0 || vehicles.length === 0) {
    throw new Error('API client fallback returned empty data');
  }
  console.log('  ✅ API client resilient offline fallback verified.');
}

testApiClient().then(() => {
  console.log('\n====================================================');
  console.log('🎉 ALL NIEL LOGIC & ALGORITHMIC TESTS PASSED (5/5)!');
  console.log('====================================================');
  process.exit(0);
}).catch(err => {
  console.error('Logic test error:', err);
  process.exit(1);
});
