import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import { getMailTransport } from "./mailer";

type Args = {
  applicationId: string;
  force?: boolean;
};

export async function sendShowcaseApplicationConfirmation({
  applicationId,
  force = false,
}: Args) {
  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },
    });

  if (!application) {
    throw new Error(
      "Showcase application not found."
    );
  }

  if (!application.registrationNumber) {
    throw new Error(
      "Registration number must exist before sending confirmation."
    );
  }

  if (!application.checkInToken) {
    throw new Error(
      "Check-in token must exist before sending confirmation."
    );
  }

  if (!application.assessmentFeePaid) {
    throw new Error(
      "Assessment fee must be paid before sending confirmation."
    );
  }

  /*
   * Prevent duplicate confirmation emails.
   */
  if (
    application.confirmationEmailSentAt &&
    !force
  ) {
    return {
      messageId: null,
      recipientEmail:
        application.email,
    };
  }

const recipientEmail =
  application.email;

const recipientName =
  application.firstName;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  /*
   * Permanent QR identity.
   *
   * This QR is NOT replaced if the player
   * is later selected.
   */
  const qrUrl =
    `${appUrl}/checkin/${application.checkInToken}`;

  const qrBuffer =
    await QRCode.toBuffer(
      qrUrl,
      {
        width: 360,
        margin: 2,
        errorCorrectionLevel: "H",
      }
    );

  const supportEmail =
    process.env.ASCEND_SUPPORT_EMAIL ||
    "showcase@ascendfootball.com";

  const fromEmail =
    process.env.ASCEND_FROM_EMAIL ||
    "showcase@ascendfootball.com";

  const fromName =
    process.env.ASCEND_FROM_NAME ||
    "ASCEND Football Showcase";

  const paymentReference =
    application.assessmentPaymentReference ||
    "Recorded";

  const intro = `
    <p style="margin:0 0 18px;color:#c8c8c8;">
      Dear ${recipientName},
    </p>
  `;

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#090909;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">

<table width="100%" cellspacing="0" cellpadding="0" style="background:#090909;">
<tr>
<td align="center" style="padding:32px 16px;">

<table width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;">

<tr>
<td style="padding:0 0 28px;">
  <div style="font-size:23px;font-weight:800;letter-spacing:7px;">
    ASCEND
  </div>

  <div style="margin-top:4px;font-size:10px;letter-spacing:4px;color:#8d8d8d;">
    FOOTBALL SHOWCASE
  </div>
</td>
</tr>

<tr>
<td style="border:1px solid #2c3911;background:#11160b;border-radius:22px;padding:34px;">

  <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#c7ff2f;">
    APPLICATION RECEIVED
  </div>

  <h1 style="margin:14px 0 10px;font-size:34px;">
    Your application has been submitted
  </h1>

  ${intro}

  <p style="margin:0;color:#a9a9a9;line-height:1.7;">
    Your ASCEND Lagos 2027 player application,
    football evidence and Application & Assessment
    Fee have been successfully received.
  </p>

  <div style="margin-top:28px;padding-top:24px;border-top:1px solid #303030;">

    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
      REGISTRATION CODE
    </div>

    <div style="margin-top:8px;font-size:28px;font-weight:900;color:#c7ff2f;">
      ${application.registrationNumber}
    </div>

    <p style="margin:10px 0 0;color:#888888;font-size:13px;line-height:1.6;">
      This is your permanent ASCEND Lagos 2027
      registration code. Please keep it for your records.
    </p>

  </div>

</td>
</tr>


<tr>
<td style="padding-top:22px;">

<table width="100%" cellspacing="0" cellpadding="0"
style="border:1px solid #262626;background:#111111;border-radius:18px;">

<tr>
<td style="padding:28px;">

<h2 style="margin:0 0 20px;font-size:20px;">
  Application & Assessment Fee
</h2>

<table width="100%" cellspacing="0" cellpadding="6">

<tr>
<td style="color:#818181;">
  Status
</td>

<td align="right" style="font-weight:700;color:#c7ff2f;">
  PAID
</td>
</tr>

<tr>
<td style="color:#818181;">
  Payment reference
</td>

<td align="right" style="font-weight:700;">
  ${paymentReference}
</td>
</tr>

</table>

</td>
</tr>

</table>

</td>
</tr>


<tr>
<td style="padding-top:22px;">

<table width="100%" cellspacing="0" cellpadding="0"
style="border:1px solid #262626;background:#111111;border-radius:18px;">

<tr>
<td style="padding:28px;">

<h2 style="margin:0 0 22px;font-size:20px;">
  What happens next?
</h2>

<div style="margin-bottom:22px;">
  <div style="font-weight:800;color:#c7ff2f;">
    1. Identity, Age & Eligibility Verification
  </div>

  <p style="margin:7px 0 0;color:#a9a9a9;line-height:1.7;">
    ASCEND will review your identity documents, age
    eligibility and the information supplied with your
    application.
  </p>
</div>


<div style="margin-bottom:22px;">
  <div style="font-weight:800;color:#c7ff2f;">
    2. Football Assessment
  </div>

  <p style="margin:7px 0 0;color:#a9a9a9;line-height:1.7;">
    Once the required eligibility checks have been completed,
    your football evidence may be released for assessment by
    authorised ASCEND selectors.
  </p>
</div>


