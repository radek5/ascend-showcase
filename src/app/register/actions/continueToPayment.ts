"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function continueToPayment(formData: FormData) {
  const registrationId = String(
    formData.get("registrationId") || "",
  );

  if (!registrationId) {
    throw new Error("Registration ID missing.");
  }

  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
  });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      currentStep: "PAYMENT",
    },
  });

  redirect(
    `/register/payment?registration=${registrationId}`,
  );
}
