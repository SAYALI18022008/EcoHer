const express = require("express");

const controller = require("../controllers/verificationController");

const {
  authenticateToken,
  requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/businesses/:businessId/verification-submissions",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.submitVerification
);

router.get(
  "/businesses/:businessId/verification-submissions",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.getBusinessSubmissions
);

module.exports = router;