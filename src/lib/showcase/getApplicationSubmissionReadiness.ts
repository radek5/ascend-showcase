import { prisma } from "@/lib/prisma";

const REQUIRED_IDENTITY_TYPES = ["PASSPORT", "NIN", "HEADSHOT"] as const;

const REQUIRED_VIDEO_TYPES = ["MATCH_1", "MATCH_2", "HIGHLIGHTS"] as const;

export async function getApplicationSubmissionReadiness(applicationId: string) {
  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },

    select: {
      id: true,
      eventSlug: true,

      firstName: true,
      lastName: true,
      email: true,
      phone: true,

      dateOfBirth: true,
      age: true,
      sex: true,
      nationality: true,
      countryOfResidence: true,

      position: true,
      preferredFoot: true,

      emergencyContactName: true,
      emergencyContactRelationship: true,
      emergencyContactPhone: true,

      footballStatusDeclarationAccepted: true,
      footballStatusVerification: true,

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

      videos: {
        select: {
          type: true,
          status: true,
          submittedAt: true,
          storageKey: true,
        },
      },
    },
  });

  if (!application) {
    return null;
  }

  /*
   * ----------------------------------------------------------
   * CORE PLAYER INFORMATION
   * ----------------------------------------------------------
   */

  const missingPlayerFields: string[] = [];

  if (!application.firstName) {
    missingPlayerFields.push("firstName");
  }

  if (!application.lastName) {
    missingPlayerFields.push("lastName");
  }

  if (!application.dateOfBirth) {
    missingPlayerFields.push("dateOfBirth");
  }

  if (typeof application.age !== "number") {
    missingPlayerFields.push("age");
  }

  if (!application.sex) {
    missingPlayerFields.push("sex");
  }

  if (!application.nationality) {
    missingPlayerFields.push("nationality");
  }

  if (!application.countryOfResidence) {
    missingPlayerFields.push("countryOfResidence");
  }

  if (!application.position) {
    missingPlayerFields.push("position");
  }

  if (!application.preferredFoot) {
    missingPlayerFields.push("preferredFoot");
  }

  /*
   * ----------------------------------------------------------
   * CONTACT
   * ----------------------------------------------------------
   */

  const missingContactFields: string[] = [];

  if (!application.email) {
    missingContactFields.push("email");
  }

  if (!application.phone) {
    missingContactFields.push("phone");
  }

  if (!application.emergencyContactName) {
    missingContactFields.push("emergencyContactName");
  }

  if (!application.emergencyContactRelationship) {
    missingContactFields.push("emergencyContactRelationship");
  }

  if (!application.emergencyContactPhone) {
    missingContactFields.push("emergencyContactPhone");
  }

  /*
   * ----------------------------------------------------------
   * IDENTITY
   * ----------------------------------------------------------
   */

  const completedIdentityTypes = new Set<string>(
    application.identityDocuments
      .filter(
        (document) =>
          Boolean(document.uploadedAt) &&
          Boolean(document.storageKey) &&
          document.status !== "REJECTED",
      )
      .map((document) => document.type),
  );

  const missingIdentityTypes = REQUIRED_IDENTITY_TYPES.filter(
    (type) => !completedIdentityTypes.has(type),
  );

  /*
   * ----------------------------------------------------------
   * FOOTBALL RELATIONSHIPS / FULL DISCLOSURE
   * ----------------------------------------------------------
   */

  const footballDisclosureComplete =
    application.footballStatusDeclarationAccepted === true &&
    application.footballStatusVerification === "DECLARED";

  /*
   * ----------------------------------------------------------
   * VIDEO EVIDENCE
   * ----------------------------------------------------------
   */

  const completedVideoTypes = new Set<string>(
    application.videos
      .filter(
        (video) =>
          Boolean(video.submittedAt) &&
          Boolean(video.storageKey) &&
          video.status !== "REJECTED",
      )
      .map((video) => video.type),
  );

  const missingVideoTypes = REQUIRED_VIDEO_TYPES.filter(
    (type) => !completedVideoTypes.has(type),
  );

  /*
   * ----------------------------------------------------------
   * CONSENTS
   * ----------------------------------------------------------
   */

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
    missingConsents.push("declarationConsent");
  }

  if (!application.playerAgreementConsent) {
    missingConsents.push("playerAgreementConsent");
  }

  if (!application.termsConsent) {
    missingConsents.push("termsConsent");
  }

  /*
   * ----------------------------------------------------------
   * OVERALL READINESS
   * ----------------------------------------------------------
   */

  const ready =
    missingPlayerFields.length === 0 &&
    missingContactFields.length === 0 &&
    missingIdentityTypes.length === 0 &&
    footballDisclosureComplete &&
    missingVideoTypes.length === 0 &&
    missingConsents.length === 0;

  /*
   * Redirect to the earliest incomplete stage.
   */

  let redirectPath: string | null = null;

  if (missingPlayerFields.length > 0) {
    redirectPath = `/apply/${application.eventSlug}/${application.id}/player`;
  } else if (missingContactFields.length > 0) {
    redirectPath = `/apply/${application.eventSlug}/${application.id}/contact`;
  } else if (missingIdentityTypes.length > 0) {
    redirectPath = `/apply/${application.eventSlug}/${application.id}/identity`;
  } else if (!footballDisclosureComplete) {
    redirectPath = `/apply/${application.eventSlug}/${application.id}/representation`;
  } else if (missingVideoTypes.length > 0) {
    redirectPath = `/apply/${application.eventSlug}/${application.id}/video`;
  } else if (missingConsents.length > 0) {
    redirectPath = `/apply/${application.eventSlug}/${application.id}/consent`;
  }

  return {
    applicationId: application.id,
    eventSlug: application.eventSlug,

    ready,

    missingPlayerFields,
    missingContactFields,
    missingIdentityTypes,
    footballDisclosureComplete,
    missingVideoTypes,
    missingConsents,

    redirectPath,
  };
}
