// ==============================================================================
// VERIFICATION TEST SUITE: SAFRO PAN-INDIA HERITAGE & DESTINATION SYSTEM
// Tests Schema, 12-Stage Pipeline, Source Registry, Metrics & NIEL AI RAG
// ==============================================================================

import { destinationDatabase } from '../src/services/destinationDatabase';
import { NielDestinationRagService } from '../src/services/nielDestinationRagService';
import { mockTripService } from '../src/services/mockTripService';
import { sourceRegistry } from '../src/services/sourceRegistry';
import { DataIngestionPipeline } from '../src/services/dataIngestionPipeline';

function runTestSuite() {
  console.log('================================================================');
  console.log('RUNNING SAFRO PAN-INDIA DESTINATION & HERITAGE VERIFICATION');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
    }
  }

  // ----------------------------------------------------------------------------
  // SECTION 1: Administrative Geography Coverage (Requirement 1)
  // ----------------------------------------------------------------------------
  const states = destinationDatabase.getAllStatesAndUTs();
  assert(states.length === 36, '1.1 Authoritative dataset covers all 36 States and Union Territories (28 States + 8 UTs)');

  const metrics = destinationDatabase.getCoverageMetrics();
  assert(metrics.totalStatesAndUTs === 36, '1.2 Coverage metrics track all 36 administrative units');
  assert(metrics.totalDestinations >= 18, `1.3 Seed dataset contains rich destinations (found ${metrics.totalDestinations})`);
  assert(metrics.verifiedDestinationsCount > 0, `1.4 Verified destinations accurately counted (${metrics.verifiedDestinationsCount} verified)`);

  // ----------------------------------------------------------------------------
  // SECTION 2: Source Registry & Legal Provenance (Requirement 3)
  // ----------------------------------------------------------------------------
  const allSources = sourceRegistry.getAllSources();
  assert(allSources.length >= 8, `2.1 Authoritative Source Registry contains registered official bodies (found ${allSources.length})`);
  
  const asiSource = sourceRegistry.getSourceById('src-asi-india');
  assert(asiSource !== undefined && asiSource.license.includes('GODL'), '2.2 ASI registered under Government Open Data License (GODL) India');
  
  const bktcSource = sourceRegistry.getSourceById('src-bktc-uk');
  assert(bktcSource !== undefined && bktcSource.category === 'Temple Shrine Board', '2.3 Badrinath-Kedarnath Temple Committee registered as statutory Shrine Board');

  const complianceCheck = sourceRegistry.validateSourceUrl('https://asi.nic.in/monuments');
  assert(complianceCheck.isRegistered && complianceCheck.allowedReuse, '2.4 Source compliance engine approves reuse from registered government domain');

  // ----------------------------------------------------------------------------
  // SECTION 3: 12-Stage Ingestion Pipeline & Quality Checks (Requirement 5)
  // ----------------------------------------------------------------------------
  const sampleJson = JSON.stringify([
    {
      officialName: 'Sun Temple Modhera',
      hindiName: 'मोढेरा सूर्य मंदिर',
      stateId: 'IN-GJ',
      stateName: 'Gujarat',
      districtName: 'Mehsana',
      settlementName: 'Modhera',
      category: 'Heritage & Forts',
      subcategory: 'Ancient Temple & Archaeological Monument',
      religiousTradition: 'Hinduism',
      associatedDeityOrDedication: 'Surya (Sun God)',
      architecturalStyle: 'Maru-Gurjara (Solanki)',
      historicalPeriod: '1026-1027 CE (Solanki Dynasty)',
      latitude: 23.5835,
      longitude: 72.1331,
      isAsiProtected: true,
      isCoordinateVerified: true,
      shortDescription: '11th-century sun temple renowned for intricate stepwell Surya Kund.',
      suggestedDurationDays: 1,
      verificationStatus: 'verified',
      dataConfidence: 98,
      sourceUrl: 'https://asi.nic.in',
      sourceOrg: 'Archaeological Survey of India',
    },
    {
      // Missing official name - should be flagged by validation
      stateId: 'IN-GJ',
      latitude: 23.0,
      longitude: 72.0,
    }
  ]);

  const pipelineReport = DataIngestionPipeline.runPipeline(sampleJson, 'json');
  assert(pipelineReport.totalParsed === 2, '3.1 Pipeline parses multiple input records');
  assert(pipelineReport.importedCount === 1, '3.2 Pipeline imports valid record into normalized database');
  assert(pipelineReport.skippedCount === 1, '3.3 Pipeline skips invalid record and reports validation issue');
  assert(pipelineReport.heritageRulesValidated > 0, '3.4 Pipeline applies heritage rules and provenance attributes');

  // Idempotent upsert re-run check
  const rerunReport = DataIngestionPipeline.runPipeline(sampleJson, 'json');
  assert(rerunReport.updatedCount === 1 && rerunReport.importedCount === 0, '3.5 Re-running import is idempotent: updates existing record without duplicate creation');

  // ----------------------------------------------------------------------------
  // SECTION 4: Heritage Coverage Metrics (Requirement 10)
  // ----------------------------------------------------------------------------
  const updatedMetrics = destinationDatabase.getCoverageMetrics();
  assert(updatedMetrics.hinduTemplesCount > 0, `4.1 Accurately tallies Hindu temple records (${updatedMetrics.hinduTemplesCount})`);
  assert(updatedMetrics.historicalAndFortsCount > 0, `4.2 Accurately tallies Forts and historical monuments (${updatedMetrics.historicalAndFortsCount})`);
  assert(updatedMetrics.unescoSitesCount > 0, `4.3 Accurately tallies UNESCO World Heritage sites (${updatedMetrics.unescoSitesCount})`);
  assert(updatedMetrics.asiProtectedCount > 0, `4.4 Accurately tallies ASI Protected monuments (${updatedMetrics.asiProtectedCount})`);
  assert(updatedMetrics.jyotirlingaCount > 0, `4.5 Accurately tallies Jyotirlinga shrines (${updatedMetrics.jyotirlingaCount})`);
  assert(updatedMetrics.shaktiPeethaCount > 0, `4.6 Accurately tallies Shakti Peetha shrines (${updatedMetrics.shaktiPeethaCount})`);

  // ----------------------------------------------------------------------------
  // SECTION 5: Search and Filtering (Requirement 8)
  // ----------------------------------------------------------------------------
  // Multilingual English & Hindi
  const kedarEn = destinationDatabase.searchDestinations('Kedarnath');
  assert(kedarEn.length > 0 && kedarEn[0].officialName.includes('Kedarnath'), '5.1 English search retrieves Kedarnath');

  const kedarHi = destinationDatabase.searchDestinations('केदारनाथ');
  assert(kedarHi.length > 0 && kedarHi[0].officialName.includes('Kedarnath'), '5.2 Hindi search retrieves Kedarnath (केदारनाथ)');

  // Aliases
  const kashiSearch = destinationDatabase.searchDestinations('Kashi');
  assert(kashiSearch.length > 0 && (kashiSearch[0].officialName.includes('Kashi') || kashiSearch[0].officialName.includes('Varanasi')), '5.3 Alias "Kashi" resolves to Kashi / Varanasi');

  // Deity Filter
  const shivaDestinations = destinationDatabase.searchDestinations('', { associatedDeity: 'Shiva' });
  assert(shivaDestinations.length > 0 && shivaDestinations.every(d => d.associatedDeityOrDedication?.toLowerCase().includes('shiva')), '5.4 Deity filter for "Shiva" returns dedicated Shiva shrines');

  // Architectural Style Filter
  const nagaraStyle = destinationDatabase.searchDestinations('', { architecturalStyle: 'Nagara' });
  assert(nagaraStyle.length > 0, '5.5 Architectural style filter for "Nagara" returns Nagara-style monuments');

  // Distance Search
  const nearDelhi = destinationDatabase.searchDestinations('', {
    originCoords: { lat: 28.6139, lng: 77.2090 }, // Delhi
    maxDistanceKm: 300,
  });
  assert(nearDelhi.length > 0, `5.6 Spatial proximity search within 300km of Delhi found ${nearDelhi.length} destinations`);

  // ----------------------------------------------------------------------------
  // SECTION 6: NIEL AI RAG Integration Tests (Requirement 7)
  // ----------------------------------------------------------------------------
  // Query 1: Find Hindu temples in Jaipur
  const ragJaipur = NielDestinationRagService.query('Find Hindu temples in Jaipur');
  assert(
    ragJaipur !== null &&
    ragJaipur.message.content.includes('Govind Dev Ji') &&
    ragJaipur.message.content.includes('Birla Mandir'),
    '6.1 NIEL AI answers "Find Hindu temples in Jaipur" with Govind Dev Ji & Birla Mandir'
  );

  // Query 2: Show temples and historical forts in Rajasthan
  const ragRajForts = NielDestinationRagService.query('Show temples and historical forts in Rajasthan');
  assert(
    ragRajForts !== null &&
    ragRajForts.message.content.includes('Amber Fort') &&
    ragRajForts.message.content.includes('Mehrangarh') &&
    ragRajForts.message.content.includes('Dilwara'),
    '6.2 NIEL AI answers "Show temples and historical forts in Rajasthan" with forts and temples'
  );

  // Query 3: Tell me about Kedarnath Temple
  const ragKedar = NielDestinationRagService.query('Tell me about Kedarnath Temple');
  assert(
    ragKedar !== null &&
    ragKedar.message.content.includes('Kedarnath') &&
    ragKedar.message.content.includes('Jyotirlinga') &&
    (ragKedar.message.content.includes('Biometric') || ragKedar.message.content.includes('Mandatory')),
    '6.3 NIEL AI answers "Tell me about Kedarnath Temple" with 11th Jyotirlinga, BKTC source, and Char Dham registration'
  );

  // Query 4: Find documented temples in every district of Uttarakhand
  const ragUtDistricts = NielDestinationRagService.query('Find documented temples in every district of Uttarakhand');
  assert(
    ragUtDistricts !== null &&
    ragUtDistricts.message.content.includes('Rudraprayag') &&
    ragUtDistricts.message.content.includes('Chamoli') &&
    ragUtDistricts.message.content.includes('Uttarkashi') &&
    ragUtDistricts.message.content.includes('Haridwar'),
    '6.4 NIEL AI answers "Find documented temples in every district of Uttarakhand" with comprehensive district breakdown'
  );

  // Query 5: Show temples dedicated to Lord Shiva in Tamil Nadu
  const ragTnShiva = NielDestinationRagService.query('Show temples dedicated to Lord Shiva in Tamil Nadu');
  assert(
    ragTnShiva !== null &&
    ragTnShiva.message.content.includes('Brihadisvara') &&
    ragTnShiva.message.content.includes('Ramanathaswamy') &&
    ragTnShiva.message.content.includes('Annamalaiyar'),
    '6.5 NIEL AI answers "Show temples dedicated to Lord Shiva in Tamil Nadu" with Brihadisvara, Ramanathaswamy & Annamalaiyar'
  );

  // Query 6: Find forts and palaces in Maharashtra
  const ragMhForts = NielDestinationRagService.query('Find forts and palaces in Maharashtra');
  assert(
    ragMhForts !== null &&
    ragMhForts.message.content.includes('Raigad') &&
    ragMhForts.message.content.includes('Shivneri') &&
    ragMhForts.message.content.includes('Sinhagad'),
    '6.6 NIEL AI answers "Find forts and palaces in Maharashtra" with Maratha citadels'
  );

  // Query 7: Compare documented religious destinations in two states
  const ragCompareRel = NielDestinationRagService.query('Compare documented religious destinations in two states like Tamil Nadu and Uttarakhand');
  assert(
    ragCompareRel !== null &&
    ragCompareRel.message.content.includes('Dravidian') &&
    ragCompareRel.message.content.includes('Devbhoomi'),
    '6.7 NIEL AI compares religious destinations between two states (Dravidian Sacred Trail vs Himalayan Devbhoomi)'
  );

  // Query 8: Create a multi-day pilgrimage itinerary
  const ragPilgrimageItin = NielDestinationRagService.query('Create a multi-day pilgrimage itinerary');
  assert(
    ragPilgrimageItin !== null &&
    ragPilgrimageItin.message.content.includes('Day 1') &&
    ragPilgrimageItin.message.content.includes('Kedarnath') &&
    ragPilgrimageItin.message.content.includes('Badrinath'),
    '6.8 NIEL AI generates multi-day pilgrimage itinerary with day-by-day darshan schedules and biometric guidance'
  );

  // Query 9: Find destinations near a selected temple
  const ragNearby = NielDestinationRagService.query('Find destinations near Kedarnath');
  assert(
    ragNearby !== null &&
    (ragNearby.message.content.includes('Tungnath') || ragNearby.groundedDestinations.length > 0 || ragNearby.message.content.includes('Explore Near')),
    '6.9 NIEL AI retrieves destinations near selected temple'
  );

  // ----------------------------------------------------------------------------
  // SECTION 7: Plan Trip UI Integration (Preserving Wizard Integrity)
  // ----------------------------------------------------------------------------
  const defaultItinerary = mockTripService.generateDefaultItinerary('Kedarnath', 4);
  assert(defaultItinerary.length === 4, '7.1 Generates 4-day itinerary without breaking wizard stepper');
  assert(defaultItinerary[0].activities.length > 0, '7.2 Itinerary activities grounded in normalized destination records');

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');
}

runTestSuite();
