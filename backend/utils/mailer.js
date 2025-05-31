import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});
export const sendEmail = async (to, subject, text) => {
  try {
    const mail = await transporter.sendMail({
      from: "No reply from ticket system",
      to,
      subject,
      text,
    });
    console.log("Email sent successfully", mail.messageId);
    return mail;
  } catch (error) {
    console.error("Error sending email", error.message);
    throw error;
  }
};
