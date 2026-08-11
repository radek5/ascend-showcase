import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";
import { getMailTransport } from "./mailer";

function formatEventDateTime(date: Date | null) {
  if (!date) {
    return "To be confirmed";
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
    timeZoneName: "short",
  }).format(date);
}

type SendRegistrationPassArgs = {
  registrationId: string;
};

export async function sendRegistrationPass({
  registrationId,
}: SendRegistrationPassArgs) {
  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },

    include: {
      event: true,

      payments: {
        where: {
          status: "PAID",
        },
        orderBy: {
          paidAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  if (!registration.registrationNumber) {
    throw new Error(
      "Registration number must exist before sending confirmation.",
    );
  }

  if (!registration.checkInToken) {
    throw new Error(
      "Check-in token must exist before sending confirmation.",
    );
  }

  const payment = registration.payments[0];

  if (!payment) {
    throw new Error(
      "A confirmed payment is required before sending the Registration Pass.",
    );
  }

  const { isUnder18AtEvent } = getAgeAtEvent(
    registration.dateOfBirth,
    registration.event.footballStartsAt,
  );

  if (isUnder18AtEvent === null) {
    throw new Error(
      "Unable to determine player age at the event.",
    );
  }

  /*
   * U18 communication MUST go to the parent / legal guardian.
   * Adult communication goes directly to the player.
   */
  const recipientEmail = isUnder18AtEvent
    ? registration.guardianEmail
    : registration.email;

  if (!recipientEmail) {
    throw new Error(
      isUnder18AtEvent
        ? "Guardian email address is missing."
        : "Player email address is missing.",
    );
  }

  if (registration.confirmationEmailSentAt) {
  return {
    messageId: null,
    recipientEmail,
  };
}

  const recipientName = isUnder18AtEvent
    ? registration.guardianName || "Parent / Guardian"
    : registration.firstName || "Player";

  const playerName =
    `${registration.firstName ?? ""} ${registration.lastName ?? ""}`.trim();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured.",
    );
  }

  const checkInUrl =
    `${appUrl}/checkin/${registration.checkInToken}`;

  /*
   * Create PNG bytes rather than a data URL.
   * The QR is embedded into the email using a CID attachment.
   */
  const qrBuffer = await QRCode.toBuffer(checkInUrl, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  const registrationVenue =
    registration.event.registrationVenue ||
    registration.event.venue;

  const registrationStarts =
    formatEventDateTime(
      registration.event.registrationStartsAt,
    );

  const registrationEnds =
    formatEventDateTime(
      registration.event.registrationEndsAt,
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

  const guardianIntro = isUnder18AtEvent
    ? `<p style="margin:0 0 18px;color:#c8c8c8;">
         Dear ${recipientName}, this confirmation relates to
         <strong style="color:#ffffff;">${playerName}</strong>.
       </p>`
    : `<p style="margin:0 0 18px;color:#c8c8c8;">
         Dear ${recipientName},
       </p>`;

  const instructions =
    registration.event.registrationInstructions
      ? `<p style="margin:0;color:#b8b8b8;line-height:1.7;">
           ${registration.event.registrationInstructions}
         </p>`
      : "";

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
                  REGISTRATION CONFIRMED
                </div>

                <h1 style="margin:14px 0 10px;font-size:34px;">
                  Your place is secured
                </h1>

                ${guardianIntro}

                <p style="margin:0;color:#a9a9a9;line-height:1.7;">
                  Payment has been confirmed and the ASCEND Football Showcase
                  registration for ${playerName} is complete.
                </p>

                <div style="margin-top:28px;padding-top:24px;border-top:1px solid #303030;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
                    REGISTRATION NUMBER
                  </div>

                  <div style="margin-top:8px;font-size:28px;font-weight:900;color:#c7ff2f;">
                    ${registration.registrationNumber}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding-top:22px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #262626;background:#111111;border-radius:18px;">
                  <tr>
                    <td style="padding:28px;">
                      <h2 style="margin:0 0 20px;font-size:20px;">
                        Event Registration & Check-in
                      </h2>

                      <table width="100%" cellspacing="0" cellpadding="6">
                        <tr>
                          <td style="color:#818181;">Event</td>
                          <td align="right" style="font-weight:700;">
                            ${registration.event.edition}
                          </td>
                        </tr>

                        <tr>
                          <td style="color:#818181;">Location</td>
                          <td align="right" style="font-weight:700;">
                            ${registrationVenue}
                          </td>
                        </tr>

                        <tr>
                          <td style="color:#818181;">Registration opens</td>
                          <td align="right" style="font-weight:700;">
                            ${registrationStarts}
                          </td>
                        </tr>

                        <tr>
                          <td style="color:#818181;">Registration closes</td>
                          <td align="right" style="font-weight:700;">
                            ${registrationEnds}
                          </td>
                        </tr>
                      </table>

                      <div style="margin-top:22px;padding:18px;border:1px solid #31410d;background:#151b0d;border-radius:12px;">
                        ${instructions}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding-top:22px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #262626;background:#111111;border-radius:18px;">
                  <tr>
                    <td align="center" style="padding:30px;">
                      <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#c7ff2f;">
                        EVENT CHECK-IN QR
                      </div>

                      <h2 style="margin:10px 0 20px;">
                        Present this code on arrival
                      </h2>

                      <img
                        src="cid:ascend-registration-qr"
                        width="230"
                        height="230"
                        alt="ASCEND registration QR code"
                        style="display:block;background:white;padding:10px;border-radius:14px;"
                      />

                      <p style="margin:20px auto 0;max-width:470px;color:#969696;line-height:1.7;">
                        ASCEND staff will scan this QR code to retrieve the
                        confirmed registration and complete event check-in.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding-top:22px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #262626;background:#111111;border-radius:18px;">
                  <tr>
                    <td style="padding:28px;">
                      <h2 style="margin:0 0 16px;font-size:20px;">
                        What to bring
                      </h2>

                      <ul style="margin:0;padding-left:22px;color:#b8b8b8;line-height:2;">
                        <li>Football boots</li>
                        <li>Shin pads</li>
                        <li>Water bottle</li>
                        <li>Any personal medication required</li>
                        <li>This registration QR code</li>
                        <li>Any identification requested by ASCEND</li>
                      </ul>

                      <div style="margin-top:22px;padding:16px;border:1px solid #3a3a3a;border-radius:12px;color:#d0d0d0;line-height:1.7;">
                        <strong style="color:#ffffff;">
                          Please note:
                        </strong>
                        Football boots are not provided. Players must bring
                        their own suitable football boots.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding-top:22px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #262626;background:#111111;border-radius:18px;">
                  <tr>
                    <td style="padding:28px;">
                      <h2 style="margin:0 0 12px;font-size:20px;">
                        What you will receive at registration
                      </h2>

                      <p style="margin:0;color:#a9a9a9;line-height:1.8;">
                        All necessary event information will be provided during
                        registration. This includes event accreditation, player
                        group allocation, pitch allocation, schedule, reporting
                        instructions and any ASCEND event kit or clothing being
                        issued.
                      </p>
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
                <br />
                ASCEND Football Showcase · ${registration.event.edition}
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
    to: recipientEmail,

    subject:
      `${registration.registrationNumber} — ASCEND Football Showcase Registration Confirmed`,

    html,

    attachments: [
      {
        filename: `${registration.registrationNumber}-QR.png`,
        content: qrBuffer,
        cid: "ascend-registration-qr",
      },
    ],
  });

  await prisma.registration.update({
    where: {
      id: registration.id,
    },
    data: {
      confirmationEmailSentAt: new Date(),
    },
  });

  return {
    messageId: info.messageId,
    recipientEmail,
  };
}
