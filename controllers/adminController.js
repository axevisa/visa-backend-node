const User = require("../model/userModel");
const Admin = require("../model/adminModels/adminModel");
const UserDocument = require("../model/UserDocument");
const VisaApplication = require("../model/VisaApplication");
const PlatformSettings = require("../model/PlatformSettings");
const SupportTicket = require("../model/SupportTicket");
const PackagePricing = require("../model/PackagePricing");
const ContactQuery = require("../model/ContactQuery");
const { sendMail } = require("../config/nodemailer");
const { getCustomEmailTemplate } = require("../emails/customTemplate.js");
const { getAppointmentTemplate } = require("../emails/appointmentBooked.js");
const moment = require("moment"); // use moment for easy month handling
const { sendNotification } = require("../config/sendNotification");
const Notification = require("../model/NotificationModel");
const bcrypt = require("bcrypt");
const EmergencyVisaApplication = require("../model/emergencyVisaApplication");
const ActionFormSubmission = require("../model/ActionFormSubmission");
// Admin controller functions

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" }).sort({ createdAt: -1 });
    res.status(200).json({ users, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// Get user by ID

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    res.status(200).json({ user, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// Get all experts

exports.getAllExperts = async (req, res) => {
  try {
    const experts = await Admin.find(
      { role: "EXPERT" },
      { name: 1, email: 1, phone: 1, createdAt: 1 }
    ).sort({ createdAt: -1 });

    res.status(200).json({ experts, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// Get expert by ID

exports.getExpertById = async (req, res) => {
  try {
    const expertId = req.params.id;
    const expert = await Admin.findById(expertId);
    if (!expert) {
      return res
        .status(404)
        .json({ message: "Expert not found", success: false });
    }
    res.status(200).json({ expert, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// Update expert details

exports.updateExpert = async (req, res) => {
  try {
    const expertId = req.params.id;
    const { name, email, phone, password, country } = req.body;

    // Build update object dynamically
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (country) updateFields.country = country;

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedExpert = await Admin.findByIdAndUpdate(
      expertId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedExpert) {
      return res.status(404).json({
        success: false,
        message: "Expert not found with provided ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expert updated successfully",
      data: updatedExpert,
    });
  } catch (error) {
    console.error("🔴 Update Expert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during expert update",
      error: error.message,
    });
  }
};

// chnage password admin

exports.updateAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedNewPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("🔴 Error updating password:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating password",
      error: error.message,
    });
  }
};

// Get user documents by ID

exports.getUserDocsById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const userDocs = await UserDocument.find({ user: userId });
    res.status(200).json({ userDocs, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// chnage document status

exports.chnageDocStatus = async (req, res) => {
  try {
    const docId = req.params.id;
    const { status, note } = req.body;

    const updatedDoc = await UserDocument.findByIdAndUpdate(
      docId,
      { isVerified: status, note: note ? note : null },
      { new: true }
    );

    res.status(200).json({ updatedDoc, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// plateform settings

exports.createPlatformSettings = async (req, res) => {
  try {
    const existing = await PlatformSettings.findOne();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Settings already exist. Use PUT to update.",
      });
    }

    const {
      visaFee,
      platformFee,
      paymentGatewayFee,
      gstPercent,
      currency,
      notes,
    } = req.body;

    const newSettings = new PlatformSettings({
      visaFee,
      platformFee,
      paymentGatewayFee,
      gstPercent,
      currency,
      notes,
    });

    await newSettings.save();

    return res.status(201).json({
      success: true,
      message: "Platform settings created.",
      data: newSettings,
    });
  } catch (err) {
    console.error("Create Settings Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.updatePlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Platform settings not found. Please create first.",
      });
    }

    const {
      visaFee,
      platformFee,
      paymentGatewayFee,
      gstPercent,
      currency,
      notes,
    } = req.body;

    if (visaFee !== undefined) settings.visaFee = visaFee;
    if (platformFee !== undefined) settings.platformFee = platformFee;
    if (paymentGatewayFee !== undefined)
      settings.paymentGatewayFee = paymentGatewayFee;
    if (gstPercent !== undefined) settings.gstPercent = gstPercent;
    if (currency !== undefined) settings.currency = currency;
    if (notes !== undefined) settings.notes = notes;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Platform settings updated.",
      data: settings,
    });
  } catch (err) {
    console.error("Update Settings Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.getPlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Platform settings not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error("Get Settings Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get all support tickets

exports.getAllSupportTickets = async (req, res) => {
  try {
    const { status, userId } = req.query;

    const filter = {};
    if (status) filter.status = status.toUpperCase(); // "OPEN" or "CLOSED"
    if (userId) filter.user = userId;

    const tickets = await SupportTicket.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("❌ Error fetching support tickets:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching support tickets.",
      error: error.message,
    });
  }
};

// send message in support ticket

exports.sendSupportMessage = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const senderId = req.user.id; // assuming you’re using JWT-based auth
    const { message, sentBy } = req.body;

    if (!message || !sentBy || !["USER", "ADMIN"].includes(sentBy)) {
      return res.status(400).json({
        success: false,
        message: "Message and valid sentBy (USER or ADMIN) are required.",
      });
    }

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    ticket.messages.push({
      sender: senderId,
      message,
      sentBy,
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Message sent successfully.",
      ticket,
    });
  } catch (error) {
    console.error("❌ Error sending support message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while sending support message.",
      error: error.message,
    });
  }
};

// Close support ticket

exports.closeSupportTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    ticket.status = "CLOSED";
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Support ticket closed successfully.",
      ticket,
    });
  } catch (error) {
    console.error("❌ Error closing support ticket:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while closing support ticket.",
      error: error.message,
    });
  }
};

// dashboard stats

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "USER" });
    const totalExperts = await Admin.countDocuments({ role: "EXPERT" });
    const totalVisaApplications = await VisaApplication.countDocuments();
    const totalOpenSupportTickets = await SupportTicket.countDocuments({
      status: "OPEN",
    });

    // Last 4 full months (excluding current partial month)
    const startDate = moment().subtract(4, "months").startOf("month").toDate();
    const endDate = moment().endOf("month").toDate();

    const rawVisaStats = await VisaApplication.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format the result to include months with 0 if missing
    const monthlyVisaApplications = [];
    for (let i = 3; i >= 0; i--) {
      const date = moment().subtract(i, "months");
      const month = date.month() + 1; // moment month is 0-indexed
      const year = date.year();

      const found = rawVisaStats.find(
        (stat) => stat._id.month === month && stat._id.year === year
      );

      monthlyVisaApplications.push({
        month: date.format("MMMM"), // e.g., "January"
        count: found ? found.count : 0,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalExperts,
        totalVisaApplications,
        totalOpenSupportTickets,
        monthlyVisaApplications,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching dashboard stats.",
      error: error.message,
    });
  }
};

