import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import PrintBadgeButton from "@/components/staff/PrintBadgeButton";

type PlayerBadgePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function PlayerBadgePage({
  params,
}: PlayerBadgePageProps) {
  const { token } = await params;

  const registration =
    await prisma.registration.findUnique({
      where: {
        checkInToken: token,
      },
      include: {
        event: true,
      },
    });

  if (
    !registration ||
    !registration.checkedInAt
  ) {
    notFound();
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const checkInUrl =
    `${appUrl}/checkin/${token}`;

  const qrCode =
    await QRCode.toDataURL(
      checkInUrl,
      {
        width: 260,
        margin: 1,
      },
    );

  return (
    <main className="min-h-screen bg-white p-8 text-black">
      <div className="mx-auto max-w-[420px]">
        <div className="print:hidden mb-5 flex justify-end">
          <button
            onClick={undefined}
            className="hidden"
          />
        </div>

        <section className="overflow-hidden rounded-3xl border-2 border-black bg-white">
          <div className="bg-black px-6 py-5 text-white">
            <div className="text-xl font-black tracking-[0.3em]">
              ASCEND
            </div>

            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
              Football Showcase
            </div>
          </div>

          <div className="p-7 text-center">
            <div className="text-xs font-black uppercase tracking-[0.18em]">
              Player Credential
            </div>

            <h1 className="mt-4 text-3xl font-black">
              {registration.firstName}{" "}
              {registration.lastName}
            </h1>

            <div className="mt-2 text-lg font-bold">
              {registration.primaryPosition ||
                "Player"}
            </div>

            <div className="mt-5 rounded-xl bg-black px-4 py-3 font-mono text-lg font-black text-white">
              {registration.registrationNumber ||
                "ASCEND PLAYER"}
            </div>

            <img
              src={qrCode}
              alt="Player event credential QR code"
              className="mx-auto mt-6 h-48 w-48"
            />

            <div className="mt-4 text-sm font-black">
              {registration.event.edition}
            </div>

            <div className="mt-1 text-xs text-black/50">
              {registration.event.city},{" "}
              {registration.event.country}
            </div>
          </div>
        </section>

        <div className="mt-6 text-center print:hidden">
          <PrintBadgeButton />
        </div>
      </div>
    </main>
  );
}
