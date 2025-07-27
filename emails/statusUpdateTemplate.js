export const getStatusUpdateTemplate = ({
  clientName,
  referenceNumber,
  status,
  date,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Visa Application Status Update</h2>
      <p>Dear <strong>${clientName}</strong>,</p>
      <p>Here is an update on your ongoing visa application:</p>
      <ul style="list-style: none; padding: 0;">
        <li>🔍 <strong>Application ID:</strong> ${referenceNumber}</li>
        <li>🛂 <strong>Current Status:</strong> ${status}</li>
        <li>📆 <strong>Updated On:</strong> ${date}</li>
      </ul>
      <p>We’ll continue to notify you of further progress.</p>
      <p>Thank you for your trust in Axe Visa Technology.</p>
      <p>Best regards,<br/>Axe Visa Technology – Notifications System</p>
    </div>
  `;
};
