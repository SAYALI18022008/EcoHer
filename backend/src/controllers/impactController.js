const crypto = require("crypto");
const { readDB, writeDB } = require("../utils/db");

const VALID_METRICS = [
  "textile_waste_reused",
  "plastic_avoided",
  "reusable_packaging_used",
  "women_supported",
  "local_suppliers_supported"
];

async function addImpact(req, res) {
  const db = await readDB();

  const business = db.businesses.find(
    b => b.id === req.params.businessId
  );

  if (!business) {
    return res.status(404).json({
      success: false,
      message: "Business not found."
    });
  }

  if (business.ownerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You do not own this business."
    });
  }

  const {
    metricType,
    value,
    unit,
    calculationMethod = "",
    isEstimated = true
  } = req.body;

  if (!VALID_METRICS.includes(metricType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid impact metric."
    });
  }

  if (value === undefined || Number(value) < 0) {
    return res.status(400).json({
      success: false,
      message: "Value must be zero or greater."
    });
  }

  const record = {
    id: crypto.randomUUID(),
    businessId: business.id,
    metricType,
    value: Number(value),
    unit: unit || "",
    calculationMethod,
    isEstimated: Boolean(isEstimated),
    createdAt: new Date().toISOString()
  };

  db.impactRecords.push(record);

  await writeDB(db);

  res.status(201).json({
    success: true,
    message: "Impact record added.",
    data: { record }
  });
}

async function getImpact(req, res) {
  const db = await readDB();

  const records = db.impactRecords.filter(
    r => r.businessId === req.params.businessId
  );

  res.json({
    success: true,
    message: "Impact records retrieved.",
    data: { records }
  });
}

async function getImpactSummary(req, res) {
  const db = await readDB();

  const records = db.impactRecords.filter(
    r => r.businessId === req.params.businessId
  );

  const summary = {};

  for (const record of records) {
    if (!summary[record.metricType]) {
      summary[record.metricType] = {
        value: 0,
        unit: record.unit,
        isEstimated: record.isEstimated
      };
    }

    summary[record.metricType].value += record.value;
  }

  res.json({
    success: true,
    message: "Impact summary retrieved.",
    data: { summary }
  });
}

module.exports = {
  addImpact,
  getImpact,
  getImpactSummary
};