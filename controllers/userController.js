const User = require("../model/userModel");
const UserDocument = require("../model/UserDocument");
const SupportTicket = require("../model/SupportTicket");
const VisaApplication = require("../model/VisaApplication");
const Notification = require("../model/NotificationModel");

const getUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-otp -otpExpiry");

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, nationality, country, address } = req.body;
    const imagePath = req.uploadedFiles?.["profilePic"] || null;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Create an object with only fields that are provided
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (nationality) updates.nationality = nationality;
    if (country) updates.country = country;
    if (address !== undefined) updates.address = address; // empty string is allowed
    if (imagePath) updates.profilePic = imagePath;

    // Update the user
    await User.findByIdAndUpdate(userId, updates, { new: true });

    return res
      .status(200)
      .json({ message: "User updated successfully", success: true });
  } catch (error) {
    console.error("Update error:", error);
    return res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};

// upload user documents
const uploadDocs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, description } = req.body;

    // Basic validation
    if (!documentType || !req.uploadedFiles?.["doc"]) {
      return res.status(400).json({
        success: false,
        message: "Document type and at least one document file are required.",
      });
    }

    const filePaths = req.uploadedFiles["doc"];

    const saveDocs = Array.isArray(filePaths)
      ? filePaths.map((path) => ({
          user: userId,
          documentType,
          description,
          filePath: path,
        }))
      : [
          {
            user: userId,
            documentType,
            description,
            filePath: filePaths,
          },
        ];

    await UserDocument.insertMany(saveDocs);

    return res.status(201).json({
      success: true,
      message: "Documents uploaded successfully.",
      count: saveDocs.length,
    });
  } catch (error) {
    console.error("Upload Docs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// update user document
const updateuploadDocs = async (req, res) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const { documentType, description } = req.body;

    // Basic validation
    if (!documentType || !req.uploadedFiles?.["doc"]) {
      return res.status(400).json({
        success: false,
        message: "Document type and at least one document file are required.",
      });
    }

    const filePaths = req.uploadedFiles["doc"];

    const saveDocs = Array.isArray(filePaths)
      ? filePaths.map((path) => ({
          user: userId,
          documentType,
          description,
          filePath: path,
        }))
      : [
          {
            user: userId,
            documentType,
            description,
            filePath: filePaths,
          },
        ];

    await UserDocument.updateOne(
      { _id: docId },
      {
        $set: {
          documentType,
          description,
          filePath: saveDocs[0].filePath,
          updated: true,
          note: null, // Reset note on update
          isVerified: true, // Reset verification status on update
        },
      }
    );

    return res.status(201).json({
      success: true,
      message: "Documents uploaded successfully.",
      count: saveDocs.length,
    });
  } catch (error) {
    console.error("Upload Docs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// get all user documents

const getAllUserDocs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Pagination params
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Use ?page=1&limit=10",
      });
    }

    const skip = (page - 1) * limit;

    const [userDocs, total] = await Promise.all([
      UserDocument.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserDocument.countDocuments({ user: userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        userDocs,
      },
    });
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// support

const supportTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Subject and message are required." });
    }

    const ticket = new SupportTicket({
      user: userId,
      subject,
      messages: [
        {
          sender: userId,
          message,
          sentBy: "USER",
        },
      ],
    });

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: "Support ticket submitted successfully.",
      ticketId: ticket._id,
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// get support tickets for user
const getSupportTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await SupportTicket.find({ user: userId })
      .populate("messages.sender", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// send support message

const sendSupportMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const role = req.user.role; // 'USER' or 'ADMIN'

    if (!message || message.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Message is required." });
    }

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found." });
    }

    // Optional: if role is USER, only allow if the ticket belongs to them
    if (role === "USER" && ticket.user.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    ticket.messages.push({
      sender: userId,
      message,
      sentBy: role,
    });

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Message added to the ticket.",
      ticket,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// dashboard stats

const getUserStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing in request.",
      });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Step 1: Get all visa applications for this user
    const userApplications = await VisaApplication.find({ user: userId })
      .select("_id")
      .lean();
    const applicationIds = userApplications.map((app) => app._id);

    // Step 2: Get notifications for these applications (to user only)
    const userNotifications = await Notification.find({
      visaApplication: { $in: applicationIds },
      to: "user",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Step 3: Other stats in parallel
    const [
      totalVisaApplications,
      totalApprovedVisaApplications,
      totalPendingVisaApplications,
      totalRejectedVisaApplications,
      totalUnderReviewVisaApplications,
      applicationHistory,
    ] = await Promise.all([
      VisaApplication.countDocuments({ user: userId }),
      VisaApplication.countDocuments({
        user: userId,
        applicationStatus: "Approved",
      }),
      VisaApplication.countDocuments({
        user: userId,
        applicationStatus: "Pending",
      }),
      VisaApplication.countDocuments({
        user: userId,
        applicationStatus: "Rejected",
      }),
      VisaApplication.countDocuments({
        user: userId,
        applicationStatus: "Under Review",
      }),
      VisaApplication.find({ user: userId })
        .select("destinationCountry travelPurpose applicationStatus -_id")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          all: totalVisaApplications,
          approved: totalApprovedVisaApplications,
          pending: totalPendingVisaApplications,
          rejected: totalRejectedVisaApplications,
          underReview: totalUnderReviewVisaApplications,
        },
        recentApplications: applicationHistory,
        notifications: userNotifications,
      },
    });
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Try again later.",
    });
  }
};

// Export the controller functions
module.exports = {
  updateUser,
  uploadDocs,
  updateuploadDocs,
  getAllUserDocs,
  supportTicket,
  getSupportTickets,
  sendSupportMessage,
  getUser,
  getUserStats,
};
