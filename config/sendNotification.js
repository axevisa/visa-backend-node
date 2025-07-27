const Notification = require("../model/NotificationModel");

const sendNotification = async ({
  visaApplication,
  title,
  message = "",
  to,
  status = "unread",
}) => {
  try {
    if (!visaApplication || !title || !to) {
      throw new Error("Missing required notification fields");
    }

    const newNotification = await Notification.create({
      visaApplication,
      title,
      message,
      to,
      status,
    });

    return {
      success: true,
      data: newNotification,
    };
  } catch (err) {
    console.error("🚨 Notification Error:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};

module.exports = { sendNotification };
