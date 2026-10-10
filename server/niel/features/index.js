'use strict';

/**
 * Feature aggregator.
 *
 * Mounts every feature module's router under one namespace and starts every
 * feature background worker. All mounts are STRICTLY additive - existing
 * platform routes, sockets and engines are untouched.
 *
 *   GET/POST /api/v1/features/citizen-crowdsourcing/...   citizen portal
 *   GET/POST /api/v1/features/messaging-gateway/...       messaging gateway
 *   GET/POST /api/v1/features/multimodal-logistics/...    multimodal planner
 *   GET/POST /api/v1/features/predictive-monsoon/...      monsoon risk engine
 *   GET/POST /api/v1/features/fuel-carbon-analytics/...   fuel & carbon dashboard
 */

const { Router } = require('express');

const citizenRoutes = require('./citizen-crowdsourcing/backend/routes');
const messagingRoutes = require('./messaging-gateway/routes');
const multimodalRoutes = require('./multimodal-logistics/backend/routes');
const monsoonRoutes = require('./predictive-monsoon/routes/index');
const fuelCarbonRoutes = require('./fuel-carbon-analytics/routes/index');

const featuresRouter = Router();
featuresRouter.use('/citizen-crowdsourcing', citizenRoutes);
featuresRouter.use('/messaging-gateway', messagingRoutes);
featuresRouter.use('/multimodal-logistics', multimodalRoutes);
featuresRouter.use('/predictive-monsoon', monsoonRoutes);
featuresRouter.use('/fuel-carbon-analytics', fuelCarbonRoutes);

/**
 * Start all feature background workers (same setInterval style as the
 * existing alert engine / weather monitor - no competing worker framework).
 * Called from server.js alongside startAlertEngine / startWeatherMonitor.
 */
function startFeatureWorkers(io) {
  const { startMessagingWorkers } = require('./messaging-gateway/workers/dispatchWorker');
  startMessagingWorkers(io);

  const { startWorker: startMonsoonWorker } = require('./predictive-monsoon/workers/predictiveWorker');
  startMonsoonWorker();
}

/**
 * Start feature listeners that observe EXISTING Socket.io events.
 * Should be invoked once the HTTP/Socket server is listening.
 */
function startFeatureListeners() {
  const { startListener } = require('./messaging-gateway/services/triggerService');
  return startListener();
}

/** Registry used by tests and documentation. */
const REGISTRY = [
  ['citizen-crowdsourcing', 'Citizen Crowdsourcing Portal'],
  ['messaging-gateway', 'Messaging Gateway'],
  ['multimodal-logistics', 'Multimodal Logistics Planner'],
  ['predictive-monsoon', 'Predictive Monsoon Risk Engine'],
  ['fuel-carbon-analytics', 'Fuel & Carbon Analytics Dashboard'],
];

module.exports = {
  featuresRouter,
  startFeatureWorkers,
  startFeatureListeners,
  REGISTRY,
};