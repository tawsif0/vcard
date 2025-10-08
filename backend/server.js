require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const profileRoutes = require("./routes/profile");
const aboutRoutes = require("./routes/AboutRoute");
const blogRoutes = require("./routes/blog");
const blogCategoryRoutes = require("./routes/blogCategory");
const navbarRoutes = require("./routes/navbar");
const resumeRoutes = require("./routes/resumeRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const contactRoutes = require("./routes/contactRoutes");
const homeCardRoutes = require("./routes/homeCard");
const profileShareRoutes = require("./routes/profileShare");
const cors = require("cors");
const passwordResetRouter = require("./routes/passwordReset");
const app = express();
const path = require("path");
// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/navbar", navbarRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blog-categories", blogCategoryRoutes);
app.use("/api/password-reset", passwordResetRouter);
app.use("/api/homeCard", homeCardRoutes);
app.use("/api/profile-share", profileShareRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
