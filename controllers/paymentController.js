const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const Payment = require("../model/paymentStore");
const User = require("../model/userModel");
const VisaApplication = require("../model/VisaApplication");
const PassportApplication = require("../model/PassportApplication");
const Admin = require("../model/adminModels/adminModel");
const PackagePricing = require("../model/PackagePricing");
const { sendMail } = require("../config/nodemailer");
const getPaymentConfirmationTemplate = require("../emails/paymentConfirmation");

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_rA0MAFpr4GmwXK",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Nu6GDvKUbd3IJvdNARKT5EoT",
});

// Create a Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    console.log("Creating order with amount:", amount);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error creating order", error });
  }
};

// Verify Razorpay payment

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      product_id,
      type_of_payment = "visa",
      package_id,
    } = req.body;

    const user_id = req.user.id;

    // Step 1: Signature Verification
    const hmac = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET || "Nu6GDvKUbd3IJvdNARKT5EoT"
    );
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    const paymentStatus =
      generatedSignature === razorpay_signature ? "success" : "failed";

    // Step 2: Store Payment
    await Payment.create({
      user: user_id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      product_id,
      amount,
      status: paymentStatus,
      type_of_payment,
      package_id,
    });

    // Step 3: On success, update application
    if (paymentStatus === "success") {
      let updatedDoc = null;
      let destination = "N/A";

      if (type_of_payment === "visa") {
        updatedDoc = await VisaApplication.findOneAndUpdate(
          { _id: product_id, user: user_id },
          { paymentStatus: "Paid" },
          { new: true }
        );
        destination = updatedDoc?.destinationCountry || destination;
      } else if (type_of_payment === "passport") {
        updatedDoc = await PassportApplication.findOneAndUpdate(
          { _id: product_id, user: user_id },
          { paymentStatus: "Paid" },
          { new: true }
        );
      }

      if (!updatedDoc) {
        return res.status(404).json({
          success: false,
          message: `Application with ID ${product_id} not found for user or unauthorized`,
        });
      }

      // Step 4: Send Confirmation Email
      try {
        const user = await User.findById(user_id);
        const clientName = user?.name || "Client";
        const clientEmail = user?.email;

        const pkg = package_id
          ? await PackagePricing.findById(package_id)
          : null;
        const packageName = pkg?.name || "N/A";

        if (clientEmail) {
          const date = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          const subject = "[Axe Visa] Payment Received – Thank You!";
          const html = getPaymentConfirmationTemplate({
            clientName,
            amount,
            tier: packageName,
            destination,
            date,
          });

          sendMail(clientEmail, subject, html, true); // fire-and-forget (non-blocking)
        }
      } catch (mailErr) {
        console.warn("⚠️ Payment Email Error:", mailErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified, application updated, and email sent.",
      });
    }

    // Signature mismatch
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });
  } catch (error) {
    console.error("💥 Payment Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message,
    });
  }
};

// verift Razorpay Payement v2

// Simple Razorpay signature verify (stateless, no DB, no user)
// Expected body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
exports.verifyRazorpaySimple = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          "razorpay_order_id, razorpay_payment_id, razorpay_signature required",
      });
    }

    const hmac = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET || "Nu6GDvKUbd3IJvdNARKT5EoT"
    );
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expected = hmac.digest("hex");
    const valid = expected === razorpay_signature;
    return res.status(valid ? 200 : 400).json({
      success: valid,
      status: valid ? "success" : "failed",
      expected,
      received: razorpay_signature,
    });
  } catch (err) {
    console.error("💥 Razorpay Simple Verify Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Get User Payment History

exports.getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // Correct field name

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payment history found for this user.",
      });
    }

    // Convert payments to plain JS objects first
    const paymentsWithDetails = await Promise.all(
      payments.map(async (paymentDoc) => {
        const payment = paymentDoc.toObject(); // Avoid mutation issues
        let productDetails = {};

        if (payment.type_of_payment === "visa") {
          const visaApp = await VisaApplication.findById(
            payment.product_id
          ).select(
            "destinationCountry visaType status paymentStatus travelPurpose applicationStatus travelDate"
          );
          productDetails = visaApp || { message: "Visa application not found" };
        } else if (payment.type_of_payment === "passport") {
          const passportApp = await PassportApplication.findById(
            payment.product_id
          ).select("passportType status paymentStatus applicationStatus");
          productDetails = passportApp || {
            message: "Passport application not found",
          };
        } else {
          productDetails = { message: "Other payment type" };
        }

        return {
          ...payment,
          productDetails,
        };
      })
    );

    return res.status(200).json({
      success: true,
      payments: paymentsWithDetails,
    });
  } catch (error) {
    console.error("❌ Error fetching payment history:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payment history",
      error: error.message,
    });
  }
};

// Get All Payments (Admin Only)

exports.getAllPaymentsAdmin = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .sort({ createdAt: -1 }) // Latest first
      .populate("user", "name email"); // Basic user info

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payments found.",
      });
    }

    const paymentsWithDetails = await Promise.all(
      payments.map(async (paymentDoc) => {
        const payment = paymentDoc.toObject(); // convert Mongoose doc to plain object
        let productDetails = {};
        let packageDetails = {};

        // 📦 Fetch product details
        if (payment.type_of_payment === "visa") {
          const visaApp = await VisaApplication.findById(
            payment.product_id
          ).select(
            "destinationCountry visaType status paymentStatus travelPurpose applicationStatus travelDate"
          );
          productDetails = visaApp || { message: "Visa application not found" };
        } else if (payment.type_of_payment === "passport") {
          const passportApp = await PassportApplication.findById(
            payment.product_id
          ).select("passportType status paymentStatus applicationStatus");
          productDetails = passportApp || {
            message: "Passport application not found",
          };
        } else {
          productDetails = { message: "Other payment type" };
        }

        // 💸 Fetch package details
        try {
          const pkg = await PackagePricing.findById(payment.package_id).select(
            "name price duration features"
          );
          packageDetails = pkg || { message: "Package not found" };
        } catch (err) {
          packageDetails = { message: "Invalid package_id" };
        }

        return {
          ...payment,
          productDetails,
          packageDetails,
        };
      })
    );

    return res.status(200).json({
      success: true,
      payments: paymentsWithDetails,
    });
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payments",
      error: error.message,
    });
  }
};
