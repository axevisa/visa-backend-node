const router = require("express").Router();
const {
  getVisaApplicationsByExpert,
  getVisaApplicationsByIdByExpert,
  updateVisaApplicationStatus,
  addChecklistNote,
  rejectChecklistNote,
} = require("../controllers/visaController");
const {
  getPassportApplicationsByExpert,
  getPassportApplicationsByIdByExpert,
  updatePassportApplicationStatus,
} = require("../controllers/passportController");
const {
  getUserDocsById,
  chnageDocStatus,
  sendSupportMessage,
  getAllSupportTickets,
  closeSupportTicket,
  getExpertStats,
  sendCustomEmail,
  bookAppointment,
} = require("../controllers/adminController");

const { expertAuth } = require("../middleware/authentication");
const { get } = require("mongoose");

router.get("/get-visa-application", expertAuth, getVisaApplicationsByExpert);

router.get(
  "/get-visa-application/:id",
  expertAuth,
  getVisaApplicationsByIdByExpert
);

router.put(
  "/update-visa-application-status/:id",
  expertAuth,
  updateVisaApplicationStatus
);

router.post("/add-checklist/:id", expertAuth, addChecklistNote);
router.put("/update-checklist-note", expertAuth, rejectChecklistNote);
// passport routes

router.get(
  "/get-passport-application",
  expertAuth,
  getPassportApplicationsByExpert
);

router.get(
  "/get-passport-application/:id",
  expertAuth,
  getPassportApplicationsByIdByExpert
);

router.put(
  "/update-passport-application-status/:id",
  expertAuth,
  updatePassportApplicationStatus
);

router.get("/get-user-doc/:id", expertAuth, getUserDocsById);
router.put("/chnage-doc-status/:id", expertAuth, chnageDocStatus);

//support tickets
router.get("/support-tickets", expertAuth, getAllSupportTickets);
router.post("/send-support-message/:id", expertAuth, sendSupportMessage);
router.put("/close-ticket/:id", expertAuth, closeSupportTicket);

//dashboard stats
router.get("/expert-stats", expertAuth, getExpertStats);

// send custom mail

router.post("/send-custom-email", expertAuth, sendCustomEmail);
router.post("/send-appointment-email", expertAuth, bookAppointment);

module.exports = router;
