import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@@/lib/authOption";
import { prisma } from "@@/lib/prisma";
import { NotchPayService } from "@@/lib/notchpay";
import { syncNotchPayTransaction } from "@@/lib/notchpay-payment-sync";

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const reference =
      url.searchParams.get("reference") ||
      url.searchParams.get("trxref") ||
      url.searchParams.get("payment_ref");

    if (!reference) {
      return NextResponse.redirect(
        `${getBaseUrl()}/available_courses?payment=missing_reference`,
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) {
      return NextResponse.redirect(
        `${getBaseUrl()}/available_courses?payment=unknown_reference`,
      );
    }

    const paymentVerification = await NotchPayService.retrievePayment(reference);
    await syncNotchPayTransaction(reference, paymentVerification.transaction);

    const metadata =
      payment.metadata && typeof payment.metadata === "object"
        ? (payment.metadata as Record<string, unknown>)
        : {};
    const formationId = String(metadata.formationId || "");
    const isSuccess = paymentVerification.transaction.status === "complete";
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      return NextResponse.redirect(
        `${getBaseUrl()}/course_details?courseId=${formationId}&payment=${isSuccess ? "success" : paymentVerification.transaction.status
        }`,
      );
    }

    return NextResponse.redirect(
      `${getBaseUrl()}/signin?callbackUrl=${encodeURIComponent(
        `/course_details?courseId=${formationId}&payment=${isSuccess ? "success" : paymentVerification.transaction.status
        }`,
      )}`,
    );
  } catch (error) {
    console.error("Erreur lors du callback NotchPay :", error);
    return NextResponse.redirect(
      `${getBaseUrl()}/available_courses?payment=error`,
    );
  }
}
