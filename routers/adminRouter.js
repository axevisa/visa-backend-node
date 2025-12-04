const router = require("express").Router();
const adminController = require("../controllers/adminController");
const visaController = require("../controllers/visaController");
const passportController = require("../controllers/passportController");
const paymentController = require("../controllers/paymentController");
const publicController = require("../controllers/publicController");
const { adminAuth } = require("../middleware/authentication");

router.put(
  "/update-admin-password",
  adminAuth,
  adminController.updateAdminPassword
);

// Admin routes
router.get("/users", adminAuth, adminController.getAllUsers);
router.get("/user/:id", adminAuth, adminController.getUserById);

router.get("/all-experts", adminAuth, adminController.getAllExperts);
router.get("/expert/:id", adminAuth, adminController.getExpertById);
router.put("/update-expert/:id", adminAuth, adminController.updateExpert);

// visa admin routes
router.get(
  "/visa-applications",
  adminAuth,
  visaController.getAllVisaApplicationsAdmin
);
router.get(
  "/visa-application/:id",
  adminAuth,
  visaController.getVisaApplicationByIdAdmin
);

router.post("/add-checklist/:id", adminAuth, visaController.addChecklistNote);

router.put(
  "/update-checklist-note",
  adminAuth,
  visaController.rejectChecklistNote
);

router.post("/assign-expert/:id", adminAuth, visaController.assignVisaExpert);

router.put(
  "/update-visa-application-status/:id",
  adminAuth,
  visaController.updateVisaApplicationStatus
);

// passport admin routes
router.get(
  "/passport-applications",
  adminAuth,
  passportController.getAllPassportApplicationsAdmin
);

router.get(
  "/passport-application/:id",
  adminAuth,
  passportController.getPassportApplicationByIdAdmin
);

router.post(
  "/assign-expert-passport/:id",
  adminAuth,
  passportController.assignPassportExpert
);

router.get("/get-user-docs/:id", adminAuth, adminController.getUserDocsById);
router.put(
  "/chnage-doc-status/:id",
  adminAuth,
  adminController.chnageDocStatus
);

// Platform settings
router.get(
  "/platform-settings",
  adminAuth,
  adminController.getPlatformSettings
);
router.put(
  "/platform-settings",
  adminAuth,
  adminController.updatePlatformSettings
);
router.post(
  "/platform-settings",
  adminAuth,
  adminController.createPlatformSettings
);

// Payment routes
router.get("/all-payments", adminAuth, paymentController.getAllPaymentsAdmin);

//support tickets
router.get("/support-tickets", adminAuth, adminController.getAllSupportTickets);
router.post(
  "/send-support-message/:id",
  adminAuth,
  adminController.sendSupportMessage
);
router.put("/close-ticket/:id", adminAuth, adminController.closeSupportTicket);

//dashboard stats
router.get("/dashboard-stats", adminAuth, adminController.getDashboardStats);

// packeges
router.get("/packages", adminAuth, adminController.getAllPackages);
router.post("/add-package", adminAuth, adminController.addPackage);
router.put("/update-package/:id", adminAuth, adminController.updatePackage);
router.delete("/delete-package/:id", adminAuth, adminController.deletePackage);
router.put(
  "/update-package-status/:id",
  adminAuth,
  adminController.updatePackageStatus
);

//contact us query

router.get(
  "/contact-us-queries",
  adminAuth,
  adminController.getAllContactQueries
);

//custom mail

router.post("/send-custom-email", adminController.sendCustomEmail);

//send appointment email
router.post("/send-appointment-email", adminController.bookAppointment);

//emergency visa application
router.get(
  "/emergency-visa-application",
  adminAuth,
  adminController.getEmergencyVisaApplication
);

//submit ads query
router.get("/ads-query", adminAuth, adminController.getAdsQuery);

router.delete(
  "/delete-ads-query/:id",
  adminAuth,
  publicController.deleteAdsQuery
);

//action form
router.get(
  "/get-fullaction-form",
  adminAuth,
  publicController.getFullActionForm
);
router.put(
  "/chnage-action-form-status/:id",
  adminAuth,
  publicController.chnageActionFormStatus
);

router.delete(
  "/delete-action-form/:id",
  adminAuth,
  publicController.deleteActionForm
);

//visa assessment reports
router.get(
  "/assessments",
  adminAuth,
  publicController.getAllAssessments
);

module.exports = router;
