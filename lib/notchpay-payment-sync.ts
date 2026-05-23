import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@@/lib/prisma";
import type { NotchPayTransaction } from "@@/lib/notchpay";

function mapTransactionStatusToPurchaseStatus(status: string) {
  if (status === "complete") {
    return "success";
  }

  if (status === "processing" || status === "pending") {
    return "pending";
  }

  return status;
}

/**
 * Synchronise les tables Payment et Purchase a partir d'une transaction NotchPay verifiee.
 */
export async function syncNotchPayTransaction(reference: string, transaction: NotchPayTransaction) {
  const existingPayment = await prisma.payment.findUnique({
    where: { reference },
  });

  if (!existingPayment) {
    throw new Error("Paiement introuvable dans la base locale.");
  }

  const paymentMetadata =
    existingPayment.metadata && typeof existingPayment.metadata === "object"
      ? (existingPayment.metadata as Record<string, unknown>)
      : {};

  const purchaseAccessToken = String(paymentMetadata.purchaseAccessToken || "");
  const formationId = String(paymentMetadata.formationId || "");
  const userId = String(paymentMetadata.userId || "");
  const purchaseStatus = mapTransactionStatusToPurchaseStatus(transaction.status);

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { reference },
      data: {
        status: transaction.status,
        trxref: transaction.id,
        paymentMethod: transaction.payment_method || existingPayment.paymentMethod,
        metadata: {
          ...paymentMetadata,
          notchpayTransactionId: transaction.id,
          notchpayStatus: transaction.status,
          completedAt: transaction.completed_at || null,
        },
      },
    });

    if (purchaseAccessToken) {
      await tx.purchase.updateMany({
        where: {
          accessToken: purchaseAccessToken,
          ...(formationId ? { formationId } : {}),
          ...(userId ? { userId } : {}),
        },
        data: {
          paymentStatus: purchaseStatus,
        },
      });
    }
  });

  if (userId) {
    revalidateTag(`my-courses-${userId}`, "max");
  }
  if (formationId) {
    revalidateTag("courses", "default");
    revalidatePath(`/course_details?courseId=${formationId}`);
  }
  revalidatePath("/available_courses");
  revalidatePath("/courses_state");
  revalidatePath("/my_courses");
}
