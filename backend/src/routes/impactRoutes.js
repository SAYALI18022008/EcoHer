const express = require("express");

const controller = require("../controllers/impactController");

const {
  authenticateToken,
  requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/businesses/:businessId/impact",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.addImpact
);

router.get(
  "/businesses/:businessId/impact",
  controller.getImpact
);

router.get(
  "/businesses/:businessId/impact-summary",
  controller.getImpactSummary
);

module.exports = router;