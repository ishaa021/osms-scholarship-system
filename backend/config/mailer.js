const nodemailer = require('nodemailer');

// Gmail transporter — uses App Password (not your real Gmail password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP email
 * @param {string} toEmail - recipient email
 * @param {string} otp     - 6-digit OTP string
 */
const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"OSMS Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your OSMS Login OTP',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f5eded; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6482AD, #7FA1C3); padding: 12px 16px; border-radius: 12px; margin-bottom: 12px;">
            <span style="color: white; font-size: 20px; font-weight: bold;">OSMS</span>
          </div>
          <h2 style="color: #333; margin: 0;">Login OTP</h2>
        </div>

        <p style="color: #555; font-size: 15px; margin-bottom: 8px;">Your one-time password is:</p>

        <div style="text-align: center; margin: 24px 0;">
          <span style="
            display: inline-block;
            background: linear-gradient(135deg, #3F3B6C, #624F82);
            color: white;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 12px;
            padding: 16px 32px;
            border-radius: 12px;
          ">${otp}</span>
        </div>

        <p style="color: #888; font-size: 13px; text-align: center;">
          This OTP expires in <strong>5 minutes</strong>.<br/>
          Do not share this with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };