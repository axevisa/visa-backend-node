// templates/appointmentBooked.js

exports.getAppointmentTemplate = ({
  name,
  time,
  location,
  destination,
  applicationId,
  date,
}) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2 style="color: #007bff;">📅 Appointment Confirmed</h2>
    <p>Dear <b>${name}</b>,</p>
    <p>Your appointment for your <b>${destination}</b> visa application has been successfully scheduled.</p>
    
    <ul>
      <li><b>🆔 Application ID:</b> ${applicationId}</li>
      <li><b>🕒 Time:</b> ${time}</li>
      <li><b>📅 Date:</b> ${date}</li>
      <li><b>📍 Location:</b> ${location}</li>
      <li><b>🌍 Destination:</b> ${destination}</li>
    </ul>

    <p>Please carry all required documents and arrive at least 15 minutes early.</p>
    <p>If you need any assistance, feel free to contact our support team.</p>
    
    <br />
    <p>Warm regards,</p>
    <p>Appointments Team – Axe Visa Technology</p>
    <p>📧 support@axevisa.com</p>
  </div>
`;
