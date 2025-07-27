const express = require("express");
const router = express.Router();
const dynamicUpload = require("../middleware/multer");
const { userAuth } = require("../middleware/authentication");
const {
  updateUser,
  uploadDocs,
  updateuploadDocs,
  getAllUserDocs,
  supportTicket,
  getSupportTickets,
  sendSupportMessage,
  getUser,
  getUserStats,
} = require("../controllers/userController");
const {
  AddVisaApplication,
  getVisaApplication,
  getVisaApplicationById,
  updateVisaApplication,
  uploadVisaDocs,
} = require("../controllers/visaController");
const {
  addPassportApplication,
  getPassportApplication,
  getPassportApplicationById,
} = require("../controllers/passportController");

const {
  createOrder,
  verifyPayment,
  getUserPaymentHistory,
} = require("../controllers/paymentController");

router.put(
  "/user-update",
  dynamicUpload("profilePics", [{ name: "profilePic", maxCount: 1 }]),
  userAuth,
  updateUser
);

router.get("/details", userAuth, getUser);

// visa admin routes

router.post("/visa-application", userAuth, AddVisaApplication);

router.put("/visa-application/:id", userAuth, updateVisaApplication);

router.get("/visa-application", userAuth, getVisaApplication);
router.get("/visa-application/:id", userAuth, getVisaApplicationById);

router.post(
  "/upload-visa-docs",
  userAuth,
  dynamicUpload("docs", [{ name: "doc", maxCount: 2 }]),
  uploadVisaDocs
);
//passport routes

router.post(
  "/passport-application",
  dynamicUpload("passportDocs", [
    { name: "aadharCard", maxCount: 1 },
    { name: "dobProof", maxCount: 1 },
    { name: "identityProof", maxCount: 1 },
    { name: "passportPhotos", maxCount: 2 },
    { name: "employmentProof", maxCount: 1 },
    { name: "annexures", maxCount: 5 },
    { name: "oldPassport", maxCount: 1 },
    { name: "policeVerificationProof", maxCount: 1 },
  ]),
  userAuth,
  addPassportApplication
);

router.get("/passport-application", userAuth, getPassportApplication);

router.get("/passport-application/:id", userAuth, getPassportApplicationById);

// user docs
router.post(
  "/upload-docs",
  userAuth,
  dynamicUpload("userdocs", [{ name: "doc", maxCount: 2 }]),
  uploadDocs
);

router.get("/user-docs", userAuth, getAllUserDocs);

router.put(
  "/update-user-docs/:id",
  userAuth,
  dynamicUpload("userdocs", [{ name: "doc", maxCount: 2 }]),
  updateuploadDocs
);

// payment routes

router.post("/create-order", userAuth, createOrder);

router.post("/verify-payment", userAuth, verifyPayment);

router.get("/payment-history", userAuth, getUserPaymentHistory);

// support routes
router.post("/support", userAuth, supportTicket);
router.get("/support", userAuth, getSupportTickets);
router.post("/support-message/:ticketId", userAuth, sendSupportMessage);

//dashboard stats

router.get("/dashboard-stats", userAuth, getUserStats);

module.exports = router;
