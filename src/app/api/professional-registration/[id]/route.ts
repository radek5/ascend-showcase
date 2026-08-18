import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        role: true,
        fullName: true,
        email: true,
        phone: true,
        headshotUrl: true,

        arrivalTransfer: true,
        arrivalDate: true,
        arrivalTime: true,
        arrivalAirline: true,
        arrivalFlight: true,

        departureTransfer: true,
        departureDate: true,
        departureTime: true,
        departureAirline: true,
        departureFlight: true,

        hotelStatus: true,
        lagosAddress: true,

        status: true,
      },
    });

  if (!registration) {
    return NextResponse.json(
      {
        error: "Professional registration not found.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(registration);
}
