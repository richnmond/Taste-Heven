const nodemailer = require('nodemailer');

const getEmailTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, text }) => {
  const transport = getEmailTransport();
  if (!transport) {
    console.log('[email] transport not configured, skipping send');
    return;
  }
  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
};

const sendWhatsApp = async ({ to, body }) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log('[whatsapp] Twilio not configured, skipping send');
    return;
  }
  // Placeholder: integrate Twilio SDK here for production.
  console.log('[whatsapp] send to', to, body);
};

const sendApprovalNotifications = async (order, user) => {
  const subject = 'Your Taste Heaven order has been approved';
  const text = `Hi ${user.name}, your order ${order._id} was approved. Total: ${order.total}.`;
  await sendEmail({ to: user.email, subject, text });

  // You can store a phone number on User later; for now this is a placeholder.
  await sendWhatsApp({ to: user.phone || '', body: text });
};

module.exports = { sendApprovalNotifications };
