const VisaApplication = require("../model/VisaApplication");
const Admin = require("../model/adminModels/adminModel");
const mongoose = require("mongoose");
const PlatformSettings = require("../model/PlatformSettings");
const { sendMail } = require("../config/nodemailer");
const {
  getStatusUpdateTemplate,
} = require("../emails/statusUpdateTemplate.js");
const { sendNotification } = require("../config/sendNotification");

// ✨ Format date: DDMMYYHHmm
const formatFullTimestamp = (date = new Date()) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}${month}${year}${hours}${minutes}`;
};

// ✨ Get first 3 letters, or 'NA'
const shortCode = (str) => {
  if (!str || typeof str !== "string") return "NA";
  return str
    .trim()
    .substring(0, 3)
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .padEnd(3, "NA");
};

const AddVisaApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    let {
      fullName,
      dob,
      nationality,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      destinationCountry,
      travelPurpose,
      travelDate,
      travelDurationInDays,
      email,
      phone,
      address,
      employmentStatus,
      isDraft = "true",
    } = req.body;

    isDraft = isDraft === true || isDraft === "true";

    const visaPayload = {
      user: userId,
      isDraft,
      fullName,
      dob,
      nationality,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      destinationCountry,
      travelPurpose,
      travelDate,
      travelDurationInDays,
      email,
      phone,
      address,
      employmentStatus,
    };

    // 🧼 Remove empty fields if draft
    if (isDraft) {
      for (const key in visaPayload) {
        if (
          visaPayload[key] === undefined ||
          visaPayload[key] === null ||
          visaPayload[key] === ""
        ) {
          delete visaPayload[key];
        }
      }
    }

    // 🧠 Generate new applicationId
    const countryCode = shortCode(destinationCountry);
    const purposeCode = shortCode(travelPurpose);
    const timestamp = formatFullTimestamp(); // DDMMYYHHmm

    let baseId = `${countryCode}${timestamp}${purposeCode}`;
    let finalId = baseId;
    let count = 1;

    // 🛡️ Ensure uniqueness
    while (await VisaApplication.findOne({ applicationId: finalId })) {
      finalId = `${baseId}${count}`;
      count++;
    }

    visaPayload.applicationId = finalId;

    const newApplication = new VisaApplication(visaPayload);
    await newApplication.save();

    return res.status(201).json({
      success: true,
      message: isDraft
        ? "Visa application saved as draft."
        : "Visa application submitted successfully.",
      applicationId: newApplication.applicationId,
      id: newApplication._id,
      isDraft: newApplication.isDraft,
    });
  } catch (error) {
    console.error("Visa application error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// update visa application
const updateVisaApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.id;

    const existingApplication = await VisaApplication.findOne({
      _id: applicationId,
      user: userId,
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found.",
      });
    }

    const {
      fullName,
      dob,
      nationality,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      destinationCountry,
      travelPurpose,
      travelDate,
      travelDurationInDays,
      email,
      phone,
      address,
      employmentStatus,
      isDraft,
    } = req.body;

    const isDraftBool = isDraft === true || isDraft === "true";

    const updatedFields = {
      isDraft: isDraftBool,
      fullName,
      dob,
      nationality,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      destinationCountry,
      travelPurpose,
      travelDate,
      travelDurationInDays,
      email,
      phone,
      address,
      employmentStatus,
    };

    // Clean up empty values if it's a draft
    if (isDraftBool) {
      Object.keys(updatedFields).forEach((key) => {
        if (
          updatedFields[key] === undefined ||
          updatedFields[key] === null ||
          updatedFields[key] === ""
        ) {
          delete updatedFields[key];
        }
      });
    }

    await VisaApplication.findByIdAndUpdate(applicationId, updatedFields, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: isDraftBool
        ? "Visa draft updated successfully."
        : "Visa application updated and submitted successfully.",
    });
  } catch (error) {
    console.error("Visa application update error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const getVisaApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    // Pagination defaults
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Use ?page=1&limit=10",
      });
    }

    // Query filters
    const {
      applicationStatus,
      travelPurpose,
      destinationCountry,
      employmentStatus,
      priority,
      paymentStatus,
      fromDate,
      toDate,
    } = req.query;

    const query = { user: userId };
    if (applicationStatus) query.applicationStatus = applicationStatus;
    if (travelPurpose) query.travelPurpose = travelPurpose;
    if (destinationCountry) query.destinationCountry = destinationCountry;
    if (employmentStatus) query.employmentStatus = employmentStatus;
    if (priority) query.priority = priority;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Fetch platform settings once
    const settings = await PlatformSettings.findOne();
    const visaFee = settings?.visaFee || 0;
    const platformFee = settings?.platformFee || 0;
    const paymentGatewayFee = settings?.paymentGatewayFee || 0;
    const gstPercent = settings?.gstPercent || 0;
    const totalFee =
      visaFee + platformFee + paymentGatewayFee + (visaFee * gstPercent) / 100;

    // Fetch paginated applications
    const [applications, total] = await Promise.all([
      VisaApplication.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // for modifying the object
      VisaApplication.countDocuments(query),
    ]);

    // Inject visaFee if payment is pending or failed
    const enrichedApplications = applications.map((app) => {
      if (["Pending", "Failed"].includes(app.paymentStatus)) {
        return {
          ...app,
          payableAmount: visaFee,
          platformFee,
          paymentGatewayFee,
          gstPercent,
          totalFee,
        };
      }
      return app;
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        applications: enrichedApplications.slice().reverse(), // new item first
      },
    });
  } catch (error) {
    console.error("Error fetching visa applications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Get a specific visa application by ID

const getVisaApplicationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.id;

    const application = await VisaApplication.findOne({
      _id: applicationId,
      user: userId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching visa application:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// admin side

const getAllVisaApplicationsAdmin = async (req, res) => {
  try {
    const applications = await VisaApplication.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No visa applications found.",
      });
    }

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching visa applications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Get a specific visa application by ID for admin

const getVisaApplicationByIdAdmin = async (req, res) => {
  try {
    const applicationId = req.params.id;

    const application = await VisaApplication.findById(applicationId).populate(
      "user",
      "name email"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching visa application:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// assign visa expert

const assignVisaExpert = async (req, res) => {
  try {
    const { id } = req.params;
    const { expertId, priority, deadline } = req.body;

    if (!expertId || !priority || !deadline) {
      return res.status(400).json({
        success: false,
        message: "expertId, priority, and deadline are required",
      });
    }

    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority value",
      });
    }

    // 🔍 Validate that expertId is actually an EXPERT from Admins
    const expert = await Admin.findOne({ _id: expertId, role: "EXPERT" });
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert not found or not authorized.",
      });
    }

    const updated = await VisaApplication.findByIdAndUpdate(
      id,
      {
        expert: expertId,
        priority,
        assignedAt: new Date(),
        deadline: new Date(deadline),
      },
      { new: true }
    ).populate("expert", "name email phone");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expert assigned successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Assign expert error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// expert side

// Get all visa applications assigned to a specific expert
const getVisaApplicationsByExpert = async (req, res) => {
  try {
    const expertId = req.user.id;

    const applications = await VisaApplication.find({ expert: expertId })
      .sort({ createdAt: -1 })
      .populate("user", "name email phone");

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No visa applications found for this expert.",
      });
    }

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching visa applications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Get a specific visa application by ID for expert
const getVisaApplicationsByIdByExpert = async (req, res) => {
  try {
    const expertId = req.user.id;
    const applicationId = req.params.id;

    const application = await VisaApplication.findById(applicationId)
      .populate("user", "name email phone address country nationality")
      .populate("expert", "name email phone");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching visa application:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Update visa application status and send email notification

const updateVisaApplicationStatus = async (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body;

  try {
    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        message: "Application ID and status are required.",
      });
    }

    const updated = await VisaApplication.findByIdAndUpdate(
      applicationId,
      { applicationStatus: status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found.",
      });
    }

    // Respond quickly, don’t wait for email to finish
    res.status(200).json({
      success: true,
      message: "Visa application status updated.",
      data: updated,
    });

    // ✅ Fire email in background — don’t block response
    const clientName = updated.fullName || "Client";
    const clientEmail = updated.email;
    const referenceNumber = updated.applicationId || updated._id;
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (clientEmail) {
      const subject = "[Axe Visa] Visa Application Status Update";
      const htmlMessage = getStatusUpdateTemplate({
        clientName,
        referenceNumber,
        status,
        date: currentDate,
      });

      sendMail(clientEmail, subject, htmlMessage, true)
        .then((result) => {
          console.log(`📧 Email sent to ${clientEmail}:`, result.message);
        })
        .catch((mailErr) => {
          console.warn(
            `⚠️ Email failed for ${clientEmail}:`,
            mailErr.message || mailErr
          );
        });
    } else {
      console.warn(`⚠️ No email found for application ID ${applicationId}`);
    }
  } catch (error) {
    console.error("❌ Visa status update failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// add visa checklist
const addChecklistNote = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { note, subnote } = req.body;

    if (!note || note.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note is required.",
      });
    }

    const application = await VisaApplication.findById(applicationId).populate(
      "user"
    ); // need user for notification
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found.",
      });
    }

    const trimmedNote = note.trim();
    application.checklist.push({ note: trimmedNote, subnote: subnote || null });
    await application.save();

    // 🔔 Send notification to user
    const notificationTitle = `Please upload document: ${trimmedNote}`;
    const notificationMessage = subnote ? `Note: ${subnote}` : "";

    await sendNotification({
      visaApplication: applicationId,
      title: notificationTitle,
      message: notificationMessage,
      to: "user",
    });

    return res.status(200).json({
      success: true,
      message: "Checklist note added successfully.",
      checklist: application.checklist,
    });
  } catch (error) {
    console.error("Add checklist note error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// upload visa documents

const uploadVisaDocs = async (req, res) => {
  try {
    const { applicationId, checklistId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!applicationId || !checklistId) {
      return res.status(400).json({
        success: false,
        message: "applicationId and checklistId are required.",
      });
    }

    // Validate file
    const filePaths = req.uploadedFiles?.["doc"];
    if (!filePaths || filePaths.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No document file(s) uploaded.",
      });
    }

    // Find the visa application
    const visaApp = await VisaApplication.findById(applicationId);
    if (!visaApp) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found.",
      });
    }

    // Find the checklist item
    const checklistItem = visaApp.checklist.id(checklistId);
    if (!checklistItem) {
      return res.status(404).json({
        success: false,
        message: "Checklist item not found.",
      });
    }

    // Attach first uploaded file (supporting one file here)
    const uploadedDocName = filePaths[0].split("/").pop(); // Extract file name
    checklistItem.file = filePaths[0];
    checklistItem.accepted = "Pending";
    checklistItem.remarks = "";

    // Save application with updated checklist
    await visaApp.save();

    // 🔔 Send notification to admin
    const notificationTitle = `${visaApp.fullName} uploaded ${checklistItem.note} document.`;
    await sendNotification({
      visaApplication: applicationId,
      title: notificationTitle,
      to: "admin", // You can customize this based on your actual admin logic
    });

    // Response
    res.status(200).json({
      success: true,
      message: "Document uploaded successfully.",
      checklist: visaApp.checklist.map((item) => ({
        _id: item._id,
        note: item.note,
        file: item.file,
      })),
    });
  } catch (err) {
    console.error("Error uploading visa doc:", err);
    res.status(500).json({
      success: false,
      message: "Server error while uploading document.",
      error: err.message,
    });
  }
};

// reject checklist note

const rejectChecklistNote = async (req, res) => {
  try {
    const { applicationId, checklistId, remarks, status } = req.body;

    // Validate required fields
    if (!applicationId || !checklistId || !status) {
      return res.status(400).json({
        success: false,
        message: "applicationId, checklistId, and status are required.",
      });
    }

    // Find visa application
    const visaApp = await VisaApplication.findById(applicationId).populate(
      "user"
    ); // for user info
    if (!visaApp) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found.",
      });
    }

    // Find checklist item
    const checklistItem = visaApp.checklist.id(checklistId);
    if (!checklistItem) {
      return res.status(404).json({
        success: false,
        message: "Checklist item not found.",
      });
    }

    // Update the checklist item
    checklistItem.accepted = status;
    checklistItem.remarks = remarks || "";

    // Save changes
    await visaApp.save();

    console.log("Checklist item updated:", {
      applicationId,
      checklistId,
      status,
      remarks,
    });

    // 🔔 Send notification to user

    const notificationTitle = `${checklistItem.note} document was ${status}`;
    const notificationMessage = remarks ? `Reason: ${remarks}` : "";
    await sendNotification({
      visaApplication: applicationId,
      title: notificationTitle,
      message: notificationMessage,
      to: "user",
    });

    res.status(200).json({
      success: true,
      message: "Checklist item rejected successfully.",
      checklist: visaApp.checklist.map((item) => ({
        _id: item._id,
        note: item.note,
        file: item.file,
        accepted: item.accepted,
        remarks: item.remarks,
      })),
    });
  } catch (error) {
    console.error("Error rejecting checklist note:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting checklist note.",
      error: error.message,
    });
  }
};

// Exporting all the functions
module.exports = {
  AddVisaApplication,
  getVisaApplication,
  getVisaApplicationById,
  getAllVisaApplicationsAdmin,
  getVisaApplicationByIdAdmin,
  assignVisaExpert,
  getVisaApplicationsByExpert,
  getVisaApplicationsByIdByExpert,
  updateVisaApplicationStatus,
  updateVisaApplication,
  addChecklistNote,
  uploadVisaDocs,
  rejectChecklistNote,
};
