import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (
  to: string,
  htmlContent: string,
  subject: string
) => {
  if (process.env.EMAIL !== "true") {
    console.log(`Email sending is disabled. Skipping email to ${to}.`);
    return;
  }
  const mailOptions = {
    from: `"Demo" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};
