// config/nodemailer.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER || "axevisa.com@gmail.com",
    pass: process.env.GMAIL_PASS || "ebxz auql belp etnm",
  },
  // logger: true, // Enable logging for debugging
  // debug: true, // Show debug output in console
});

const sendMail = async (to, subject, message, isHtml = false) => {
  try {
    const mailOptions = {
      from: `"AXE VISA Team" <${
        process.env.GMAIL_USER || "axevisa.com@gmail.com"
      }>`,
      to,
      subject,
      text: isHtml ? undefined : message,
      html: isHtml ? message : undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    return { success: false, message: "Email sending failed.", error };
  }
};

const sendMailWithAttachment = async (to, subject, message, attachmentPath, attachmentName = "report.pdf") => {
  try {
    const fs = require("fs");
    const path = require("path");

    // Check if attachment file exists
    if (!fs.existsSync(attachmentPath)) {
      return { 
        success: false, 
        message: "Attachment file not found.",
        error: `File not found: ${attachmentPath}`
      };
    }

    const mailOptions = {
      from: `"AXE VISA" <${
        process.env.GMAIL_USER || "axevisa.com@gmail.com"
      }>`,
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
      attachments: [
        {
          filename: attachmentName,
          path: attachmentPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email with attachment sent to ${to}: ${info.response}`);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    return { success: false, message: "Email sending failed.", error: error.message };
  }
};

// ✅ Named export for CommonJS
module.exports = { sendMail, sendMailWithAttachment };
