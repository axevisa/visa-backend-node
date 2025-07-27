exports.getOtpEmailTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 12px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50;">🔐 OTP Verification</h2>
      <p style="font-size: 16px; color: #333;">Hi ${name || "User"},</p>
      <p style="font-size: 16px; color: #333;">
        We received a request to reset your password. Use the OTP below to verify your identity:
      </p>
      <div style="font-size: 24px; font-weight: bold; color: #1a73e8; background: #fff; padding: 12px 20px; border-radius: 8px; border: 1px dashed #1a73e8; text-align: center; letter-spacing: 4px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #777;">
        ⚠️ This OTP is valid for <strong>15 minutes</strong>. Please do not share this code with anyone.
      </p>
      <hr style="border: none; border-top: 1px solid #ccc;" />
      <p style="font-size: 14px; color: #999;">
        If you didn’t request this, you can safely ignore this email.
      </p>
      <p style="color: #555;">Thanks,<br />Team Axe Visa</p>
    </div>
  `;
};
