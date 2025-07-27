exports.getCustomEmailTemplate = ({ subject, description }) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
      <h2 style="color: #1a73e8;">${subject}</h2>
      <p style="font-size: 16px; line-height: 1.5;">
        ${description}
      </p>
      <br />
      <p style="color: #555;">Thank you,<br />Axe Visa Technology Team</p>
    </div>
  `;
};
