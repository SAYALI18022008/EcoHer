const express = require("express");

const controller = require("../controllers/businessController");
const {
  authenticateToken,
  requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", controller.getBusinesses);

router.post(
  "/",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.createBusiness
);

router.get(
  "/my",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.getMyBusinesses
);

router.get("/:id", controller.getBusiness);

router.put(
  "/:id",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.updateBusiness
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.deleteBusiness
);

module.exports = router;