<div style="margin-bottom:22px;">
  <div style="font-weight:800;color:#c7ff2f;">
    3. Further Video Evidence
  </div>

  <p style="margin:7px 0 0;color:#a9a9a9;line-height:1.7;">
    If required, ASCEND may contact you and ask you to provide
    one or more additional videos before a final assessment
    decision is made.
  </p>
</div>


<div>
  <div style="font-weight:800;color:#c7ff2f;">
    4. Final Selection
  </div>

  <p style="margin:7px 0 0;color:#a9a9a9;line-height:1.7;">
    Eligible applicants who progress through the football
    assessment process will continue to final selection.
  </p>

  <p style="margin:12px 0 0;color:#ffffff;font-weight:800;line-height:1.7;">
    The best 100 eligible players will be selected for the
    ASCEND Lagos 2027 camp.
  </p>
</div><div style="margin-bottom:22px;">
  <div style="font-weight:800;color:#c7ff2f;">
    1. Identity, Age & Eligibility Verification
  </div>

  <p style="margin:7px 0 0;color:#a9a9a9;line-height:1.7;">
    ASCEND will review your identity documents, age
    eligibility and the information supplied with your
    application.
  </p>
</div>


<div style="margin-bottom:22px;">
  <div style="font-weight:800;color:#c7ff2f;">
    2. Football Assessment
  </div>

  <p style="margin:7px 0 0;color:#a9a9a9;line-height:1.7;">
    Once the required eligibility checks have been completed,
    your football evidence may be released for assessment by
    authorised ASCEND selectors.
  </p>
</div>


<div style="margin-bottom:22px;">
  <div style="font-weight:800;color:#c7ff2f;">
    3. Further Video Evidence
  </div>

  <p style="margin:7px 0 0;color:#a9a9a9;line-height:1.7;">
    If required, ASCEND may contact you and ask you to provide
    one or more additional videos before a final assessment
    decision is made.
  </p>
</div>


<div>
  <div style="font-weight:800;color:#c7ff2f;">
    4. Final Selection
  </div>

  <p style="margin:7px 0 0;color:#a9a9a9;line-height:1.7;">
    Eligible applicants who progress through the football
    assessment process will continue to final selection.
  </p>

  <p style="margin:12px 0 0;color:#ffffff;font-weight:800;line-height:1.7;">
    The best 100 eligible players will be selected for the
    ASCEND Lagos 2027 camp.
  </p>
</div>

</td>
</tr>

</table>

</td>
</tr>


<tr>
<td style="padding-top:22px;">

<table width="100%" cellspacing="0" cellpadding="0"
style="border:1px solid #3c3210;background:#181507;border-radius:18px;">

<tr>
<td style="padding:28px;">

<div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#f3c950;">
  IMPORTANT
</div>

<p style="margin:14px 0 0;color:#d0d0d0;line-height:1.8;">
  Payment of the Application & Assessment Fee
  covers the processing and professional assessment
  of your application and football evidence.
</p>

<p style="margin:12px 0 0;color:#ffffff;font-weight:800;line-height:1.8;">
  Payment does not guarantee selection or an
  invitation to the ASCEND Lagos 2027 camp.
</p>

<p style="margin:12px 0 0;color:#b8b8b8;line-height:1.8;">
  If you are selected, ASCEND will contact you
  separately with your official invitation and
  camp instructions.
</p>

</td>
</tr>

</table>

</td>
</tr>


<tr>
<td style="padding-top:22px;">

<table width="100%" cellspacing="0" cellpadding="0"
style="border:1px solid #262626;background:#111111;border-radius:18px;">

<tr>
<td align="center" style="padding:30px;">

<div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#c7ff2f;">
  YOUR ASCEND REGISTRATION QR
</div>

<h2 style="margin:10px 0 20px;">
  Keep this QR code
</h2>

<img
  src="cid:ascend-showcase-application-qr"
  width="230"
  height="230"
  alt="ASCEND Lagos 2027 registration QR code"
  style="display:block;background:white;padding:10px;border-radius:14px;"
/>

<p style="margin:20px auto 0;max-width:470px;color:#969696;line-height:1.7;">
  This QR code is permanently linked to your
  ASCEND Lagos 2027 registration.
</p>

<p style="margin:10px auto 0;max-width:470px;color:#ffffff;font-weight:700;line-height:1.7;">
  Your registration code and QR code will remain
  the same throughout the application and selection
  process.
</p>

</td>
</tr>

</table>

</td>
</tr>


<tr>
<td style="padding:28px 4px;color:#777777;font-size:12px;line-height:1.7;">

Please retain this email for your records.

<br /><br />

Need assistance? Contact

<a href="mailto:${supportEmail}" style="color:#c7ff2f;">
${supportEmail}
</a>.

<br />

ASCEND Football Showcase · Lagos 2027

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

  const transporter =
    getMailTransport();

  const info =
    await transporter.sendMail({
      from:
        `"${fromName}" <${fromEmail}>`,

      to: recipientEmail,

      subject:
        `${application.registrationNumber} — ASCEND Lagos 2027 Application Received`,

      html,

      attachments: [
        {
          filename:
            `${application.registrationNumber}-QR.png`,

          content: qrBuffer,

          cid:
            "ascend-showcase-application-qr",
        },
      ],
    });

  await prisma.showcaseApplication.update({
    where: {
      id: application.id,
    },

    data: {
      confirmationEmailSentAt:
        new Date(),
    },
  });

  return {
    messageId: info.messageId,
    recipientEmail,
  };
}
