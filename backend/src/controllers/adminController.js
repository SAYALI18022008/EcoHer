const { readDB, writeDB } = require("../utils/db");

async function pendingVerification(req, res) {
  const db = await readDB();

  const submissions =
    db.verificationSubmissions.filter(
      s => s.status === "pending"
    );

  res.json({
    success: true,
    message: "Pending verification submissions retrieved.",
    data: { submissions }
  });
}

async function reviewVerification(req, res) {
  const db = await readDB();

  const submission = db.verificationSubmissions.find(
    s => s.id === req.params.id
  );

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Verification submission not found."
    });
  }

  const {
    status,
    verificationLevel,
    reviewNotes = ""
  } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be approved or rejected."
    });
  }

  submission.status = status;
  submission.reviewNotes = reviewNotes;
  submission.reviewedBy = req.user.id;
  submission.reviewedAt = new Date().toISOString();

  if (status === "approved" && verificationLevel) {
    const business = db.businesses.find(
      b => b.id === submission.businessId
    );

    if (business) {
      business.verificationLevel = verificationLevel;
      business.verificationStatus = "approved";
      business.updatedAt = new Date().toISOString();
    }
  }

  await writeDB(db);

  res.json({
    success: true,
    message: "Verification reviewed.",
    data: { submission }
  });
}

async function getBusinesses(req, res) {
  const db = await readDB();

  res.json({
    success: true,
    message: "All businesses retrieved.",
    data: {
      businesses: db.businesses
    }
  });
}

async function updateBusinessVerification(req, res) {
  const db = await readDB();

  const business = db.businesses.find(
    b => b.id === req.params.id
  );

  if (!business) {
    return res.status(404).json({
      success: false,
      message: "Business not found."
    });
  }

  const {
    verificationStatus,
    verificationLevel
  } = req.body;

  if (
    !["pending", "approved", "rejected"].includes(
      verificationStatus
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification status."
    });
  }

  business.verificationStatus = verificationStatus;

  if (verificationLevel) {
    business.verificationLevel = verificationLevel;
  }

  business.updatedAt = new Date().toISOString();

  await writeDB(db);

  res.json({
    success: true,
    message: "Business verification updated.",
    data: { business }
  });
}

module.exports = {
  pendingVerification,
  reviewVerification,
  getBusinesses,
  updateBusinessVerification
};