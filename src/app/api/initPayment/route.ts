import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@@/lib/prisma";
import {
  buildNotchPayReference,
  buildPurchaseAccessToken,
  convertAmountToSmallestUnit,
  normalizeCourseCurrency,
  NotchPayService,
} from "@@/lib/notchpay";

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  try {
    const {
      userEmail,
      formationId,
      customerName,
      phone,
    }: {
      userEmail?: string;
      formationId?: string;
      customerName?: string;
      phone?: string;
    } = await request.json();

    if (!userEmail || !formationId) {
      return NextResponse.json(
        { error: "Les champs userEmail et formationId sont obligatoires." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur introuvable." },
        { status: 404 },
      );
    }

    const existingFormation = await prisma.course.findUnique({
      where: { id: formationId },
    });

    if (!existingFormation) {
      return NextResponse.json(
        { error: "Formation introuvable." },
        { status: 404 },
      );
    }

    const existingSuccessPurchase = await prisma.purchase.findFirst({
      where: {
        formationId,
        userId: existingUser.id,
        paymentStatus: "success",
      },
    });

    if (existingSuccessPurchase) {
      return NextResponse.json(
        { error: "Vous avez deja acces a cette formation." },
        { status: 409 },
      );
    }

    const courseCurrency = normalizeCourseCurrency(existingFormation.currency);
    const isPaidCourse = existingFormation.price > 0;

    if (isPaidCourse && !courseCurrency) {
      return NextResponse.json(
        { error: "La devise de cette formation n'est pas supportee pour le paiement." },
        { status: 400 },
      );
    }

    if (isPaidCourse && existingFormation.price <= 0) {
      return NextResponse.json(
        { error: "Le prix de cette formation est invalide." },
        { status: 400 },
      );
    }

    const pendingPurchase =
      (await prisma.purchase.findFirst({
        where: {
          formationId,
          userId: existingUser.id,
          paymentStatus: "pending",
        },
        orderBy: { createdAt: "desc" },
      })) ?? null;

    const purchase =
      pendingPurchase ??
      (await prisma.purchase.create({
        data: {
          formationId,
          paymentStatus: isPaidCourse ? "pending" : "success",
          accessToken: buildPurchaseAccessToken(),
          userId: existingUser.id,
        },
      }));

    if (!isPaidCourse) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { paymentStatus: "success" },
      });

      revalidateTag(`my-courses-${existingUser.id}`, "max");
      revalidatePath("/available_courses");
      revalidatePath("/courses_state");
      revalidatePath("/my_courses");

      return NextResponse.json(
        {
          success: true,
          mode: "free",
          redirectPath: `/my_courses?update=${Date.now()}`,
        },
        { status: 201 },
      );
    }

    const paymentReference = buildNotchPayReference();
    const callbackUrl = `${getBaseUrl()}/api/payments/notchpay/callback`;
    const amount = convertAmountToSmallestUnit(existingFormation.price, courseCurrency!);

    const paymentResponse = await NotchPayService.createPayment({
      amount,
      currency: courseCurrency!,
      callback: callbackUrl,
      reference: paymentReference,
      description: `Paiement de la formation ${existingFormation.title}`,
      customer: {
        name: customerName || existingUser.name,
        email: existingUser.email,
        phone,
      },
      metadata: {
        formationId,
        userId: existingUser.id,
        purchaseAccessToken: purchase.accessToken,
        courseTitle: existingFormation.title,
      },
    });

    await prisma.payment.create({
      data: {
        reference: paymentReference,
        merchantReference: purchase.accessToken,
        trxref: paymentResponse.transaction.id,
        amount,
        currency: courseCurrency!,
        status: paymentResponse.transaction.status || "pending",
        paymentMethod: paymentResponse.transaction.payment_method || null,
        description: `Paiement de la formation ${existingFormation.title}`,
        metadata: {
          formationId,
          purchaseId: purchase.id,
          purchaseAccessToken: purchase.accessToken,
          courseTitle: existingFormation.title,
          userId: existingUser.id,
        },
        userId: existingUser.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        mode: "paid",
        authorizationUrl: paymentResponse.authorization_url,
        reference: paymentReference,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur lors de l'initialisation du paiement NotchPay :", error);
    return NextResponse.json(
      { error: "Impossible d'initialiser le paiement pour le moment." },
      { status: 500 },
    );
  }
}
