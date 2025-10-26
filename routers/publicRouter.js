const express = require("express");
const router = express.Router();
const dynamicUpload = require("../middleware/multer");
const {
  registerAdmin,
  loginAdmin,
  registerExpert,
  loginExpert,
  registerUser,
  loginUser,
  userOtpVerify,
  checkVisa,
  userLoginRegister,
  getPackeagesweb,
  contactUs,
  sendEmailOtpforgotPassword,
  userOtpVerifyforgotPassword,
  SubmitEmergencyVisaForm,
  submitActionForm,
  getFullDataActionForm,
  googleLogin,
  googleCallback,
  logout,
  aiVisaChecker,
} = require("../controllers/publicController");

//admin routes
router.post("/admin-register", registerAdmin);
router.post("/admin-login", loginAdmin);

//expert auth routes
router.post("/expert-register", registerExpert);
router.post("/expert-login", loginExpert);

//user auth routes
router.post(
  "/user-register",
  dynamicUpload("profilePics", [{ name: "profilePic", maxCount: 1 }]),
  registerUser
);
router.post("/user-login", loginUser);
router.post("/user-verify-otp", userOtpVerify);

router.post("/user-login-register", userLoginRegister);

// forget password
router.post("/send-email-otp", sendEmailOtpforgotPassword);
router.post("/verify-email-otp", userOtpVerifyforgotPassword);

//website routes

router.post("/check-visa", checkVisa);

// get packeages

router.get("/get-packages", getPackeagesweb);

// contact us
router.post("/contact-us", contactUs);

router.post(
  "/submit-emergency-form",
  dynamicUpload("emergencyDocs", [
    { name: "passport", maxCount: 1 }, // required
    { name: "invitation", maxCount: 1 },
    { name: "flight", maxCount: 1 },
    { name: "hotel", maxCount: 1 },
    { name: "supportingDocument", maxCount: 5 }, // optional array
  ]),
  SubmitEmergencyVisaForm
);

// get action form submission
router.post("/submit-action-form", submitActionForm);

// get full action form
router.post(
  "/get-full-data-action-form",
  dynamicUpload("actionFormDocs", [
    { name: "passport", maxCount: 2 },
    { name: "photo", maxCount: 2 },
    { name: "financial_doc", maxCount: 5 },
    { name: "supportingDocument", maxCount: 5 },
  ]),
  getFullDataActionForm
);

// google login

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// Logout user
router.post("/logout", logout);

// Ai Visa Checker
router.post("/ai-visa-checker", aiVisaChecker);

module.exports = router;
