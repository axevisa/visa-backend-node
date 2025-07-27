const getPaymentConfirmationTemplate = ({
  clientName,
  amount,
  tier,
  destination,
  date,
}) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2 style="color: #28a745;">💳 Payment Received – Thank You!</h2>
    <p>Dear <b>${clientName}</b>,</p>
    <p>We have successfully received your payment for visa services.</p>
    <ul>
      <li><b>💰 Amount Paid:</b> US$ ${amount}</li>
      <li><b>🗺️ Destination:</b> ${destination}</li>
      <li><b>📦 Package:</b> ${tier}</li>
      <li><b>📅 Date:</b> ${date}</li>
    </ul>
    <p>Your application is now being processed. You’ll receive updates by email.</p>
    <p>Thank you for choosing <b>Axe Visa Technology</b>!</p>
    <br />
    <p>Warm regards,</p>
    <p>Accounts Team – Axe Visa Technology</p>
    <p>📧 support@axevia.com</p>
  </div>
`;

module.exports = getPaymentConfirmationTemplate;
