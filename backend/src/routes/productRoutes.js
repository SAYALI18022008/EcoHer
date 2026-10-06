const express = require("express");

const controller = require("../controllers/productController");
const {
  authenticateToken,
  requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/businesses/:businessId/products",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.createProduct
);

router.get(
  "/businesses/:businessId/products",
  controller.getProducts
);

router.put(
  "/products/:id",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.updateProduct
);

router.delete(
  "/products/:id",
  authenticateToken,
  requireRole("entrepreneur"),
  controller.deleteProduct
);

module.exports = router;