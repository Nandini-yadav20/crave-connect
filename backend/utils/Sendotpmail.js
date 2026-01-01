import nodemailer from "nodemailer";

const sendOtpMail = async (email, otp) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can use other services like 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - Crave Connect",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #ff4d2d;
              margin-bottom: 30px;
            }
            .otp-box {
              background-color: #fff9f6;
              border: 2px dashed #ff4d2d;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin: 20px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #ff4d2d;
              letter-spacing: 8px;
            }
            .message {
              color: #666;
              line-height: 1.6;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #999;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px 15px;
              margin: 20px 0;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍔 Crave Connect</h1>
              <h2>Password Reset Request</h2>
            </div>
            
            <div class="message">
              <p>Hello,</p>
              <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            </div>

            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 5 minutes</p>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for this code.
            </div>

            <div class="message">
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>

            <div class="footer">
              <p>© 2024 Crave Connect. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export default sendOtpMail;