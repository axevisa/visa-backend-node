const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const db = require("./config/db");
const dynamicUpload = require("./middleware/multer");
const adminRoute = require("./routers/adminRouter");
const publicRoute = require("./routers/publicRouter");
const userRoute = require("./routers/userRouter");
const expertRoute = require("./routers/expertRouter");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
db();

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://103.189.172.145",
    "http://103.189.172.145:3000",
    "https://axevisa.com",
    "https://www.axevisa.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/admin", adminRoute);
app.use("/api/public", publicRoute);
app.use("/api/user", userRoute);
app.use("/api/expert", expertRoute);

// Upload route
app.post("/upload", dynamicUpload("profilePics"), (req, res) => {
  const image = req.file?.filePath;
  if (!image) {
    return res.status(400).send("No file uploaded.");
  }
  res.status(200).json({ filePath: image });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
