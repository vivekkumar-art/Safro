'use strict';

/**
 * Fuel & Carbon Analytics - HTTP controller.
 *
 * Wraps the efficiencyModel, comparisonService and reportBuilder into a
 * thin REST layer. All writes require 'admin' role; reads require any
 * authenticated user. The /compare endpoint is open to authenticated users
 * (field planners need live cost/CO2 estimates).
 */

const efficiencyModel = require('../models/efficiencyModel');
const { runComparison, persistComparison, resolveProfileAndFactor } = require('../services/comparisonService');
const { buildReport, toCsv, toText } = require('../reports/reportBuilder');

// ─── helpers ──────────────────────────────────────────────────────────────────
function bad(res, msg, code = 400) {
  return res.status(code).json({ error: msg });
}

// ─── PROFILES ─────────────────────────────────────────────────────────────────

async function listProfiles(req, res) {
  const { fuelType, vehicleType, active } = req.query;
  const rows = await efficiencyModel.listProfiles({
    fuelType: fuelType || undefined,
    vehicleType: vehicleType || undefined,
    active: active === 'false' ? false : true,
  });
  res.json({ profiles: rows });
}

async function getProfile(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return bad(res, 'invalid profile id');
  const row = await efficiencyModel.getProfile(id);
  if (!row) return res.status(404).json({ error: 'profile not found' });
  res.json({ profile: row });
}

async function createProfile(req, res) {
  const { profileName, vehicleType, fuelType, efficiency, efficiencyUnit, fuelPricePerUnit, payloadFactor, source } = req.body;
  if (!profileName || !vehicleType || !fuelType || efficiency === undefined || !efficiencyUnit) {
    return bad(res, 'profileName, vehicleType, fuelType, efficiency, efficiencyUnit are required');
  }
  const row = await efficiencyModel.createProfile({
    profileName,
    vehicleType,
    fuelType: fuelType.toUpperCase(),
    efficiency: Number(efficiency),
    efficiencyUnit,
    fuelPricePerUnit: fuelPricePerUnit !== undefined ? Number(fuelPricePerUnit) : 0,
    payloadFactor: payloadFactor !== undefined ? Number(payloadFactor) : null,
    source: source || null,
    active: true,
  });
  res.status(201).json({ profile: row });
}

async function updateProfile(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return bad(res, 'invalid profile id');
  const existing = await efficiencyModel.getProfile(id);
  if (!existing) return res.status(404).json({ error: 'profile not found' });
  const patch = {};
  const allowed = ['profileName', 'vehicleType', 'fuelType', 'efficiency', 'efficiencyUnit', 'fuelPricePerUnit', 'payloadFactor', 'source', 'active'];
  for (const k of allowed) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  if (patch.fuelType) patch.fuelType = patch.fuelType.toUpperCase();
  const row = await efficiencyModel.updateProfile(id, patch);
  res.json({ profile: row });
}

async function deleteProfile(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return bad(res, 'invalid profile id');
  const ok = await efficiencyModel.deleteProfile(id);
  if (!ok) return res.status(404).json({ error: 'profile not found' });
  res.json({ deleted: true, id });
}

// ─── EMISSION FACTORS ─────────────────────────────────────────────────────────

async function listFactors(req, res) {
  const rows = await efficiencyModel.listEmissionFactors();
  res.json({ factors: rows });
}

async function upsertFactor(req, res) {
  const { fuelType } = req.params;
  const { factorType, factorValue, source } = req.body;
  if (!fuelType || factorValue === undefined) {
    return bad(res, 'fuelType (param) and factorValue (body) are required');
  }
  const row = await efficiencyModel.upsertEmissionFactor({
    fuelType: fuelType.toUpperCase(),
    factorType: factorType || 'kg_co2_per_litre',
    factorValue: Number(factorValue),
    source: source || null,
  });
  res.json({ factor: row });
}

// ─── ROUTE COMPARISON ─────────────────────────────────────────────────────────

async function compare(req, res) {
  const { originLat, originLng, destinationLat, destinationLng, profileId, profileName, vehicleId, persist, originName, destinationName } = req.body;

  const resolved = await resolveProfileAndFactor({ profileId, profileName, vehicleId });
  if (!resolved.ok) return bad(res, resolved.error);

  const result = await runComparison({
    originLat,
    originLng,
    destinationLat,
    destinationLng,
    profile: resolved.profile,
    emissionFactor: resolved.emissionFactor,
    optimize: req.body.optimize !== false,
  });

  if (!result.ok) return bad(res, result.error);

  let savedId = null;
  if (persist !== false) {
    const saved = await persistComparison({
      comparison: result,
      vehicleId: vehicleId || null,
      profileId: resolved.profileId,
      calculatedBy: req.user ? req.user.id : null,
      originName: originName || null,
      destinationName: destinationName || null,
    });
    if (saved) savedId = saved.id;
  }

  res.json({ comparison: result, savedRecordId: savedId });
}

// ─── LEDGER & SUMMARY ─────────────────────────────────────────────────────────

async function listRecords(req, res) {
  const { from, to, vehicleId, vehicleType, fuelType, limit = 100, offset = 0 } = req.query;
  const rows = await efficiencyModel.listRecords({ from, to, vehicleId, vehicleType, fuelType, limit: Math.min(Number(limit) || 100, 500), offset: Number(offset) || 0 });
  res.json({ records: rows });
}

async function summary(req, res) {
  const { from, to, vehicleId, vehicleType, fuelType } = req.query;
  const agg = await efficiencyModel.aggregateRecords({ from, to, vehicleId, vehicleType, fuelType });
  res.json({ summary: agg });
}

// ─── REPORT ───────────────────────────────────────────────────────────────────

async function report(req, res) {
  const { from, to, vehicleId, vehicleType, fuelType, format = 'json' } = req.query;
  const [agg, factors] = await Promise.all([
    efficiencyModel.aggregateRecords({ from, to, vehicleId, vehicleType, fuelType }),
    efficiencyModel.listEmissionFactors(),
  ]);
  const built = buildReport({
    aggregates: agg,
    factors,
    filters: { from, to, vehicleId, vehicleType, fuelType },
    generatedBy: req.user ? req.user.email : 'system',
  });

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fuel-carbon-report.csv"');
    return res.send(toCsv(built));
  }
  if (format === 'text') {
    res.setHeader('Content-Type', 'text/plain');
    return res.send(toText(built));
  }
  res.json({ report: built });
}

// ─── VEHICLES ─────────────────────────────────────────────────────────────────

async function listVehicles(req, res) {
  const rows = await efficiencyModel.listVehicles();
  res.json({ vehicles: rows });
}

module.exports = {
  listProfiles, getProfile, createProfile, updateProfile, deleteProfile,
  listFactors, upsertFactor,
  compare,
  listRecords, summary, report,
  listVehicles,
};
