export type SupportedCurrency =
  | "NGN"
  | "GBP"
  | "USD"
  | "EUR";

export type FxQuote = {
  baseAmount: number;
  baseCurrency: "NGN";

  chargeAmount: number;
  chargeCurrency: SupportedCurrency;

  rate: number;
  source: string;
  quotedAt: Date;
};

/*
 * DEVELOPMENT ONLY
 *
 * These are simulated FX rates.
 *
 * Later this function will call our trusted FX/payment provider.
 * Checkout and database code will not need to change.
 */
const MOCK_RATES: Record<SupportedCurrency, number> = {
  NGN: 1,
  GBP: 0.00050,
  USD: 0.00065,
  EUR: 0.00056,
};

export function getSupportedCurrencies(): SupportedCurrency[] {
  return ["NGN", "GBP", "USD", "EUR"];
}

export function isSupportedCurrency(
  value: string,
): value is SupportedCurrency {
  return ["NGN", "GBP", "USD", "EUR"].includes(value);
}

export function getFxQuote(
  baseAmount: number,
  chargeCurrency: SupportedCurrency,
): FxQuote {
  if (!Number.isInteger(baseAmount) || baseAmount <= 0) {
    throw new Error("Invalid base payment amount.");
  }

  const rate = MOCK_RATES[chargeCurrency];

  if (rate === undefined) {
    throw new Error(
      `Unsupported payment currency: ${chargeCurrency}`,
    );
  }

  /*
   * Database values are stored in minor units.
   *
   * NGN = kobo
   * GBP = pence
   * USD = cents
   * EUR = cents
   */
  const baseMajorAmount = baseAmount / 100;

  const convertedMajorAmount =
    chargeCurrency === "NGN"
      ? baseMajorAmount
      : baseMajorAmount * rate;

  const chargeAmount = Math.round(
    convertedMajorAmount * 100,
  );

  return {
    baseAmount,
    baseCurrency: "NGN",

    chargeAmount,
    chargeCurrency,

    rate,
    source: "ASCEND_MOCK_FX",
    quotedAt: new Date(),
  };
}
