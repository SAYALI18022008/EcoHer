require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const businessRoutes = require("./routes/businessRoutes");
const productRoutes = require("./routes/productRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const impactRoutes = require("./routes/impactRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const adminRoutes = require("./routes/adminRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "EcoHer backend is running.",
    data: {
      status: "healthy"
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api", productRoutes);
app.use("/api", verificationRoutes);
app.use("/api", impactRoutes);
app.use("/api", mentorRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
====================================
        EcoHer Backend
====================================

Server: http://localhost:${PORT}
Health: http://localhost:${PORT}/api/health

====================================
`);
});