// expert dashboard Stats

exports.getExpertStats = async (req, res) => {
  try {
    const expertId = req.user.id;

    // Step 1: Get all visa application IDs assigned to this expert
    const applications = await VisaApplication.find({ expert: expertId })
      .select("_id")
      .lean();
    const applicationIds = applications.map((app) => app._id);

    // Step 2: Get notifications meant for admin related to these applications
    const adminNotifications = await Notification.find({
      visaApplication: { $in: applicationIds },
      to: "admin",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Step 3: Fire all count queries in parallel 🚀
    const [
      totalVisaApplications,
      approvedVisaApplications,
      pendingVisaApplications,
      rejectedVisaApplications,
      underReviewVisaApplications,
    ] = await Promise.all([
      VisaApplication.countDocuments({ expert: expertId }),
      VisaApplication.countDocuments({
        expert: expertId,
        applicationStatus: "Approved",
      }),
      VisaApplication.countDocuments({
        expert: expertId,
        applicationStatus: "Pending",
      }),
      VisaApplication.countDocuments({
        expert: expertId,
        applicationStatus: "Rejected",
      }),
      VisaApplication.countDocuments({
        expert: expertId,
        applicationStatus: "Under Review",
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalVisaApplications,
        approvedVisaApplications,
        pendingVisaApplications,
        rejectedVisaApplications,
        underReviewVisaApplications,
      },
      notifications: adminNotifications,
    });
  } catch (error) {
    console.error("❌ Error fetching expert dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching expert dashboard stats.",
      error: error.message,
    });
  }
};

// packages
// GET all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await PackagePricing.find();
    res.status(200).json({ success: true, packages });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// POST add a package
exports.addPackage = async (req, res) => {
  try {
    const { name, price, offerPrice, points, notes } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Name and price are required." });
    }

    const newPackage = await PackagePricing.create({
      name,
      price,
      offerPrice,
      points: Array.isArray(points) ? points : [],
      notes,
    });

    res.status(201).json({ success: true, package: newPackage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// PUT update a package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, offerPrice, points, notes } = req.body;

    const updatedPackage = await PackagePricing.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(price && { price }),
        ...(offerPrice && { offerPrice }),
        ...(points && { points }),
        ...(notes && { notes }),
      },
      { new: true }
    );

    if (!updatedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.status(200).json({ success: true, package: updatedPackage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE a package
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPackage = await PackagePricing.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.status(200).json({ success: true, package: deletedPackage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// update package status
exports.updatePackageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedPackage = await PackagePricing.findByIdAndUpdate(
      id,
      { isActive: status },
      { new: true }
    );

    if (!updatedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.status(200).json({ success: true, package: updatedPackage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// contact us query

exports.getAllContactQueries = async (req, res) => {
  try {
    const contactQueries = await ContactQuery.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contactQueries });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// send email

exports.sendCustomEmail = async (req, res) => {
  try {
    const { email, subject, description } = req.body;

    if (!email || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Email, subject, and description are required.",
      });
    }

    const htmlMessage = getCustomEmailTemplate({ subject, description });

    const result = await sendMail(email, subject, htmlMessage, true);

    return res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Failed to send custom email:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending email.",
    });
  }
};

// send appointment email

exports.bookAppointment = async (req, res) => {
  try {
    const { visaApplicationId, time, location, date } = req.body;

    if (!visaApplicationId || !time || !location || !date) {
      return res.status(400).json({
        success: false,
        message: "visaApplicationId, time, location, and date are required.",
      });
    }

    // Fetch visa application + user
    const visaApp = await VisaApplication.findById(visaApplicationId).populate(
      "user"
    );
    if (!visaApp) {
      return res.status(404).json({
        success: false,
        message: "Visa application not found",
      });
    }

    const name = visaApp.fullName || visaApp.user.name || "Applicant";
    const email = visaApp.email || visaApp.user.email;
    const destination = visaApp.destinationCountry;
    const applicationId = visaApp.applicationId || visaApp._id;

    const subject = `[Axe Visa] Appointment Confirmed – ${destination}`;
    const html = getAppointmentTemplate({
      name,
      time,
      location,
      destination,
      applicationId,
      date,
    });

    const result = await sendMail(email, subject, html, true);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Email send failed",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment email sent to ${email}`,
    });
  } catch (err) {
    console.error("💥 Appointment Booking Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// emergency visa application
exports.getEmergencyVisaApplication = async (req, res) => {
  try {
    const applications = await EmergencyVisaApplication.find().sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// get ads query

exports.getAdsQuery = async (req, res) => {
  try {
    // Assuming you have an AdsQuery model
    const adsQueries = await ActionFormSubmission.find().sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, adsQueries });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
