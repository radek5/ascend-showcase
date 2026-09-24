import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import { getMailTransport } from "./mailer";

type SendProfessionalAccreditationArgs = {
  registrationId: string;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

export async function sendProfessionalAccreditation({
  registrationId,
}: SendProfessionalAccreditationArgs) {
  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        event: true,
      },
    });

  if (!registration) {
    throw new Error(
      "Professional registration not found.",
    );
  }

  if (!registration.registrationNumber) {
    throw new Error(
      "Professional registration number must exist before sending the event pass.",
    );
  }

  if (!registration.checkInToken) {
    throw new Error(
      "Check-in token must exist before sending the event pass.",
    );
  }

  //
  // Do not send the event-pass email twice.
  //
  if (registration.approvalEmailSentAt) {
    return {
      messageId: null,
      recipientEmail: registration.email,
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured.",
    );
  }

  const checkInUrl =
    `${appUrl}/professional-checkin/${registration.checkInToken}`;

  const qrBuffer = await QRCode.toBuffer(
    checkInUrl,
    {
      width: 360,
      margin: 2,
      errorCorrectionLevel: "H",
    },
  );

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

  const role =
    registration.role.replaceAll("_", " ");

  const arrivalBlock =
    registration.arrivalTransfer
      ? `
        <tr>
          <td style="color:#818181;">Airport collection</td>
          <td align="right" style="font-weight:700;">YES</td>
        </tr>

        <tr>
          <td style="color:#818181;">Arrival date</td>
          <td align="right" style="font-weight:700;">
            ${formatDate(registration.arrivalDate)}
          </td>
        </tr>

        <tr>
          <td style="color:#818181;">Arrival time</td>
          <td align="right" style="font-weight:700;">
            ${registration.arrivalTime || "Not provided"}
          </td>
        </tr>

        <tr>
          <td style="color:#818181;">Arrival airline</td>
          <td align="right" style="font-weight:700;">
            ${registration.arrivalAirline || "Not provided"}
          </td>
        </tr>

        <tr>
          <td style="color:#818181;">Arrival flight</td>
          <td align="right" style="font-weight:700;">
            ${registration.arrivalFlight || "Not provided"}
          </td>
        </tr>
      `
      : `
        <tr>
          <td style="color:#818181;">Airport collection</td>
          <td align="right" style="font-weight:700;">NO</td>
        </tr>
      `;

  const departureBlock =
    registration.departureTransfer
      ? `
        <tr>
          <td style="color:#818181;">Departure transfer</td>
          <td align="right" style="font-weight:700;">YES</td>
        </tr>

        <tr>
          <td style="color:#818181;">Departure date</td>
          <td align="right" style="font-weight:700;">
            ${formatDate(registration.departureDate)}
          </td>
        </tr>

        <tr>
          <td style="color:#818181;">Departure time</td>
          <td align="right" style="font-weight:700;">
            ${registration.departureTime || "Not provided"}
          </td>
        </tr>

        <tr>
          <td style="color:#818181;">Departure airline</td>
          <td align="right" style="font-weight:700;">
            ${registration.departureAirline || "Not provided"}
          </td>
        </tr>

        <tr>
          <td style="color:#818181;">Departure flight</td>
          <td align="right" style="font-weight:700;">
            ${registration.departureFlight || "Not provided"}
          </td>
        </tr>
      `
      : `
        <tr>
          <td style="color:#818181;">Departure transfer</td>
          <td align="right" style="font-weight:700;">NO</td>
        </tr>
      `;

  const hotelText =
    registration.hotelStatus === "YES"
      ? "Lagos Continental Hotel"
      : registration.hotelStatus === "NO"
        ? registration.lagosAddress || "Alternative accommodation"
        : "Accommodation not yet confirmed";

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
              <td style="border:1px solid #2c3911;background:#11160b;border-radius:22px;padding:34px;">

                <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#c7ff2f;">
                  PROFESSIONAL EVENT PASS ISSUED
                </div>

                <h1 style="margin:14px 0 10px;font-size:34px;">
                  Welcome to Lagos 2027
                </h1>

                <p style="margin:0;color:#a9a9a9;line-height:1.7;">
                  Dear ${registration.fullName}, your professional registration
                  has been approved and your REVELATIONX1 Lagos 2027 Event Pass
                  has been issued.
                </p>

                <div style="margin-top:28px;padding-top:24px;border-top:1px solid #303030;">

                  <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
                    PROFESSIONAL REGISTRATION NUMBER
                  </div>

                  <div style="margin-top:8px;font-size:28px;font-weight:900;color:#c7ff2f;">
                    ${registration.registrationNumber}
                  </div>

                  <div style="margin-top:14px;color:#a0a0a0;">
                    ${role}
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
                        PROFESSIONAL EVENT PASS
                      </div>

                      <h2 style="margin:10px 0 20px;">
                        Present this QR code on arrival
                      </h2>

                      <img
                        src="cid:revelationx1-professional-event-pass"
                        width="230"
                        height="230"
                        alt="REVELATIONX1 professional Event Pass QR code"
                        style="display:block;background:white;padding:10px;border-radius:14px;"
                      />

                      <p style="margin:20px auto 0;max-width:470px;color:#969696;line-height:1.7;">
                        REVELATIONX1 staff will scan this QR code to retrieve your
                        professional registration and complete event check-in.
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

                      <h2 style="margin:0 0 20px;font-size:20px;">
                        Travel & Airport Transfer
                      </h2>

                      <table width="100%" cellspacing="0" cellpadding="6">
                        ${arrivalBlock}
                        ${departureBlock}
                      </table>

                      <div style="margin-top:18px;color:#8f8f8f;font-size:13px;line-height:1.7;">
                        Airport transfers relate to Murtala Muhammed International Airport,
                        Lagos. Final pickup instructions will be communicated separately.
                      </div>

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
                        Accommodation
                      </h2>

                      <p style="margin:0;color:#a9a9a9;line-height:1.7;">
                        ${hotelText}
                      </p>

                      <p style="margin:18px 0 0;">
                        <a
                          href="https://www.thelagoscontinental.com/"
                          style="color:#c7ff2f;font-weight:700;"
                        >
                          View Lagos Continental Hotel
                        </a>
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

                      <h2 style="margin:0 0 14px;font-size:20px;">
                        Event access
                      </h2>

                      <p style="margin:0;color:#a9a9a9;line-height:1.8;">
                        Your Event Pass is required while attending REVELATIONX1
                        Lagos 2027. Please present your QR code and any
                        identification requested by REVELATIONX1 staff.
                      </p>

                      <p style="margin:16px 0 0;color:#a9a9a9;line-height:1.8;">
                        Access to player-only, changing, medical and other
                        restricted areas remains controlled under REVELATIONX1
                        safeguarding procedures.
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

                REVELATIONX1 Football Showcase · ${registration.event.edition}

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
    to: registration.email,

    subject:
      `${registration.registrationNumber} — REVELATIONX1 Lagos 2027 Professional Event Pass`,

    html,

    attachments: [
      {
        filename:
          `${registration.registrationNumber}-Event-Pass-QR.png`,

        content: qrBuffer,

        cid: "revelationx1-professional-event-pass",
      },
    ],
  });

  await prisma.professionalRegistration.update({
    where: {
      id: registration.id,
    },

    data: {
      approvalEmailSentAt: new Date(),
    },
  });

  return {
    messageId: info.messageId,
    recipientEmail: registration.email,
  };
}
