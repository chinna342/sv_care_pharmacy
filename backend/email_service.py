import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("svcare.email")
logger.setLevel(logging.INFO)


def _get_smtp_connection():
    """Establishes an authenticated SMTP connection using SSL (465) or STARTTLS (587)."""
    user = os.getenv("GMAIL_USER", "").strip() or os.getenv("SMTP_USER", "").strip()
    password = os.getenv("GMAIL_APP_PASSWORD", "").strip() or os.getenv("SMTP_PASSWORD", "").strip()
    host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    port = int(os.getenv("SMTP_PORT", "465"))

    if not user or not password:
        return None, None, None

    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=12)
    else:
        server = smtplib.SMTP(host, port, timeout=12)
        server.starttls()

    server.login(user, password)
    return server, user, password


def send_otp_email(to_email: str, otp: str, name: str = "Valued Patient") -> dict:
    """
    Sends a styled 6-digit OTP verification email to the user via Gmail SMTP.
    """
    clean_email = to_email.strip().lower()

    try:
        server, sender_email, _ = _get_smtp_connection()
        if server and sender_email:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"🔐 Your SV Care Verification Code: {otp}"
            msg["From"] = f"SV Care Pharmacy <{sender_email}>"
            msg["To"] = clean_email

            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #00a878 0%, #065f46 100%); padding: 28px 24px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 4px;">💊</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SV CARE PHARMACY</h1>
                    <p style="margin: 6px 0 0; color: #d1fae5; font-size: 13px; font-weight: 500;">Fast 15-30m Cold-Chain Medicine Delivery</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 32px 28px; text-align: center;">
                    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">Login Verification</h2>
                    <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.5;">
                      Hello <strong>{name}</strong>,<br>Use the 6-digit verification code below to securely sign in or complete your registration.
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background: #f0fdf4; border: 2px dashed #00a878; border-radius: 12px; padding: 18px 24px; margin: 0 auto 24px; display: inline-block;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #065f46; margin-left: 10px;">{otp}</span>
                    </div>

                    <p style="margin: 0 0 16px; color: #64748b; font-size: 12px; line-height: 1.4;">
                      ⏱️ This code expires in <strong>10 minutes</strong>. Never share this code with anyone. SV Care staff will never ask for your OTP.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
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
            """
            msg.attach(MIMEText(html_body, "html"))

            with server:
                server.sendmail(sender_email, clean_email, msg.as_string())
            
            logger.info(f"[GMAIL SMTP SUCCESS] Dispatched OTP {otp} to {clean_email}")
            print(f"[GMAIL SMTP SUCCESS] Dispatched OTP to {clean_email}")
            return {"provider": "gmail_smtp", "status": "sent", "email": clean_email}
    except Exception as exc:
        logger.error(f"[GMAIL SMTP ERROR]: {exc}")
        print(f"[GMAIL SMTP ERROR - Fallback]: {exc}")

    # Development Fallback Console Log
    print(f"[GMAIL OTP CONSOLE DISPATCH] To: {clean_email} | OTP: {otp} | User: {name}")
    return {"provider": "console_gateway", "status": "dispatched", "email": clean_email}


def send_order_confirmation_email(to_email: str, order_number: str, total_amount: float, name: str = "Customer") -> dict:
    """
    Sends an order confirmation receipt to the customer via Gmail SMTP.
    """
    clean_email = to_email.strip().lower()
    try:
        server, sender_email, _ = _get_smtp_connection()
        if server and sender_email:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"📦 SV Care Order Confirmation #{order_number}"
            msg["From"] = f"SV Care Pharmacy <{sender_email}>"
            msg["To"] = clean_email

            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="margin:0; padding:24px; background:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <table role="presentation" width="100%" style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #00a878 0%, #065f46 100%); padding:24px; text-align:center; color:#ffffff;">
                    <h1 style="margin:0; font-size:22px; font-weight:800;">💊 SV CARE PHARMACY</h1>
                    <p style="margin:6px 0 0; font-size:13px;">Order Received & Queued for Pharmacist Check</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 24px;">
                    <p style="font-size:14px; color:#334155; margin:0 0 16px;">Hello <strong>{name}</strong>,</p>
                    <p style="font-size:14px; color:#475569; margin:0 0 20px; line-height:1.5;">
                      Thank you for choosing SV Care. We have received your order <strong>#{order_number}</strong> with total amount <strong>₹{total_amount:.2f}</strong>.
                    </p>
                    <div style="background:#f0fdf4; border-radius:10px; padding:16px; margin-bottom:20px; border-left:4px solid #00a878;">
                      <p style="margin:0; font-size:13px; color:#065f46; font-weight:600;">⚡ 15-30 Minute Express Cold-Chain Delivery</p>
                      <p style="margin:4px 0 0; font-size:12px; color:#047857;">Our registered pharmacist is verifying your items for safe dispatch.</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:16px; text-align:center; font-size:11px; color:#94a3b8;">
                    SV Care Pharmacy • Telangana Lic: TS/HYD/2026/8942-R
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """
            msg.attach(MIMEText(html_body, "html"))
            with server:
                server.sendmail(sender_email, clean_email, msg.as_string())
            return {"provider": "gmail_smtp", "status": "sent"}
    except Exception as exc:
        logger.error(f"[GMAIL ORDER CONFIRMATION ERROR]: {exc}")
    return {"provider": "console_gateway", "status": "dispatched"}
