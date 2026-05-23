import { NextRequest, NextResponse } from "next/server";
import {
  verifyNotchPayWebhookSignature,
  type NotchPayTransaction,
} from "@@/lib/notchpay";
import { syncNotchPayTransaction } from "@@/lib/notchpay-payment-sync";

type WebhookPayload = {
  event?: string;
  transaction?: NotchPayTransaction;
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  try {
    const signature = request.headers.get("x-notch-signature") || "";

    if (!verifyNotchPayWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Signature webhook invalide." },
        { status: 401 },
      );
    }

    const payload = JSON.parse(rawBody) as WebhookPayload;
    const transaction = payload.transaction;

    if (!transaction?.reference) {
      return NextResponse.json(
        { error: "Transaction webhook invalide." },
        { status: 400 },
      );
    }

    await syncNotchPayTransaction(transaction.reference, transaction);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook NotchPay :", error);
    return NextResponse.json(
      { error: "Erreur interne webhook NotchPay." },
      { status: 500 },
    );
  }
}
