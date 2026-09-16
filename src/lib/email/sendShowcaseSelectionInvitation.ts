import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import { getMailTransport } from "./mailer";

type Args = {
  applicationId: string;
  force?: boolean;
};

export async function sendShowcaseSelectionInvitation({
  applicationId,
  force = false,
}: Args) {
  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },

    select: {
      id: true,
      eventSlug: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      selectedAt: true,
      selectionDecisionReleasedAt: true,
      selectionResponse: true,

      selectedPlayerConfirmation: {
        select: {
          confirmedAt: true,
        },
      },

      registrationNumber: true,
      checkInToken: true,
      selectionInvitationSentAt: true,
    },
  });

  if (!application) {
    throw new Error("Showcase application not found.");
  }

  const event = await prisma.event.findUnique({
    where: {
      slug: application.eventSlug,
    },

    select: {
      selectionDecisionsReleasedAt: true,
    },
  });

  if (!event) {
    throw new Error("Showcase event not found.");
  }

  if (
    !event.selectionDecisionsReleasedAt ||
    !application.selectionDecisionReleasedAt
  ) {
    throw new Error(
      "Selection decisions must be formally released before an event credential can be issued.",
    );
  }

  /*
   * ----------------------------------------------------------
   * SELECTION REQUIREMENTS
   * ----------------------------------------------------------
   *
   * An event credential must only be issued to a player
   * who has received a final SELECTED decision.
   */

  if (application.status !== "SELECTED") {
    throw new Error("Only selected players can receive a event credential.");
  }

  if (!application.selectedAt) {
    throw new Error(
      "Selected date must exist before an event credential can be issued.",
    );
  }

  if (application.selectionResponse !== "ACCEPTED") {
    throw new Error(
      "The player must accept their Lagos 2027 place before an event credential can be issued.",
    );
  }

  if (!application.selectedPlayerConfirmation?.confirmedAt) {
    throw new Error(
      "The player must complete Selected Player Confirmation before an event credential can be issued.",
    );
  }

  if (!application.registrationNumber) {
    throw new Error(
      "Registration number must exist before sending the Showcase invitation.",
    );
  }

  if (!application.checkInToken) {
    throw new Error(
      "Check-in token must exist before sending the Showcase invitation.",
    );
  }

  if (!application.email) {
    throw new Error("Player email address is missing.");
  }

  /*
   * Prevent accidental duplicate invitation emails.
   *
   * A deliberate resend can be performed by passing force=true.
   */

  if (application.selectionInvitationSentAt && !force) {
    return {
      messageId: null,
      recipientEmail: application.email,
    };
  }

  /*
   * ----------------------------------------------------------
   * EVENT CREDENTIAL
   * ----------------------------------------------------------
   */

  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!rawAppUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is required to generate event credential QR codes.",
    );
  }

  const appUrl = rawAppUrl.replace(/\/$/, "");

  const checkInUrl = `${appUrl}/showcase-checkin/${application.checkInToken}`;

  const qrBuffer = await QRCode.toBuffer(checkInUrl, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  /*
   * ----------------------------------------------------------
   * EMAIL CONFIGURATION
   * ----------------------------------------------------------
   */

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

  const playerName = `${application.firstName} ${application.lastName}`.trim();

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
    REVELATIONX1
  </div>

  <div style="margin-top:4px;font-size:10px;letter-spacing:4px;color:#8d8d8d;">
    FOOTBALL SHOWCASE
  </div>
</td>
</tr>

<tr>
<td style="border:1px solid #334414;background:#11160b;border-radius:22px;padding:34px;">

  <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#c7ff2f;">
    OFFICIAL EVENT CREDENTIAL
  </div>

  <h1 style="margin:14px 0 10px;font-size:34px;">
    Your Lagos 2027 event credential
  </h1>

  <p style="margin:0 0 18px;color:#c8c8c8;">
    Dear ${application.firstName},
  </p>

  <p style="margin:0;color:#a9a9a9;line-height:1.8;">
    Your Lagos 2027 place has been accepted and your
    Selected Player Confirmation has been completed.
    Your official REVELATIONX1 event credential is below.
  </p>

  <p style="margin:16px 0 0;color:#ffffff;font-weight:800;line-height:1.8;">
    Keep this credential secure and present it when reporting
    for the Lagos 2027 Men's Football Showcase.
  </p>

  <div style="margin-top:28px;padding-top:24px;border-top:1px solid #303030;">

    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
      PLAYER
    </div>

    <div style="margin-top:7px;font-size:20px;font-weight:900;">
      ${playerName}
    </div>

    <div style="margin-top:22px;font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
      REGISTRATION NUMBER
    </div>

    <div style="margin-top:7px;font-size:27px;font-weight:900;color:#c7ff2f;">
      ${application.registrationNumber}
    </div>

  </div>

</td>
</tr>

<tr>
<td style="padding-top:22px;">

<table width="100%" cellspacing="0" cellpadding="0"
style="border:1px solid #262626;background:#111111;border-radius:18px;">

<tr>
<td align="center" style="padding:30px;">

  <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#c7ff2f;">
    OFFICIAL EVENT CREDENTIAL
  </div>

  <h2 style="margin:10px 0 20px;font-size:24px;">
    Present this QR code on arrival
  </h2>

  <img
    src="cid:revelationx1-showcase-selection-qr"
    width="230"
    height="230"
    alt="REVELATIONX1 Lagos 2027 event credential"
    style="display:block;background:white;padding:10px;border-radius:14px;"
  />

  <p style="margin:20px auto 0;max-width:470px;color:#969696;line-height:1.7;">
    Authorised REVELATIONX1 staff will scan this credential
    to retrieve your selected-player record, verify your
    identity and complete event check-in.
  </p>

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
    IMPORTANT — KEEP YOUR CREDENTIAL SECURE
  </div>

  <p style="margin:14px 0 0;color:#ffffff;font-weight:800;line-height:1.8;">
    This QR code is issued specifically to you.
  </p>

  <p style="margin:10px 0 0;color:#b8b8b8;line-height:1.8;">
    Do not publish, forward or share your event credential
    with another person.
  </p>

  <p style="margin:10px 0 0;color:#b8b8b8;line-height:1.8;">
    Your identity will be verified by authorised staff before
    check-in is completed.
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
<td style="padding:28px;">

  <h2 style="margin:0 0 18px;font-size:20px;">
    What happens next?
  </h2>

  <div style="margin-bottom:18px;">
    <div style="font-weight:800;color:#c7ff2f;">
      1. Keep this email
    </div>

    <p style="margin:6px 0 0;color:#a9a9a9;line-height:1.7;">
      This email contains your official Lagos 2027
      selected-player credential.
    </p>
  </div>

  <div style="margin-bottom:18px;">
    <div style="font-weight:800;color:#c7ff2f;">
      2. Await final reporting instructions
    </div>

    <p style="margin:6px 0 0;color:#a9a9a9;line-height:1.7;">
      REVELATIONX1 will provide the required event reporting,
      venue and programme information separately where
      applicable.
    </p>
  </div>

  <div>
    <div style="font-weight:800;color:#c7ff2f;">
      3. Present your credential on arrival
    </div>

    <p style="margin:6px 0 0;color:#a9a9a9;line-height:1.7;">
      Staff will scan the QR code above and verify your
      identity before completing check-in.
    </p>
  </div>

</td>
</tr>

</table>

</td>
</tr>

<tr>
<td style="padding:28px 4px;color:#777777;font-size:12px;line-height:1.7;">

Please retain this email and your event credential.

<br /><br />

Need assistance? Contact

<a href="mailto:${supportEmail}" style="color:#c7ff2f;">
${supportEmail}
</a>.

<br />

REVELATIONX1 Football Showcase · Lagos 2027

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

    to: application.email,

    subject: `${application.registrationNumber} — Your REVELATIONX1 Lagos 2027 Event Credential`,

    html,

    attachments: [
      {
        filename: `${application.registrationNumber}-Event-Credential.png`,

        content: qrBuffer,

        cid: "revelationx1-showcase-selection-qr",
      },
    ],
  });

  const sentAt = new Date();

  await prisma.showcaseApplication.update({
    where: {
      id: application.id,
    },

    data: {
      selectionInvitationSentAt: sentAt,
      selectionInvitationMessageId: info.messageId || null,
    },
  });

  return {
    messageId: info.messageId,
    recipientEmail: application.email,
  };
}
