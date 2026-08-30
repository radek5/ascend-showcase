export type Lagos2027AgeEligibility =
  | {
      eligible: true;
      reason: "AGE_ELIGIBLE";
      age: number;
    }
  | {
      eligible: false;
      reason: "AGE_TOO_YOUNG" | "AGE_TOO_OLD";
      age: number;
    };

export function calculateAgeOnDate(
  dateOfBirth: Date,
  referenceDate: Date
): number {
  let age =
    referenceDate.getUTCFullYear() -
    dateOfBirth.getUTCFullYear();

  const birthdayHasOccurred =
    referenceDate.getUTCMonth() >
      dateOfBirth.getUTCMonth() ||
    (referenceDate.getUTCMonth() ===
      dateOfBirth.getUTCMonth() &&
      referenceDate.getUTCDate() >=
        dateOfBirth.getUTCDate());

  if (!birthdayHasOccurred) {
    age -= 1;
  }

  return age;
}

export function checkLagos2027AgeEligibility(
  dateOfBirth: Date,
  footballStartsAt: Date
): Lagos2027AgeEligibility {
  const age = calculateAgeOnDate(
    dateOfBirth,
    footballStartsAt
  );

  if (age < 18) {
    return {
      eligible: false,
      reason: "AGE_TOO_YOUNG",
      age,
    };
  }

  if (age > 20) {
    return {
      eligible: false,
      reason: "AGE_TOO_OLD",
      age,
    };
  }

  return {
    eligible: true,
    reason: "AGE_ELIGIBLE",
    age,
  };
}
