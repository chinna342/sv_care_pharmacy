import nodemailer from "nodemailer";

global.emailOtpStorage = global.emailOtpStorage || {};

const GMAIL_USER = process.env.GMAIL_USER || "venkatc283@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || "hmsaopnkygbzikil";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed. Use POST." });
  }

  try {
    const { email, name } = req.body || {};
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return res.status(400).json({ detail: "Please provide a valid email address." });
    }

    const userName = (name || cleanEmail.split("@")[0]).trim();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    global.emailOtpStorage[cleanEmail] = {
      otp: generatedOtp,
      expiresAt,
      name: userName,
    };

    const mailOptions = {
      from: `"SV Care Pharmacy" <${GMAIL_USER}>`,
      to: cleanEmail,
      subject: `🔐 Your SV Care Verification Code: ${generatedOtp}`,
      text: `SV CARE PHARMACY - Login Verification\n\nHello ${userName},\n\nYour 6-digit verification code is: ${generatedOtp}\n\nThis code is valid for 10 minutes. Never share this code with anyone.\n\nSV Care Global Pharmacy & Clinical Suite\nSupport: venkatc283@gmail.com`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <tr>
              <td style="background: linear-gradient(135deg, #00a878 0%, #065f46 100%); padding: 28px 24px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 4px;">💊</div>
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SV CARE PHARMACY</h1>
                <p style="margin: 6px 0 0; color: #d1fae5; font-size: 13px; font-weight: 500;">Fast 15-30m Cold-Chain Medicine Delivery</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 28px; text-align: center;">
                <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">Login Verification</h2>
                <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.5;">
                  Hello <strong>${userName}</strong>,<br>Use the 6-digit verification code below to securely sign in or complete your registration.
                </p>
                <div style="background: #f0fdf4; border: 2px dashed #00a878; border-radius: 12px; padding: 18px 24px; margin: 0 auto 24px; display: inline-block;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #065f46; margin-left: 10px;">${generatedOtp}</span>
                </div>
                <p style="margin: 0 0 16px; color: #64748b; font-size: 12px; line-height: 1.4;">
                  ⏱️ This code expires in <strong>10 minutes</strong>. Never share this code with anyone. SV Care staff will never ask for your OTP.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
                <p style="margin: 0 0 4px; color: #94a3b8; font-size: 11px; font-weight: 600;">
                  SV CARE GLOBAL PHARMACY & CLINICAL SUITE
                </p>
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                  Telangana State Pharmacy License: <strong>TS/HYD/2026/8942-R</strong> • Support: venkatc283@gmail.com
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[VERCEL SERVERLESS GMAIL OTP] Successfully dispatched OTP to ${cleanEmail}`);

    return res.status(200).json({
      success: true,
      message: `6-Digit Verification Code sent to ${cleanEmail}. Please check your Inbox and Spam folder.`,
      email: cleanEmail,
      otp: generatedOtp,
      expires_in_seconds: 600,
    });
  } catch (error) {
    console.error("[VERCEL SERVERLESS GMAIL OTP ERROR]:", error);
    return res.status(500).json({
      success: false,
      detail: `Failed to dispatch email: ${error.message}`,
    });
  }
}
