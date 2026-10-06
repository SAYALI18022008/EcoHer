const express = require("express");

const controller = require("../controllers/adminController");

const {
  authenticateToken,
  requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole("admin"));

router.get(
  "/verification-submissions/pending",
  controller.pendingVerification
);

router.patch(
  "/verification-submissions/:id",
  controller.reviewVerification
);

router.get(
  "/businesses",
  controller.getBusinesses
);

router.patch(
  "/businesses/:id/verification",
  controller.updateBusinessVerification
);

module.exports = router;