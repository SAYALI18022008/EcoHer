const crypto = require("crypto");
const { readDB, writeDB } = require("../utils/db");

async function createBusiness(req, res) {
  const {
    businessName,
    category,
    description,
    city,
    state = "",
    sustainabilityType,
    story = "",
    founderName = "",
    contactEmail = "",
    contactPhone = ""
  } = req.body;

  if (!businessName || !category || !city) {
    return res.status(400).json({
      success: false,
      message: "Business name, category and city are required."
    });
  }

  const db = await readDB();

  const business = {
    id: crypto.randomUUID(),
    ownerId: req.user.id,
    businessName,
    category,
    description: description || "",
    city,
    state,
    sustainabilityType: sustainabilityType || "",
    story,
    founderName,
    contactEmail,
    contactPhone,
    verificationLevel: "Pending",
    verificationStatus: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.businesses.push(business);

  await writeDB(db);

  res.status(201).json({
    success: true,
    message: "Business created successfully.",
    data: { business }
  });
}

async function getBusinesses(req, res) {
  const db = await readDB();

  let businesses = db.businesses.filter(
    b => b.verificationStatus === "approved"
  );

  const { search, city, category, sustainabilityType } =
    req.query;

  if (search) {
    const q = search.toLowerCase();

    businesses = businesses.filter(
      b =>
        b.businessName.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }

  if (city) {
    businesses = businesses.filter(
      b => b.city.toLowerCase() === city.toLowerCase()
    );
  }

  if (category) {
    businesses = businesses.filter(
      b => b.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (sustainabilityType) {
    businesses = businesses.filter(
      b =>
        b.sustainabilityType.toLowerCase() ===
        sustainabilityType.toLowerCase()
    );
  }

  res.json({
    success: true,
    message: "Businesses retrieved.",
    data: { businesses }
  });
}

async function getMyBusinesses(req, res) {
  const db = await readDB();

  const businesses = db.businesses.filter(
    b => b.ownerId === req.user.id
  );

  res.json({
    success: true,
    message: "Your businesses retrieved.",
    data: { businesses }
  });
}

async function getBusiness(req, res) {
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

  res.json({
    success: true,
    message: "Business retrieved.",
    data: { business }
  });
}

async function updateBusiness(req, res) {
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

  if (business.ownerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You do not own this business."
    });
  }

  const allowed = [
    "businessName",
    "category",
    "description",
    "city",
    "state",
    "sustainabilityType",
    "story",
    "founderName",
    "contactEmail",
    "contactPhone"
  ];

  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      business[field] = req.body[field];
    }
  });

  business.updatedAt = new Date().toISOString();

  await writeDB(db);

  res.json({
    success: true,
    message: "Business updated.",
    data: { business }
  });
}

async function deleteBusiness(req, res) {
  const db = await readDB();

  const index = db.businesses.findIndex(
    b => b.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Business not found."
    });
  }

  if (db.businesses[index].ownerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You do not own this business."
    });
  }

  db.businesses.splice(index, 1);

  db.products = db.products.filter(
    p => p.businessId !== req.params.id
  );

  db.impactRecords = db.impactRecords.filter(
    i => i.businessId !== req.params.id
  );

  await writeDB(db);

  res.json({
    success: true,
    message: "Business deleted."
  });
}

module.exports = {
  createBusiness,
  getBusinesses,
  getMyBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness
};