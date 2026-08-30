type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    gateway_response?: string;
    paid_at?: string;
  };
};

function getSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured."
    );
  }

  return secretKey;
}

export async function initialisePaystackTransaction({
  email,
  amountMinor,
  currency,
  reference,
  callbackUrl,
  metadata,
}: {
  email: string;
  amountMinor: number;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        amount: String(amountMinor),
        currency,
        reference,
        callback_url: callbackUrl,
        metadata: metadata
          ? JSON.stringify(metadata)
          : undefined,
      }),

      cache: "no-store",
    }
  );

  const result =
    (await response.json()) as PaystackInitializeResponse;

  if (
    !response.ok ||
    !result.status ||
    !result.data?.authorization_url
  ) {
    throw new Error(
      result.message ||
        "Unable to initialise Paystack payment."
    );
  }

  return result.data;
}

export async function verifyPaystackTransaction(
  reference: string
) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(
      reference
    )}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },

      cache: "no-store",
    }
  );

  const result =
    (await response.json()) as PaystackVerifyResponse;

  if (
    !response.ok ||
    !result.status ||
    !result.data
  ) {
    throw new Error(
      result.message ||
        "Unable to verify Paystack payment."
    );
  }

  return result.data;
}
