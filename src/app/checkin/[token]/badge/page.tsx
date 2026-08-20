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

        <section className="overflow-hidden rounded-3xl border-2 border-[#1685ff] bg-white print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
          <div className="bg-[#090909] px-6 py-5 text-white">
            <div className="h-1 w-16 rounded-full bg-[#c7ff2f]" />

            <div className="mt-4 text-xl font-black tracking-[0.3em]">
               ASCEND
            </div>

            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[#1685ff]">
               Football Showcase
         </div>
       </div>

          <div className="p-7 text-center">
            <div className="text-xs font-black uppercase tracking-[0.18em]">
              Player Credential
            </div>

          <div className="mx-auto mt-6 h-36 w-36 overflow-hidden rounded-2xl border-4 border-[#1685ff] bg-[#090909]">
            <img
              src={`/api/registration/${registration.id}/headshot`}
              alt={`${registration.firstName || ""} ${registration.lastName || ""}`}
              className="h-full w-full object-cover"
            />
          </div>

            <h1 className="mt-4 text-3xl font-black">
              {registration.firstName}{" "}
              {registration.lastName}
            </h1>

            <div className="mt-2 text-lg font-bold">
              {registration.primaryPosition ||
                "Player"}
            </div>

            <div className="mt-5 rounded-xl bg-[#c7ff2f] px-4 py-3 font-mono text-lg font-black text-black print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
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
