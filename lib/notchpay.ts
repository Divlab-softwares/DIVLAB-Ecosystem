import crypto from "crypto";

export const NOTCHPAY_SUPPORTED_CURRENCIES = ["XAF", "XOF", "USD", "EUR"] as const;
export type NotchPayCurrency = (typeof NOTCHPAY_SUPPORTED_CURRENCIES)[number];

type CreatePaymentPayload = {
  amount: number;
  currency: NotchPayCurrency;
  callback: string;
  reference: string;
  description: string;
  customer: {
    name?: string;
    email: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
};

type NotchPayTransaction = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  customer?: string;
  payment_method?: string;
  description?: string;
  created_at?: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
};

type NotchPayCreatePaymentResponse = {
  status: string;
  message: string;
  code: number;
  transaction: NotchPayTransaction;
  authorization_url: string;
};

type NotchPayRetrievePaymentResponse = {
  status: string;
  message: string;
  code: number;
  transaction: NotchPayTransaction;
};

function getNotchPayApiKey() {
  const publicKey = process.env.NOTCHPAY_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("La cle publique NotchPay est manquante.");
  }

  return publicKey;
}

export function normalizeCourseCurrency(value: string | null | undefined): NotchPayCurrency | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  if (normalized === "FCFA") {
    return "XAF";
  }

  if (NOTCHPAY_SUPPORTED_CURRENCIES.includes(normalized as NotchPayCurrency)) {
    return normalized as NotchPayCurrency;
  }

  return null;
}

export function convertAmountToSmallestUnit(amount: number, currency: NotchPayCurrency) {
  const factor = currency === "USD" || currency === "EUR" ? 100 : 1;
  return Math.round(amount * factor);
}

export function getNotchPayBaseUrl() {
  return "https://api.notchpay.co";
}

async function parseNotchPayResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as T | null;

  if (!response.ok || !body) {
    throw new Error(`Erreur NotchPay HTTP ${response.status}`);
  }

  return body;
}

export class NotchPayService {
  /**
   * Initialise une transaction et retourne l'URL de redirection vers le checkout NotchPay.
   */
  static async createPayment(payload: CreatePaymentPayload) {
    const response = await fetch(`${getNotchPayBaseUrl()}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getNotchPayApiKey(),
      },
      body: JSON.stringify(payload),
    });

    return parseNotchPayResponse<NotchPayCreatePaymentResponse>(response);
  }

  /**
   * Relit l'etat d'une transaction depuis NotchPay.
   */
  static async retrievePayment(reference: string) {
    const response = await fetch(`${getNotchPayBaseUrl()}/payments/${reference}`, {
      method: "GET",
      headers: {
        Authorization: getNotchPayApiKey(),
      },
      cache: "no-store",
    });

    return parseNotchPayResponse<NotchPayRetrievePaymentResponse>(response);
  }
}

export function buildNotchPayReference(prefix = "np") {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
}

export function buildPurchaseAccessToken() {
  return `order_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

export function getWebhookHash() {
  return process.env.NOTCHPAY_WEBHOOK_HASH || "";
}

/**
 * Verifie la signature HMAC SHA-256 du webhook NotchPay.
 */
export function verifyNotchPayWebhookSignature(payload: string, signature: string) {
  const hash = getWebhookHash();

  if (!hash || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", hash)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature),
  );
}

export type { NotchPayTransaction, NotchPayCreatePaymentResponse, NotchPayRetrievePaymentResponse };
