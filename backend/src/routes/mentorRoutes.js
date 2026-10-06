const express = require("express");

const mentorController = require("../controllers/mentorController");
const mentorshipController = require("../controllers/mentorshipController");

const {
  authenticateToken,
  requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/mentors/profile",
  authenticateToken,
  requireRole("mentor"),
  mentorController.createOrUpdateProfile
);

router.put(
  "/mentors/profile",
  authenticateToken,
  requireRole("mentor"),
  mentorController.createOrUpdateProfile
);

router.get(
  "/mentors/recommendations",
  authenticateToken,
  requireRole("entrepreneur"),
  mentorController.getRecommendations
);

router.post(
  "/mentorship-requests",
  authenticateToken,
  requireRole("entrepreneur"),
  mentorshipController.createRequest
);

router.get(
  "/mentorship-requests/my",
  authenticateToken,
  mentorshipController.getMyRequests
);

router.patch(
  "/mentorship-requests/:id/status",
  authenticateToken,
  requireRole("mentor"),
  mentorshipController.updateRequestStatus
);

module.exports = router;