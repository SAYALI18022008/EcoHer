const crypto = require("crypto");
const { readDB, writeDB } = require("../utils/db");

async function createProduct(req, res) {
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
    productName,
    description = "",
    price,
    materialUsed = "",
    imageUrl = "",
    isAvailable = true
  } = req.body;

  if (!productName || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "Product name and price are required."
    });
  }

  if (Number(price) < 0) {
    return res.status(400).json({
      success: false,
      message: "Price cannot be negative."
    });
  }

  const product = {
    id: crypto.randomUUID(),
    businessId: business.id,
    productName,
    description,
    price: Number(price),
    materialUsed,
    imageUrl,
    isAvailable,
    createdAt: new Date().toISOString()
  };

  db.products.push(product);

  await writeDB(db);

  res.status(201).json({
    success: true,
    message: "Product added.",
    data: { product }
  });
}

async function getProducts(req, res) {
  const db = await readDB();

  const products = db.products.filter(
    p => p.businessId === req.params.businessId
  );

  res.json({
    success: true,
    message: "Products retrieved.",
    data: { products }
  });
}

async function updateProduct(req, res) {
  const db = await readDB();

  const product = db.products.find(
    p => p.id === req.params.id
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found."
    });
  }

  const business = db.businesses.find(
    b => b.id === product.businessId
  );

  if (business.ownerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You do not own this product."
    });
  }

  const fields = [
    "productName",
    "description",
    "price",
    "materialUsed",
    "imageUrl",
    "isAvailable"
  ];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      product[field] =
        field === "price"
          ? Number(req.body[field])
          : req.body[field];
    }
  });

  await writeDB(db);

  res.json({
    success: true,
    message: "Product updated.",
    data: { product }
  });
}

async function deleteProduct(req, res) {
  const db = await readDB();

  const index = db.products.findIndex(
    p => p.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found."
    });
  }

  const product = db.products[index];

  const business = db.businesses.find(
    b => b.id === product.businessId
  );

  if (business.ownerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You do not own this product."
    });
  }

  db.products.splice(index, 1);

  await writeDB(db);

  res.json({
    success: true,
    message: "Product deleted."
  });
}

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
};