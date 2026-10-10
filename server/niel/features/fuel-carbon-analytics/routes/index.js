'use strict';

/**
 * Fuel & Carbon Analytics - routes.
 * Mounted by the feature aggregator at /api/v1/features/fuel-carbon-analytics
 *
 *   GET    /profiles                         list active profiles (auth)
 *   GET    /profiles/:id                     single profile (auth)
 *   POST   /profiles                         create profile (admin)
 *   PATCH  /profiles/:id                     update profile (admin)
 *   DELETE /profiles/:id                     delete profile (admin)
 *
 *   GET    /factors                          list emission factors (auth)
 *   PUT    /factors/:fuelType                upsert emission factor (admin)
 *
 *   POST   /compare                          run route comparison (auth)
 *
 *   GET    /records                          efficiency ledger (auth)
 *   GET    /summary                          aggregate totals (auth)
 *   GET    /report                           institutional report (auth, ?format=json|csv|text)
 *
 *   GET    /vehicles                         vehicles with efficiency data (auth)
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../../src/middleware/authMiddleware');
const wrap = require('../../../src/utils/wrap');
const ctrl = require('../controllers/analyticsController');

// Profiles
router.get('/profiles', authenticate, wrap(ctrl.listProfiles));
router.get('/profiles/:id', authenticate, wrap(ctrl.getProfile));
router.post('/profiles', authenticate, requireRole('admin'), wrap(ctrl.createProfile));
router.patch('/profiles/:id', authenticate, requireRole('admin'), wrap(ctrl.updateProfile));
router.delete('/profiles/:id', authenticate, requireRole('admin'), wrap(ctrl.deleteProfile));

// Emission factors
router.get('/factors', authenticate, wrap(ctrl.listFactors));
router.put('/factors/:fuelType', authenticate, requireRole('admin'), wrap(ctrl.upsertFactor));

// Route comparison engine
router.post('/compare', authenticate, wrap(ctrl.compare));

// Ledger, summary, report
router.get('/records', authenticate, wrap(ctrl.listRecords));
router.get('/summary', authenticate, wrap(ctrl.summary));
router.get('/report', authenticate, wrap(ctrl.report));

// Vehicles with efficiency profile data
router.get('/vehicles', authenticate, wrap(ctrl.listVehicles));

module.exports = router;
