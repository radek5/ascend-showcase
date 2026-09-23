import { prisma } from "@/lib/prisma";
import { getMailTransport } from "./mailer";

type Args = {
  registrationId: string;
  force?: boolean;
};

export async function sendProfessionalRegistrationConfirmation({
  registrationId,
  force = false,
}: Args) {
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

  if (!registration.submittedAt) {
    throw new Error(
      "Professional registration must be submitted before sending confirmation.",
    );
  }

  if (
    registration.submissionEmailSentAt &&
    !force
  ) {
    return {
      messageId: null,
      recipientEmail: registration.email,
    };
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

  const role = registration.role.replaceAll("_", " ");

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
    REGISTRATION RECEIVED
  </div>

  <h1 style="margin:14px 0 10px;font-size:34px;">
    Your professional registration has been submitted
  </h1>

  <p style="margin:0 0 18px;color:#c8c8c8;">
    Dear ${registration.fullName},
  </p>

  <p style="margin:0;color:#a9a9a9;line-height:1.7;">
    We have received your professional registration for
    REVELATIONX1 Lagos 2027.
  </p>

  <div style="margin-top:26px;padding:20px;border:1px solid #303030;border-radius:14px;background:#0d0d0d;">

    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
      REGISTRATION STATUS
    </div>

    <div style="margin-top:8px;font-size:20px;font-weight:900;color:#c7ff2f;">
      SUBMITTED FOR REVIEW
    </div>

    <div style="margin-top:18px;font-size:11px;font-weight:700;letter-spacing:2px;color:#7e7e7e;">
      REGISTRATION ROLE
    </div>

    <div style="margin-top:8px;font-size:16px;font-weight:800;">
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
<td style="padding:28px;">

  <h2 style="margin:0 0 18px;font-size:20px;">
    What happens next?
  </h2>

  <p style="margin:0;color:#a9a9a9;line-height:1.7;">
    Your registration will now be reviewed by the REVELATIONX1
    team.
  </p>

  <p style="margin:14px 0 0;color:#ffffff;font-weight:700;line-height:1.7;">
    Submission does not constitute approval, accreditation or
    confirmation of attendance.
  </p>

  <p style="margin:14px 0 0;color:#a9a9a9;line-height:1.7;">
    If your registration is approved, you will subsequently
    receive your professional accreditation and event access
    information.
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
      "REVELATIONX1 Lagos 2027 — Professional Registration Received",
    html,
  });

  await prisma.professionalRegistration.update({
    where: {
      id: registration.id,
    },
    data: {
      submissionEmailSentAt: new Date(),
    },
  });

  return {
    messageId: info.messageId,
    recipientEmail: registration.email,
  };
}
