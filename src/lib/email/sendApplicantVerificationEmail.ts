import "server-only";

import { getMailTransport } from "./mailer";

type Args = {
  email: string;
  token: string;
};

export async function sendApplicantVerificationEmail({ email, token }: Args) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  const supportEmail =
    process.env.REVELATIONX1_SUPPORT_EMAIL ||
    process.env.ASCEND_SUPPORT_EMAIL ||
    "ralph@rznconsulting.com";

  const fromEmail =
    process.env.REVELATIONX1_FROM_EMAIL ||
    process.env.ASCEND_FROM_EMAIL ||
    "ralph@rznconsulting.com";

  const fromName =
    process.env.REVELATIONX1_FROM_NAME ||
    process.env.ASCEND_FROM_NAME ||
    "REVELATIONX1 Football Showcase";

  const verificationUrl = `${appUrl}/account/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#090909;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background:#090909;"
    >
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="max-width:620px;background:#111111;border:1px solid #2a2a2a;border-radius:18px;"
          >
            <tr>
              <td style="padding:40px;">
                <div
                  style="font-size:12px;font-weight:700;letter-spacing:3px;color:#c7ff2f;text-transform:uppercase;"
                >
                  REVELATIONX1
                </div>

                <h1
                  style="margin:16px 0 18px;font-size:30px;line-height:1.2;color:#ffffff;"
                >
                  Verify your email address
                </h1>

                <p
                  style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#c8c8c8;"
                >
                  Thank you for creating your REVELATIONX1 applicant account.
                </p>

                <p
                  style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#c8c8c8;"
                >
                  Please verify your email address before starting or continuing your football showcase application.
                </p>

                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td
                      style="border-radius:999px;background:#c7ff2f;"
                    >
                      <a
                        href="${verificationUrl}"
                        style="display:inline-block;padding:15px 26px;font-size:14px;font-weight:700;color:#000000;text-decoration:none;text-transform:uppercase;letter-spacing:1px;"
                      >
                        Verify Email
                      </a>
                    </td>
                  </tr>
                </table>

                <p
                  style="margin:30px 0 0;font-size:13px;line-height:1.7;color:#777777;"
                >
                  This verification link will expire. If you did not create this account, you can ignore this email.
                </p>

                <p
                  style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#777777;"
                >
                  Need assistance? Contact
                  <a
                    href="mailto:${supportEmail}"
                    style="color:#c7ff2f;"
                  >
                    ${supportEmail}
                  </a>.
                  <br />
                  REVELATIONX1 Football Showcase
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  const transporter = getMailTransport();

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: "Verify your REVELATIONX1 applicant account",
    html,
  });

  return {
    messageId: info.messageId,
    recipientEmail: email,
  };
}
