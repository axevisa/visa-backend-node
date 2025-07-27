const User = require("../model/userModel");

const PassportApplication = require("../model/PassportApplication");

const addPassportApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fullName,
      dob,
      gender,
      maritalStatus,
      nationality,
      email,
      phone,
      address,
      applicationType,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "fullName",
      "dob",
      "gender",
      "maritalStatus",
      "nationality",
      "applicationType",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`,
        });
      }
    }

    // Validate required files
    const uploaded = req.uploadedFiles || {};
    const requiredDocs = [
      "aadharCard",
      "dobProof",
      "identityProof",
      "passportPhotos",
    ];
    for (const doc of requiredDocs) {
      if (!uploaded[doc]) {
        return res.status(400).json({
          success: false,
          message: `${doc} is required.`,
        });
      }
    }

    const documents = {
      aadharCard: uploaded["aadharCard"],
      dobProof: uploaded["dobProof"],
      identityProof: uploaded["identityProof"],
      passportPhotos: uploaded["passportPhotos"],
      employmentProof: uploaded["employmentProof"] || null,
      annexures: uploaded["annexures"] || [],
      oldPassport: uploaded["oldPassport"] || null,
      policeVerificationProof: uploaded["policeVerificationProof"] || null,
    };

    const newApplication = new PassportApplication({
      user: userId,
      fullName,
      dob,
      gender,
      maritalStatus,
      nationality,
      email,
      phone,
      address,
      applicationType,
      documents,
    });

    await newApplication.save();

    return res.status(201).json({
      success: true,
      message: "Passport application submitted successfully.",
      applicationId: newApplication._id,
    });
  } catch (error) {
    console.error("Passport Application Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// get passport application

const getPassportApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    // Pagination
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

    // Filters from query params
    const {
      status,
      applicationType,
      priority,
      paymentStatus,
      gender,
      fromDate,
      toDate,
    } = req.query;

    // Build dynamic query object
    const query = { user: userId };

    if (status) query.status = status;
    if (applicationType) query.applicationType = applicationType;
    if (priority) query.priority = priority;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (gender) query.gender = gender;

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const [applications, total] = await Promise.all([
      PassportApplication.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PassportApplication.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        applications,
      },
    });
  } catch (error) {
    console.error("Error fetching passport applications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// get passport application by id

const getPassportApplicationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.id;

    const application = await PassportApplication.findOne({
      _id: applicationId,
      user: userId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Passport application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching passport application:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// get all passport applications for admin
const getAllPassportApplicationsAdmin = async (req, res) => {
  try {
    const applications = await PassportApplication.find().populate("user");
    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching all passport applications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// get passport application by id for admin
const getPassportApplicationByIdAdmin = async (req, res) => {
  try {
    const applicationId = req.params.id;

    const application = await PassportApplication.findById(
      applicationId
    ).populate("user");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Passport application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching passport application:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// assign expert to passport application
const assignPassportExpert = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { assignedExpert, priority, processingDeadline } = req.body;

    if (!assignedExpert) {
      return res.status(400).json({
        success: false,
        message: "Assigned expert is required.",
      });
    }

    const application = await PassportApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Passport application not found.",
      });
    }

    application.assignedExpert = assignedExpert;
    application.priority = priority;
    application.processingDeadline = processingDeadline;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Passport application assigned to expert successfully.",
    });
  } catch (error) {
    console.error("Error assigning passport expert:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// expert passport application functions

const getPassportApplicationsByExpert = async (req, res) => {
  try {
    const expertId = req.user.id;

    const applications = await PassportApplication.find({
      assignedExpert: expertId,
    }).populate("user", "name email phone");

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching passport applications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const getPassportApplicationsByIdByExpert = async (req, res) => {
  try {
    const expertId = req.user.id;
    const applicationId = req.params.id;

    const application = await PassportApplication.findOne({
      _id: applicationId,
      assignedExpert: expertId,
    }).populate("user", "name email phone photo address");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Passport application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching passport application:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// update passport application status
const updatePassportApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    const updated = await PassportApplication.findByIdAndUpdate(
      applicationId,
      {
        status: status,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Passport application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Passport application status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating passport application status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Export the function

module.exports = {
  addPassportApplication,
  getPassportApplication,
  getPassportApplicationById,
  getAllPassportApplicationsAdmin,
  getPassportApplicationByIdAdmin,
  assignPassportExpert,
  getPassportApplicationsByExpert,
  getPassportApplicationsByIdByExpert,
  updatePassportApplicationStatus,
};
