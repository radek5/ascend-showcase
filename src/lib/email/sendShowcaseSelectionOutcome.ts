import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { getMailTransport } from "./mailer";

type Args = {
  applicationId: string;
  force?: boolean;
};

export async function sendShowcaseSelectionOutcome({
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
      registrationNumber: true,
      selectionDecisionReleasedAt: true,
      selectionOutcomeEmailSentAt: true,
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
      "Selection decisions must be formally released before an outcome email can be sent.",
    );
  }

  if (
    application.status !== "SELECTED" &&
    application.status !== "RESERVE" &&
    application.status !== "NOT_SELECTED"
  ) {
    throw new Error("Application does not have a released selection outcome.");
  }

  if (!application.email) {
    throw new Error("Player email address is missing.");
  }

  if (!application.registrationNumber) {
    throw new Error(
      "Registration number must exist before sending a selection outcome.",
    );
  }

  if (application.selectionOutcomeEmailSentAt && !force) {
    return {
      messageId: null,
      recipientEmail: application.email,
      skipped: true,
    };
  }

  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!rawAppUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is required to send selection outcome emails.",
    );
  }

  const appUrl = rawAppUrl.replace(/\/$/, "");
  const accountUrl = `${appUrl}/account/login`;

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

  const presentation =
    application.status === "SELECTED"
      ? {
          label: "OFFICIAL SELECTION DECISION",
          title: "You have been selected",
          subject: `${application.registrationNumber} — Selected for REVELATIONX1 Lagos 2027`,
          accent: "#c7ff2f",
          message:
            "Congratulations. Following the REVELATIONX1 Lagos 2027 eligibility and football assessment process, you have been selected and offered a place at the Men's Football Showcase.",
          next: "Your selection is an offer of one of the 50 available places. You will need to confirm whether you accept your place before your participation is finalised.",
          action: "View Your Selection",
        }
      : application.status === "RESERVE"
        ? {
            label: "OFFICIAL SELECTION DECISION",
            title: "You are on the reserve list",
            subject: `${application.registrationNumber} — Lagos 2027 Selection Decision`,
            accent: "#f3c950",
            message:
              "Your application has completed the REVELATIONX1 Lagos 2027 eligibility and football assessment process, and you have been placed on the reserve list.",
            next: "If a suitable place becomes available, REVELATIONX1 may contact you with an offer to join the Showcase. Your numeric position on the reserve list is not published.",
            action: "View Your Decision",
          }
        : {
            label: "OFFICIAL SELECTION DECISION",
            title: "Lagos 2027 selection decision",
            subject: `${application.registrationNumber} — Lagos 2027 Selection Decision`,
            accent: "#b8b8b8",
            message:
              "Your application has completed the REVELATIONX1 Lagos 2027 eligibility and football assessment process. You have not been selected for the final Showcase on this occasion.",
            next: "Selection was highly competitive, with only 50 places available. Thank you for the time, effort and football evidence you committed to your application.",
            action: "View Your Application",
          };

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
<td style="border:1px solid #303030;background:#111111;border-radius:22px;padding:34px;">

  <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:${presentation.accent};">
    ${presentation.label}
  </div>

  <h1 style="margin:14px 0 10px;font-size:34px;">
    ${presentation.title}
  </h1>

  <p style="margin:0 0 18px;color:#c8c8c8;">
    Dear ${application.firstName},
  </p>

  <p style="margin:0;color:#a9a9a9;line-height:1.8;">
    ${presentation.message}
  </p>

  <p style="margin:18px 0 0;color:#ffffff;font-weight:700;line-height:1.8;">
    ${presentation.next}
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

    <div style="margin-top:7px;font-size:24px;font-weight:900;color:${presentation.accent};">
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

  <h2 style="margin:0 0 12px;font-size:22px;">
    View your official decision
  </h2>

  <p style="margin:0 auto 22px;max-width:500px;color:#969696;line-height:1.7;">
    Sign in securely to your REVELATIONX1 account to view your
    Lagos 2027 application and official selection status.
  </p>

  <a
    href="${accountUrl}"
    style="display:inline-block;background:${presentation.accent};color:#090909;text-decoration:none;font-weight:900;padding:14px 24px;border-radius:999px;"
  >
    ${presentation.action}
  </a>

</td>
</tr>

</table>

</td>
</tr>

<tr>
<td style="padding:28px 4px;color:#777777;font-size:12px;line-height:1.7;">

Need assistance? Contact

<a href="mailto:${supportEmail}" style="color:#c7ff2f;">
${supportEmail}
</a>.

<br /><br />

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

  /*
   * ----------------------------------------------------------
   * DELIVERY CLAIM
   * ----------------------------------------------------------
   *
   * The sent timestamp prevents ordinary duplicate sends, but
   * by itself it does not prevent two staff processes from both
   * reading "not sent" at the same time.
   *
   * Claim the email atomically before contacting the mail
   * provider. Only one process can hold the active claim.
   *
   * A claim older than 30 minutes is treated as abandoned so a
   * crashed process cannot permanently block future delivery.
   */

  const claimToken = randomUUID();
  const claimedAt = new Date();
  const staleBefore = new Date(Date.now() - 30 * 60 * 1000);

  const claim = await prisma.showcaseApplication.updateMany({
    where: {
      id: application.id,

      ...(force
        ? {}
        : {
            selectionOutcomeEmailSentAt: null,
          }),

      OR: [
        {
          selectionOutcomeEmailClaimedAt: null,
        },
        {
          selectionOutcomeEmailClaimedAt: {
            lt: staleBefore,
          },
        },
      ],
    },

    data: {
      selectionOutcomeEmailClaimedAt: claimedAt,
      selectionOutcomeEmailClaimToken: claimToken,
    },
  });

  if (claim.count !== 1) {
    return {
      messageId: null,
      recipientEmail: application.email,
      skipped: true,
    };
  }

  let info;

  try {
    const transporter = getMailTransport();

    info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: application.email,
      subject: presentation.subject,
      html,
    });
  } catch (error) {
    /*
     * SMTP failed before the provider confirmed delivery.
     *
     * Release only this sender's claim so the notification can
     * be retried safely.
     */
    await prisma.showcaseApplication.updateMany({
      where: {
        id: application.id,
        selectionOutcomeEmailClaimToken: claimToken,
        selectionOutcomeEmailSentAt: null,
      },

      data: {
        selectionOutcomeEmailClaimedAt: null,
        selectionOutcomeEmailClaimToken: null,
      },
    });

    throw error;
  }

  /*
   * The mail provider has now accepted the message.
   *
   * From this point onward we deliberately DO NOT release the
   * delivery claim if the database finalisation fails. The
   * recipient may already have received the email, so immediately
   * making it retryable could create a duplicate delivery.
   */
  const sentAt = new Date();

  const completed = await prisma.showcaseApplication.updateMany({
    where: {
      id: application.id,
      selectionOutcomeEmailClaimToken: claimToken,
    },

    data: {
      selectionOutcomeEmailSentAt: sentAt,
      selectionOutcomeMessageId: info.messageId || null,
      selectionOutcomeEmailClaimedAt: null,
      selectionOutcomeEmailClaimToken: null,
    },
  });

  if (completed.count !== 1) {
    throw new Error(
      "Selection outcome email was accepted by the mail provider, but the delivery record could not be finalised. The delivery claim has been retained to reduce duplicate-send risk.",
    );
  }

  return {
    messageId: info.messageId,
    recipientEmail: application.email,
    skipped: false,
  };
}
