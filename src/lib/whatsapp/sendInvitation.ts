import "server-only";

export class WhatsAppRejectedError extends Error {
  constructor(public readonly status: number) {
    super(`WhatsApp API rejected the message (HTTP ${status}).`);
    this.name = "WhatsAppRejectedError";
  }
}

type SendInvitationParams = {
  whatsappNumber: string;
  invitationUrl: string;
};

export async function sendWhatsAppInvitation({
  whatsappNumber,
  invitationUrl,
}: SendInvitationParams): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

  if (!accessToken || !phoneNumberId || !templateName) {
    throw new Error("WhatsApp messaging is not configured.");
  }

  const recipient = whatsappNumber.replace(/\D/g, "");

  if (!/^[1-9]\d{7,14}$/.test(recipient)) {
    throw new Error("Invalid WhatsApp recipient number.");
  }

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: invitationUrl,
                },
              ],
            },
          ],
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) {
    throw new WhatsAppRejectedError(response.status);
  }

  const result: unknown = await response.json();

  if (
    !result ||
    typeof result !== "object" ||
    !("messages" in result) ||
    !Array.isArray(result.messages) ||
    result.messages.length === 0
  ) {
    throw new Error("WhatsApp API did not confirm message acceptance.");
  }
}
