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

  if (!registration.accreditationNumber) {
    throw new Error(
      "Accreditation number must exist before sending confirmation.",
    );
  }

  if (!registration.checkInToken) {
    throw new Error(
      "Check-in token must exist before sending confirmation.",
    );
  }

  //
  // Do not send the accreditation email twice.
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
    process.env.ASCEND_SUPPORT_EMAIL ||
    "showcase@ascendfootball.com";

  const fromEmail =
    process.env.ASCEND_FROM_EMAIL ||
    "showcase@ascendfootball.com";

  const fromName =
    process.env.ASCEND_FROM_NAME ||
    "ASCEND Football Showcase";

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
                  PROFESSIONAL ACCREDITATION CONFIRMED
                </div>

                <h1 style="margin:14px 0 10px;font-size:34px;">
                  Welcome to Lagos 2027
                </h1>

                <p style="margin:0;color:#a9a9a9;line-height:1.7;">
                  Dear ${registration.fullName}, your professional registration
                  has been confirmed and your ASCEND Lagos 2027 accreditation
                  has been issued.
                </p>

                <div style="margin-top:28px;padding-top:24px;border-top:1px solid #303030;">

                  <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
                    ACCREDITATION NUMBER
                  </div>

                  <div style="margin-top:8px;font-size:28px;font-weight:900;color:#c7ff2f;">
                    ${registration.accreditationNumber}
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
                        PROFESSIONAL CHECK-IN QR
                      </div>

                      <h2 style="margin:10px 0 20px;">
                        Present this code on arrival
                      </h2>

                      <img
                        src="cid:ascend-professional-qr"
                        width="230"
                        height="230"
                        alt="ASCEND professional accreditation QR code"
                        style="display:block;background:white;padding:10px;border-radius:14px;"
                      />

                      <p style="margin:20px auto 0;max-width:470px;color:#969696;line-height:1.7;">
                        ASCEND staff will scan this QR code to retrieve your
                        professional accreditation and complete event check-in.
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

                      <div style="margin-top:20px;padding:18px;border:1px solid #31410d;background:#151b0d;border-radius:12px;">

                        <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
                          ASCEND HOTEL CODE
                        </div>

                        <div style="margin-top:8px;font-size:21px;font-weight:900;color:#c7ff2f;">
                          ASCENDLAGOS2027
                        </div>

                        <p style="margin:10px 0 0;color:#8f8f8f;font-size:12px;line-height:1.6;">
                          Hotel discount rate and booking-code activation remain
                          subject to final hotel confirmation.
                        </p>

                      </div>

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
                        Professional accreditation is required while attending
                        ASCEND Lagos 2027. Please present your QR code and any
                        identification requested by ASCEND staff.
                      </p>

                      <p style="margin:16px 0 0;color:#a9a9a9;line-height:1.8;">
                        Access to player-only, changing, medical and other
                        restricted areas remains controlled under ASCEND
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
    to: registration.email,

    subject:
      `${registration.accreditationNumber} — ASCEND Lagos 2027 Professional Accreditation`,

    html,

    attachments: [
      {
        filename:
          `${registration.accreditationNumber}-QR.png`,

        content: qrBuffer,

        cid: "ascend-professional-qr",
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
