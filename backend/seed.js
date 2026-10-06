require("dotenv").config();

const crypto = require("crypto");
const {
  hashPassword
} = require("./src/utils/auth");

const {
  readDB,
  writeDB
} = require("./src/utils/db");

async function seed() {
  const db = await readDB();

  db.users = [];
  db.businesses = [];
  db.products = [];
  db.verificationSubmissions = [];
  db.impactRecords = [];
  db.mentorProfiles = [];
  db.mentorshipRequests = [];

  const adminId = crypto.randomUUID();
  const ashaId = crypto.randomUUID();
  const meenaId = crypto.randomUUID();

  db.users.push(
    {
      id: adminId,
      name: "EcoHer Admin",
      email: "admin@ecoher.com",
      passwordHash: await hashPassword("Admin@123"),
      role: "admin",
      location: "Pune",
      language: "English"
    },
    {
      id: ashaId,
      name: "Asha",
      email: "asha@ecoher.com",
      passwordHash: await hashPassword("Asha@123"),
      role: "entrepreneur",
      location: "Pune",
      language: "English"
    },
    {
      id: meenaId,
      name: "Meena Sharma",
      email: "meena@ecoher.com",
      passwordHash: await hashPassword("Meena@123"),
      role: "mentor",
      location: "Pune",
      language: "English"
    }
  );

  const businessId = crypto.randomUUID();

  db.businesses.push({
    id: businessId,
    ownerId: ashaId,
    businessName: "Asha Upcycles",
    category: "Upcycled Fashion",
    description:
      "Sustainable products made from discarded textile materials.",
    city: "Pune",
    state: "Maharashtra",
    sustainabilityType: "Textile Waste Reuse",
    verificationLevel: "Community Verified",
    verificationStatus: "approved",
    story:
      "Asha creates useful everyday products from old sarees and discarded textiles.",
    founderName: "Asha",
    contactEmail: "asha@ecoher.com",
    contactPhone: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  db.products.push(
    {
      id: crypto.randomUUID(),
      businessId,
      productName: "Upcycled Saree Tote Bag",
      description:
        "Reusable tote bag made from an upcycled saree.",
      price: 499,
      materialUsed: "Upcycled saree fabric",
      imageUrl: "",
      isAvailable: true,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      businessId,
      productName: "Reusable Fabric Pouch",
      description:
        "Reusable pouch made from leftover textile material.",
      price: 199,
      materialUsed: "Reused fabric",
      imageUrl: "",
      isAvailable: true,
      createdAt: new Date().toISOString()
    }
  );

  db.impactRecords.push(
    {
      id: crypto.randomUUID(),
      businessId,
      metricType: "textile_waste_reused",
      value: 18,
      unit: "kg",
      calculationMethod:
        "36 products × 0.5 kg textile waste per product = 18 kg",
      isEstimated: true,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      businessId,
      metricType: "women_supported",
      value: 3,
      unit: "people",
      calculationMethod:
        "Number of women supported by the entrepreneur-provided data.",
      isEstimated: true,
      createdAt: new Date().toISOString()
    }
  );

  db.mentorProfiles.push({
    id: crypto.randomUUID(),
    userId: meenaId,
    bio: "Mentor supporting sustainable entrepreneurs.",
    expertise: [
      "Branding",
      "Product Photography",
      "Instagram Marketing"
    ],
    languages: [
      "English",
      "Hindi",
      "Marathi"
    ],
    yearsOfExperience: 4,
    available: true,
    city: "Pune",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await writeDB(db);

  console.log("EcoHer seed completed.");
  console.log("");
  console.log("Admin:      admin@ecoher.com / Admin@123");
  console.log("Entrepreneur: asha@ecoher.com / Asha@123");
  console.log("Mentor:       meena@ecoher.com / Meena@123");
}

seed().catch(console.error);