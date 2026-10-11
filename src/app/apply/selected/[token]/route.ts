import { NextRequest, NextResponse } from "next/server";
import { hashSecureToken } from "@/lib/applicants/tokens";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "rx1_selected_player_invitation";

async function findInvitation(token: string) {
  if (!token || token.length < 32 || token.length > 256) {
    return null;
  }

  const player = await prisma.showcaseSelectedPlayer.findUnique({
    where: {
      registrationTokenHash: hashSecureToken(token),
    },
    select: {
      eventSlug: true,
      footballSelected: true,
      registrationTokenExpiresAt: true,
      registrationTokenUsedAt: true,
      matchedApplicationId: true,
    },
  });

  if (
    !player ||
    player.eventSlug !== "lagos-2027" ||
    !player.footballSelected ||
    !player.registrationTokenExpiresAt ||
    player.registrationTokenExpiresAt <= new Date() ||
    player.registrationTokenUsedAt ||
    player.matchedApplicationId
  ) {
    return null;
  }

  return player;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const invitation = await findInvitation(token);

  if (!invitation) {
    return NextResponse.redirect(
      new URL("/apply/lagos-2027?invitation=invalid", request.url),
    );
  }

  const response = new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>REVELATIONX1 — Selected Player Registration</title>
  <style>
    body{margin:0;background:#090909;color:white;font-family:Arial,sans-serif;
      min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}
    main{max-width:480px;text-align:center}
    h1{font-size:32px}
    p{color:#bbb;line-height:1.7}
    button{background:#c7ff2f;color:#090909;border:0;border-radius:40px;
      padding:17px 28px;font-weight:800;cursor:pointer;font-size:15px}
  </style>
</head>
<body>
  <main>
    <h1>REVELATIONX1</h1>
    <h2>Selected Player Registration</h2>
    <p>You have received a private invitation to complete your
    registration for the Lagos 2026 Football Showcase.</p>
    <p>Only continue if this invitation was intended for you.</p>
    <form method="POST">
      <button type="submit">Create Account &amp; Continue</button>
    </form>
  </main>
</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Content-Security-Policy":
          "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      },
    },
  );

  return response;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const invitation = await findInvitation(token);

  if (!invitation) {
    return NextResponse.redirect(
      new URL("/apply/lagos-2027?invitation=invalid", request.url),
      303,
    );
  }

  const response = NextResponse.redirect(
    new URL("/account/register?selectedInvitation=1", request.url),
    303,
  );

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.min(
      60 * 60 * 24 * 7,
      Math.max(
        1,
        Math.floor(
          (invitation.registrationTokenExpiresAt!.getTime() - Date.now()) /
            1000,
        ),
      ),
    ),
  });

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");

  return response;
}
