import "server-only";

import nodemailer from "nodemailer";

type SendApplicantPasswordResetEmailArgs = {
  email: string;
  token: string;
};

export async function sendApplicantPasswordResetEmail({
  email,
  token,
}: SendApplicantPasswordResetEmailArgs) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is incomplete.");
  }

  const from =
    process.env.REVELATIONX1_FROM_EMAIL ||
    process.env.ASCEND_FROM_EMAIL ||
    "ralph@rznconsulting.com";

  const resetUrl = `${appUrl}/account/reset-password?token=${encodeURIComponent(
    token,
  )}`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `REVELATIONX1 <${from}>`,
    to: email,
    subject: "Reset your REVELATIONX1 applicant password",
    text: [
      "Reset your REVELATIONX1 applicant password",
      "",
      "Use the link below to choose a new password:",
      resetUrl,
      "",
      "This password reset link expires after 60 minutes.",
      "",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;background:#090909;color:#ffffff;padding:32px">
        <div style="max-width:600px;margin:0 auto">
          <p style="font-size:12px;font-weight:700;letter-spacing:2px;color:#c7ff2f;text-transform:uppercase">
            REVELATIONX1 Applicant Account
          </p>

          <h1 style="font-size:30px;line-height:1.2;margin:16px 0">
            Reset your password
          </h1>

          <p style="color:#c7c7c7;line-height:1.7">
            We received a request to reset the password for your REVELATIONX1 applicant account.
          </p>

          <p style="margin:28px 0">
            <a
              href="${resetUrl}"
              style="display:inline-block;background:#c7ff2f;color:#000000;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:999px"
            >
              Reset Password
            </a>
          </p>

          <p style="color:#8f8f8f;line-height:1.7">
            This link expires after 60 minutes.
          </p>

          <p style="color:#8f8f8f;line-height:1.7">
            If you did not request a password reset, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}
