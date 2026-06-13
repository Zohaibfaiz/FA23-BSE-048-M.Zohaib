import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_USER) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email skipped] To: ${to} | Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Doctor Hub <noreply@doctorhub.com>',
    to,
    subject,
    html,
    text,
  });
};
