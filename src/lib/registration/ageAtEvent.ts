export function calculateAgeAtDate(
  dateOfBirth: Date,
  referenceDate: Date,
) {
  let age =
    referenceDate.getFullYear() - dateOfBirth.getFullYear();

  const monthDifference =
    referenceDate.getMonth() - dateOfBirth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      referenceDate.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
}

export function getAgeAtEvent(
  dateOfBirth: Date | null,
  footballStartsAt: Date | null,
) {
  if (!dateOfBirth || !footballStartsAt) {
    return {
      ageAtEvent: null,
      isUnder18AtEvent: null,
    };
  }

  const ageAtEvent = calculateAgeAtDate(
    dateOfBirth,
    footballStartsAt,
  );

  return {
    ageAtEvent,
    isUnder18AtEvent: ageAtEvent < 18,
  };
}
