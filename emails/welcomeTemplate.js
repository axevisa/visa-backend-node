exports.getWelcomeEmailTemplate = ({ name }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 10px;">
      <h2 style="color: #1a73e8;">👋 Welcome to Axe Visa, ${name}!</h2>
      <p style="font-size: 16px;">
        We're thrilled to have you onboard. Your account has been successfully created and you're now part of our trusted visa processing community.
      </p>
      <p style="font-size: 16px;">
        You can now track your application status, get real-time updates, and enjoy personalized support throughout your visa journey.
      </p>
      <hr style="border: none; border-top: 1px solid #ccc;" />
      <p style="font-size: 14px; color: #777;">
        💼 Need help? Just reply to this email or contact our team anytime.
      </p>
      <p style="font-size: 14px; color: #777;">
        🚀 Let's get your journey started!
      </p>
      <br />
      <p style="color: #555;">Warm regards,<br />Team Axe Visa</p>
    </div>
  `;
};
