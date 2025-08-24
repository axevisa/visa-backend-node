const adminModel = require("../model/adminModels/adminModel");
const User = require("../model/userModel");
const PackagePricing = require("../model/PackagePricing");
const ContactQuery = require("../model/ContactQuery");
const EmergencyVisaApplication = require("../model/emergencyVisaApplication");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { sendMail } = require("../config/nodemailer");
const { getWelcomeEmailTemplate } = require("../emails/welcomeTemplate.js");
const { getOtpEmailTemplate } = require("../emails/otp.js");
const ActionFormSubmission = require("../model/ActionFormSubmission");
const axios = require("axios");
// Register admin

const registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({
      email: email,
    });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin already exists", success: false });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new admin
    const newAdmin = new adminModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "ADMIN",
    });
    await newAdmin.save();
    res
      .status(201)
      .json({ message: "Admin registered successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};
// Login admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }

    // Check if admin exists
    const existingAdmin = await adminModel.findOne({
      email: email,
    });
    if (!existingAdmin) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingAdmin.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: existingAdmin._id, role: existingAdmin.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.status(200).json({ token, admin: existingAdmin, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

const registerExpert = async (req, res) => {
  try {
    const { name, email, phone, password, country } = req.body;

    if (!name || !email || !phone || !password || !country) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }

    // Check if expert already exists
    const existingExpert = await adminModel.findOne({
      email: email,
    });
    if (existingExpert) {
      return res
        .status(400)
        .json({ message: "Expert already exists", success: false });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new expert
    const newExpert = new adminModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "EXPERT",
      country,
    });
    await newExpert.save();
    res
      .status(201)
      .json({ message: "Expert registered successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};
const loginExpert = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if expert exists
    const existingExpert = await adminModel.findOne({
      email: email,
    });
    if (!existingExpert) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingExpert.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: existingExpert._id, role: existingExpert.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.status(200).json({ token, expert: existingExpert, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// user auth routes

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, nationality, password } = req.body;

    if (!name || !email || !phone || !nationality || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      nationality,
      otp: 1234,
      password: hashedPassword,
    });

    await newUser.save();

    // 🔥 Attempt to send welcome email (non-blocking)
    try {
      const subject = "🎉 Welcome to Axe Visa!";
      const htmlMessage = getWelcomeEmailTemplate({ name });

      await sendMail(email, subject, htmlMessage, true);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (mailErr) {
      console.warn(
        `⚠️ Failed to send welcome email to ${email}:`,
        mailErr.message
      );
    }

    return res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.error("❌ Register error:", error);
    return res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({
      email: email,
    });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    // If user signed up via Google and has no password, block password login
    if (!existingUser.password) {
      return res.status(400).json({
        message:
          "Password login not available for this account. Use Google login.",
        success: false,
      });
    }

    // genarate otp
    // const otp = Math.floor(100000 + Math.random() * 900000);
    // const otp = 1234;
    // send otp to user
    // const message = `Your OTP is ${otp}`;
    // update user otp
    // existingUser.otp = otp;

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: existingUser._id, role: existingUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.status(200).json({ token, user: existingUser, success: true });
    // update user otp
    // await existingUser.save();
    // res.status(200).json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// User login or register using phone number
const userLoginRegister = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number", success: false });
    }

    // const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
    const otp = 1234; // For testing purposes, use a static OTP
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    let user = await User.findOne({ phone });
    console.log("User found:", user);

    if (user) {
      console.log("Updating existing user OTP");
      user.otp = otp.toString();
      user.otpExpiry = otpExpiry;
    } else {
      console.log("Creating new user with OTP");
      user = new User({
        phone,
        otp: otp.toString(),
        otpExpiry,
      });
    }

    await user.save();

    // TODO: Integrate with SMS provider like Twilio, Msg91, Fast2SMS etc.
    // await sendOtp(phone, `Your OTP is ${otp}`);

    return res.status(200).json({
      message: "OTP sent successfully",
      success: true,
      otp, // REMOVE THIS in production for security reasons
    });
  } catch (error) {
    console.error("Login/Register Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// Verify user otp

const userOtpVerify = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Input validation
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ message: "Phone and OTP are required", success: false });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Check if OTP matches and is not expired
    const now = new Date();
    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < now) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP", success: false });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send only safe fields
    const safeUser = {
      id: user._id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      kycVerified: user.kycVerified,
      profilePic: user.profilePic,
    };

    return res
      .status(200)
      .json({ message: "OTP verified", token, user: safeUser, success: true });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// Check visa

const checkVisa = async (req, res) => {
  const { source, destination } = req.body;

  if (!source || !destination) {
    return res
      .status(400)
      .json({ error: "source and destination are required" });
  }

  const filePath = path.join(__dirname, "../csv/passport-index-tidy-iso2.csv"); // Put your CSV in /data folder

  let found = false;

  try {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Trim and normalize data
        const passport = row.Passport?.trim().toUpperCase();
        const dest = row.Destination?.trim().toUpperCase();

        if (
          passport === source.toUpperCase() &&
          dest === destination.toUpperCase()
        ) {
          found = true;
          results.push(row.Requirement);
        }
      })
      .on("end", () => {
        if (!found) {
          return res.status(404).json({ requirement: "Not Found" });
        }
        return res.json({ requirement: results[0] });
      });
  } catch (err) {
    console.error("❌ Visa Check Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// get all packages

const getPackeagesweb = async (req, res) => {
  try {
    const packages = await PackagePricing.find({ isActive: true });
    res.status(200).json({ success: true, packages });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// contact us

const contactUs = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, serviceType, message } =
      req.body;

    // Create and save new contact query
    const contact = new ContactQuery({
      firstName,
      lastName,
      email,
      phone,
      serviceType,
      message,
    });

    await contact.save();

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// Send OTP to email (for password reset or other purposes)

const sendEmailOtpforgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const htmlTemplate = getOtpEmailTemplate({
      name: user.full_name || "User",
      otp,
    });

    const emailResponse = await sendMail(
      email,
      "Reset Password OTP - Axe Visa",
      htmlTemplate,
      true
    );

    if (!emailResponse.success) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP email", success: false });
    }

    return res
      .status(200)
      .json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Verify OTP for forgot password

const userOtpVerifyforgotPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    if (user.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password reset successfully", success: true });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Submit emergency form (assuming this is a new function)
const SubmitEmergencyVisaForm = async (req, res) => {
  try {
    console.log("➡️ Incoming Request Body:", req.body);
    console.log("📎 Uploaded Files:", req.uploadedFiles);

    const {
      fullName,
      nationality,
      residence,
      destination,
      purpose,
      emergencyReason,
      travelDate,
      phone,
      email,
    } = req.body;

    const uploaded = req.uploadedFiles || {};

    const newApplication = new EmergencyVisaApplication({
      fullName,
      nationality,
      residence,
      destination,
      purpose,
      emergencyReason,
      travelDate,
      phone,
      email,
      documents: {
        passport: uploaded.passport || null,
        invitation: uploaded.invitation || null,
        flight: uploaded.flight || null,
        hotel: uploaded.hotel || null,
        additional: uploaded.supportingDocument || [],
      },
    });

    console.log("📦 New Application Payload:", newApplication);

    await newApplication.save();

    console.log("✅ Application Saved Successfully");

    return res.status(201).json({
      message: "Emergency visa application submitted successfully",
      application: newApplication,
    });
  } catch (error) {
    console.error("❌ Emergency Visa Submission Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Action form submission (assuming this is a new function)

const submitActionForm = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      destination,
      serviceType,
      // source and status will be hardcoded
    } = req.body;

    // Basic validation (still applies)
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !destination ||
      !serviceType
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newForm = new ActionFormSubmission({
      firstName,
      lastName,
      email,
      phone,
      destination,
      serviceType,
      source: "emergency visa", // 👈 Hardcoded value
      status: "pending", // 👈 Hardcoded value
    });

    const savedForm = await newForm.save();

    res.status(201).json({
      message: "Action form submitted successfully.",
      data: savedForm,
    });
  } catch (error) {
    console.error("Action Form Submission Error:", error.message);
    res.status(500).json({
      message: "Something went wrong while submitting the form.",
      error: error.message,
    });
  }
};

// login with google
// Requires env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

// STEP 1: Redirect user to Google OAuth
const googleLogin = (req, res) => {
  try {
    // Use backend callback URL for Google OAuth
    const backendRedirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:4000/api/public/google/callback";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const scope = encodeURIComponent("openid email profile");

    if (!clientId) {
      return res
        .status(500)
        .json({ success: false, message: "Google OAuth not configured" });
    }

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&redirect_uri=${encodeURIComponent(
        backendRedirectUri
      )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    return res.redirect(authUrl);
  } catch (e) {
    console.error("Google login error:", e.message);
    return res.status(500).json({ success: false, message: "Auth error" });
  }
};

// STEP 2: Google callback → exchange code for tokens → decode user info
const googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    if (!code) {
      const errorUrl = `https://axevisa.com/pages/auth/google/callback?error=missing_code`;
      return res.redirect(errorUrl);
    }

    // Exchange code for tokens (use backend callback URL)
    const backendRedirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      "https://axevisa.com/api/public/google/callback";

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: backendRedirectUri,
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const { id_token } = tokenRes.data;
    if (!id_token) {
      const errorUrl = `https://axevisa.com/pages/auth/google/callback?error=no_token`;
      return res.redirect(errorUrl);
    }

    // Verify token and get user info from Google
    const infoRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`
    );
    const userInfo = infoRes.data; // contains sub, email, name, picture, etc.

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [
        { googleId: userInfo.sub },
        { email: userInfo.email?.toLowerCase() },
      ],
    });

    if (!user) {
      user = await User.create({
        googleId: userInfo.sub,
        name: userInfo.name || userInfo.given_name || "",
        email: userInfo.email?.toLowerCase() || undefined,
        profilePic: userInfo.picture || "",
        authProvider: "google",
      });
    } else {
      // Link googleId if not linked yet
      let changed = false;
      if (!user.googleId) {
        user.googleId = userInfo.sub;
        changed = true;
      }
      if (!user.profilePic && userInfo.picture) {
        user.profilePic = userInfo.picture;
        changed = true;
      }
      if (user.authProvider !== "google") {
        user.authProvider = "google";
        changed = true;
      }
      if (changed) await user.save();
    }

    // Issue app JWT (keep same behavior and expiry policy)
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie for same-origin requests
    res.cookie("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to your frontend with token
    const frontendRedirectUrl = `https://axevisa.com/pages/auth/google/callback?token=${appToken}&success=true&user=${JSON.stringify(
      user
    )}`;
    return res.redirect(frontendRedirectUrl);
  } catch (err) {
    console.error("Google OAuth error", err.response?.data || err.message);
    const errorUrl = `https://axevisa.com/pages/auth/google/callback?error=auth_failed`;
    return res.redirect(errorUrl);
  }
};

// Logout user - Clear JWT cookie
const logout = (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: error.message,
    });
  }
};

// exporting the functions

module.exports = {
  registerAdmin,
  loginAdmin,
  registerExpert,
  loginExpert,
  registerUser,
  loginUser,
  userOtpVerify,
  userOtpVerifyforgotPassword,
  checkVisa,
  userLoginRegister,
  getPackeagesweb,
  contactUs,
  sendEmailOtpforgotPassword,
  SubmitEmergencyVisaForm,
  submitActionForm,
  googleLogin,
  googleCallback,
  logout,
};
