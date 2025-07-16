const nodemailer = require("nodemailer");
require("dotenv").config(); // Make sure you have a .env file and dotenv installed

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.email,      // Your Gmail address
    pass: process.env.password    // Your App password from Google
  }
});

// Function to send OTP email
async function sendOTPEmail(toEmail, otp) {
  try {
    const info = await transporter.sendMail({
      from: `"SMIP App" <${process.env.email}>`,
      to: toEmail,
      subject: "Your OTP Code",
      text: `Your OTP for password reset is: ${otp}`,
      html: `<p>Your <b>OTP</b> for password reset is: <strong>${otp}</strong></p>`
    });

    console.log("OTP email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    throw error;
  }
}

module.exports = sendOTPEmail;
