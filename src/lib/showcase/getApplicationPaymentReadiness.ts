import { prisma } from "@/lib/prisma";

const REQUIRED_IDENTITY_TYPES = [
  "PASSPORT",
  "NIN",
  "HEADSHOT",
] as const;

export async function getApplicationPaymentReadiness(
  applicationId: string
) {
  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        eventSlug: true,

        medicalConsent: true,
        eventConsent: true,
        privacyConsent: true,
        declarationConsent: true,
        playerAgreementConsent: true,
        termsConsent: true,

        identityDocuments: {
          select: {
            type: true,
            status: true,
            uploadedAt: true,
            storageKey: true,
          },
        },
      },
    });

  if (!application) {
    return null;
  }

  /*
   * A document is considered ready for the
   * payment stage when the upload has genuinely
   * completed and has not been rejected.
   *
   * Staff verification happens later during
   * eligibility review and is NOT required
   * before payment.
   */
  const completedIdentityTypes =
    new Set<string>(
      application.identityDocuments
        .filter(
          (document) =>
            Boolean(document.uploadedAt) &&
            Boolean(document.storageKey) &&
            document.status !== "REJECTED"
        )
        .map((document) => document.type)
    );

  const missingIdentityTypes =
    REQUIRED_IDENTITY_TYPES.filter(
      (type) =>
        !completedIdentityTypes.has(type)
    );

  const missingConsents: string[] = [];

  if (!application.medicalConsent) {
    missingConsents.push("medicalConsent");
  }

  if (!application.eventConsent) {
    missingConsents.push("eventConsent");
  }

  if (!application.privacyConsent) {
    missingConsents.push("privacyConsent");
  }

  if (!application.declarationConsent) {
    missingConsents.push(
      "declarationConsent"
    );
  }

  if (!application.playerAgreementConsent) {
    missingConsents.push(
      "playerAgreementConsent"
    );
  }

  if (!application.termsConsent) {
    missingConsents.push("termsConsent");
  }

  const ready =
    missingIdentityTypes.length === 0 &&
    missingConsents.length === 0;

  let redirectPath: string | null = null;

  if (missingIdentityTypes.length > 0) {
    redirectPath =
      `/apply/${application.eventSlug}/${application.id}/identity`;
  } else if (missingConsents.length > 0) {
    redirectPath =
      `/apply/${application.eventSlug}/${application.id}/consent`;
  }

  return {
    applicationId: application.id,
    eventSlug: application.eventSlug,
    ready,
    missingIdentityTypes,
    missingConsents,
    redirectPath,
  };
}
