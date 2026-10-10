// Verification Script for NIEL Integration in SAFRO
const http = require('http');

console.log('====================================================');
console.log('🧪 TESTING NIEL INTEGRATION IN SAFRO');
console.log('====================================================');

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5173${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '',
          contentLength: data.length,
          ok: res.statusCode === 200,
        });
      });
    });

    req.on('error', (err) => {
      resolve({ path, statusCode: 0, error: err.message, ok: false });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ path, statusCode: 408, error: 'Timeout', ok: false });
    });
  });
}

async function runTests() {
  const routesToTest = [
    '/',
    '/login',
    '/home',
    '/niel',
    '/niel-command',
    '/niel-ai',
    '/admin/niel',
    '/src/niel/NielCommandCenter.tsx',
    '/src/niel/map/NielMap.tsx',
    '/src/niel/services/api.ts',
    '/src/niel/services/dijkstraSolver.ts',
    '/src/niel/store/nielStore.ts',
    '/src/niel/components/RoutePlannerPanel.tsx',
    '/src/niel/components/LiveAlertsPanel.tsx',
    '/src/niel/components/FleetManagerPanel.tsx',
    '/src/niel/components/features/PredictiveMonsoonPanel.tsx',
    '/src/niel/components/features/MultimodalLogisticsPanel.tsx',
    '/src/niel/components/features/CitizenCrowdsourcingPanel.tsx',
    '/src/niel/components/features/FuelCarbonPanel.tsx',
    '/src/niel/components/features/MessagingGatewayPanel.tsx',
  ];

  console.log(`\n1. Validating Vite Live Server Responses (${routesToTest.length} routes/modules)...`);
  let passed = 0;
  let failed = 0;

  for (const route of routesToTest) {
    const result = await testEndpoint(route);
    if (result.ok) {
      console.log(`  ✅ [${result.statusCode}] ${result.path} (${result.contentLength} bytes)`);
      passed++;
    } else {
      console.log(`  ❌ [${result.statusCode}] ${result.path} - ${result.error || 'Failed'}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed out of ${routesToTest.length} endpoints.`);

  if (failed === 0) {
    console.log('\n🎉 ALL NIEL MODULES & ROUTES ARE WORKING PERFECTLY IN SAFRO!');
  } else {
    console.error('\n⚠️ Some endpoints failed verification.');
    process.exit(1);
  }
}

runTests();
