package com.healthCare.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🔐 Your myHealthCare Login OTP");
            helper.setFrom("invincible.jdk@gmail.com", "myHealthCare");

            String htmlBody = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        <title>myHealthCare OTP</title>
                    </head>
                    <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
                        <tr>
                          <td align="center">
                            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                              <!-- Header -->
                              <tr>
                                <td align="center" style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:36px 40px 28px;">
                                  <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                                    🏥 myHealthCare
                                  </h1>
                                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                                    Secure Login Verification
                                  </p>
                                </td>
                              </tr>

                              <!-- Body -->
                              <tr>
                                <td style="padding:40px 48px 32px;">
                                  <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b;">
                                    Hi there 👋
                                  </p>
                                  <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.6;">
                                    We received a login request for your <strong>myHealthCare</strong> account.
                                    Use the one-time password below to complete your sign-in.
                                  </p>

                                  <!-- OTP Box -->
                                  <table width="100%%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td align="center" style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border:2px dashed #6366f1;border-radius:12px;padding:28px 20px;">
                                        <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6366f1;letter-spacing:2px;text-transform:uppercase;">
                                          Your One-Time Password
                                        </p>
                                        <p style="margin:0;font-size:46px;font-weight:800;color:#1e293b;letter-spacing:10px;">
                                          %s
                                        </p>
                                        <p style="margin:10px 0 0;font-size:13px;color:#64748b;">
                                          ⏱️ Valid for <strong>5 minutes</strong> only
                                        </p>
                                      </td>
                                    </tr>
                                  </table>

                                  <!-- Security Notice -->
                                  <table width="100%%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                                    <tr>
                                      <td style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;">
                                        <p style="margin:0;font-size:13px;color:#7c2d12;line-height:1.5;">
                                          🔒 <strong>Security tip:</strong> Never share this OTP with anyone.
                                          myHealthCare will never ask you for this code. If you didn't request this, please ignore this email.
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>

                              <!-- Divider -->
                              <tr>
                                <td style="padding:0 48px;">
                                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;"/>
                                </td>
                              </tr>

                              <!-- Footer -->
                              <tr>
                                <td align="center" style="padding:24px 48px 36px;">
                                  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                                    © 2025 myHealthCare · All rights reserved<br/>
                                    This is an automated message, please do not reply directly to this email.
                                  </p>
                                </td>
                              </tr>

                            </table>
                          </td>
                        </tr>
                      </table>
                    </body>
                    </html>
                    """.formatted(otp);

            helper.setText(htmlBody, true);
            mailSender.send(message);

        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send OTP email to: " + toEmail, e);
        }
    }
}
