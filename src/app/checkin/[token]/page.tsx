import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";

type CheckInPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function CheckInPage({
  params,
}: CheckInPageProps) {
  const { token } = await params;

  const registration =
    await prisma.registration.findUnique({
      where: {
        checkInToken: token,
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
    notFound();
  }

  const { ageAtEvent, isUnder18AtEvent } =
    getAgeAtEvent(
      registration.dateOfBirth,
      registration.event.footballStartsAt,
    );

  const payment = registration.payments[0];

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
          ASCEND Event Operations
        </div>

        <h1 className="mt-3 text-4xl font-black">
          Player Check-in
        </h1>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-7">
          <div className="text-3xl font-black">
            {registration.firstName}{" "}
            {registration.lastName}
          </div>

          <div className="mt-2 text-[#c7ff2f]">
            {registration.registrationNumber}
          </div>

          <div className="mt-8 grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-2">
            <Item
              label="Event"
              value={registration.event.edition}
            />

            <Item
              label="Position"
              value={
                registration.primaryPosition ??
                "Not provided"
              }
            />

            <Item
              label="Age at event"
              value={
                ageAtEvent !== null
                  ? `${ageAtEvent} ${
                      isUnder18AtEvent
                        ? "(U18)"
                        : "(18+)"
                    }`
                  : "Unavailable"
              }
            />

            <Item
              label="Payment"
              value={payment ? "PAID" : "NOT PAID"}
            />

            <Item
              label="Medical"
              value={
                registration.medicalConsent
                  ? "Complete"
                  : "Incomplete"
              }
            />

            <Item
              label="Check-in"
              value={
                registration.checkedInAt
                  ? "Checked in"
                  : "Not checked in"
              }
            />
          </div>

          {isUnder18AtEvent && (
            <div className="mt-7 rounded-2xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-5">
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Parent / Guardian
              </div>

              <div className="mt-2 font-bold">
                {registration.guardianName}
              </div>

              <div className="mt-1 text-sm text-white/45">
                {registration.guardianRelationship}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div className="mt-1 font-semibold">
        {value}
      </div>
    </div>
  );
}
