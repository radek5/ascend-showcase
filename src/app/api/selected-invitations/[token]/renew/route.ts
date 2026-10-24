import { NextRequest, NextResponse } from "next/server";
import { createSecureToken, hashSecureToken } from "@/lib/applicants/tokens";
import { prisma } from "@/lib/prisma";
import {
  sendWhatsAppInvitation,
  WhatsAppRejectedError,
} from "@/lib/whatsapp/sendInvitation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENT_SLUG = "lagos-2027";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const REQUEST_COOLDOWN = 60 * 60 * 1000;
const MAX_RENEWALS = 5;

function reply(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return reply("Invalid invitation.", 400);
  }

  // Do not modify an invitation when messaging is unavailable.
  if (
    !process.env.WHATSAPP_ACCESS_TOKEN ||
    !process.env.WHATSAPP_PHONE_NUMBER_ID ||
    !process.env.WHATSAPP_TEMPLATE_NAME
  ) {
    return reply("Invitation renewal is temporarily unavailable.", 503);
  }

  const now = new Date();
  const originalHash = hashSecureToken(token);

  const player = await prisma.showcaseSelectedPlayer.findFirst({
    where: {
      OR: [
        { registrationTokenHash: originalHash },
        { invitationRecoveryTokenHash: originalHash },
      ],
    },
    select: {
      id: true,
      registrationTokenHash: true,
      eventSlug: true,
      footballSelected: true,
      whatsappNumber: true,
      registrationTokenExpiresAt: true,
      registrationTokenUsedAt: true,
      registeredApplicantUserId: true,
      matchedApplicationId: true,
      invitationRecoveryTokenHash: true,
      invitationRenewalRequestedAt: true,
      invitationRenewalCount: true,
    },
  });

  if (
    !player ||
    player.eventSlug !== EVENT_SLUG ||
    !player.footballSelected ||
    !player.whatsappNumber ||
    !player.registrationTokenExpiresAt ||
    player.registrationTokenExpiresAt > now ||
    player.registrationTokenUsedAt ||
    player.registeredApplicantUserId ||
    player.matchedApplicationId
  ) {
    return reply("This invitation cannot be renewed.", 400);
  }

  if (player.invitationRenewalCount >= MAX_RENEWALS) {
    return reply("The renewal request limit has been reached.", 429);
  }

  if (
    player.invitationRenewalRequestedAt &&
    now.getTime() - player.invitationRenewalRequestedAt.getTime() <
      REQUEST_COOLDOWN
  ) {
    return reply("Please wait before requesting another invitation.", 429);
  }

  const newToken = createSecureToken();
  const newHash = hashSecureToken(newToken);
  const expiresAt = new Date(now.getTime() + SEVEN_DAYS);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://ascend-showcase.netlify.app";

  const invitationUrl = `${baseUrl.replace(/\/$/, "")}/apply/selected/${newToken}`;

  // Atomically activate the replacement and reserve the renewal.
  const updated = await prisma.showcaseSelectedPlayer.updateMany({
    where: {
      id: player.id,
      registrationTokenHash: player.registrationTokenHash,
      registrationTokenExpiresAt: { lte: now },
      registrationTokenUsedAt: null,
      registeredApplicantUserId: null,
      matchedApplicationId: null,
      invitationRenewalCount: { lt: MAX_RENEWALS },
      OR: [
        { invitationRenewalRequestedAt: null },
        {
          invitationRenewalRequestedAt: {
            lt: new Date(now.getTime() - REQUEST_COOLDOWN),
          },
        },
      ],
    },
    data: {
      registrationTokenHash: newHash,
      registrationTokenExpiresAt: expiresAt,
      invitationRecoveryTokenHash:
        player.invitationRecoveryTokenHash ?? originalHash,
      invitationRenewalRequestedAt: now,
      invitationRenewalCount: { increment: 1 },
    },
  });

  if (updated.count !== 1) {
    return reply(
      "This invitation cannot currently be renewed. Please try again later.",
      409,
    );
  }

  try {
    await sendWhatsAppInvitation({
      whatsappNumber: player.whatsappNumber,
      invitationUrl,
    });
  } catch (error) {
    if (error instanceof WhatsAppRejectedError) {
      // Meta explicitly rejected the request; restore the expired link.
      await prisma.showcaseSelectedPlayer.updateMany({
        where: {
          id: player.id,
          registrationTokenHash: newHash,
          registrationTokenUsedAt: null,
          registeredApplicantUserId: null,
          matchedApplicationId: null,
          invitationRenewalRequestedAt: now,
        },
        data: {
          registrationTokenHash: player.registrationTokenHash,
          registrationTokenExpiresAt: player.registrationTokenExpiresAt,
          invitationRecoveryTokenHash: player.invitationRecoveryTokenHash,
          invitationRenewalRequestedAt: player.invitationRenewalRequestedAt,
          invitationRenewalCount: player.invitationRenewalCount,
        },
      });

      console.error("WhatsApp invitation renewal rejected:", {
        playerId: player.id,
        status: error.status,
      });

      return reply(
        "WhatsApp could not accept your invitation request. Please try again later.",
        503,
      );
    }

    // A timeout or connection failure may occur after Meta accepts the message.
    // Do not invalidate a replacement link that might already be in transit.
    console.error("WhatsApp invitation renewal delivery uncertain:", {
      playerId: player.id,
      error,
    });

    return reply(
      "Your renewal request was processed, but WhatsApp delivery could not be confirmed. Please contact support if your invitation does not arrive.",
      202,
    );
  }

  return reply(
    "A new seven-day invitation has been requested for your registered WhatsApp number.",
    200,
  );
}
