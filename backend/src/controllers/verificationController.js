const crypto = require("crypto");
const { readDB, writeDB } = require("../utils/db");

const VALID_TYPES = [
  "identity",
  "business_details",
  "material_evidence",
  "community_review",
  "partner_review"
];

async function submitVerification(req, res) {
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
    verificationType,
    evidenceDescription,
    evidenceUrl = ""
  } = req.body;

  if (!VALID_TYPES.includes(verificationType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification type."
    });
  }

  const submission = {
    id: crypto.randomUUID(),
    businessId: business.id,
    verificationType,
    evidenceDescription: evidenceDescription || "",
    evidenceUrl,
    status: "pending",
    reviewNotes: "",
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date().toISOString()
  };

  db.verificationSubmissions.push(submission);

  await writeDB(db);

  res.status(201).json({
    success: true,
    message: "Verification submitted for review.",
    data: { submission }
  });
}

async function getBusinessSubmissions(req, res) {
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

  const submissions =
    db.verificationSubmissions.filter(
      s => s.businessId === business.id
    );

  res.json({
    success: true,
    message: "Verification submissions retrieved.",
    data: { submissions }
  });
}

module.exports = {
  submitVerification,
  getBusinessSubmissions
};