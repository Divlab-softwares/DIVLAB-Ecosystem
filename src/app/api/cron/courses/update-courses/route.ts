import { NextResponse } from "next/server";
import { prisma } from "@@/lib/prisma";
import { broadcastCourseChange } from "@@/lib/courseRealtime.server";
import { resend } from '@@/lib/resend';
import { revalidateTag } from "next/cache";

interface EmailTemplateProps {
  firstName: string;
}


function isAuthorized(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyFromQuery = searchParams.get("key");
  const keyFromHeader = request.headers.get("x-cron-secret");

  return (keyFromQuery || keyFromHeader) === process.env.CRON_SECRET;
}

async function runCourseStateUpdate() {
  const now = new Date();


  // On cherche tout ce qui commence entre "Maintenant" et "Dans 1 heure"
  const oneHourFromNow = new Date(now.getTime() + 60 * 60000);

  // 1. Trouver les cours qui commencent dans ~30 min
  const upcomingReminders = await prisma.course.findMany({
    where: {
      date_start: {
        gt: now,              // Plus tard que maintenant
        lte: oneHourFromNow,  // Mais dans moins d'une heure
      },
      // state: "upcoming",
      // Crucial : seulement si on n'a pas déjà envoyé le mail
      reminderSent: false,
    },
    include: {
      // On suppose une relation "purchases" ou "enrollments" vers les utilisateurs
      purchases: {
        include: { user: true }
      },
      // ✅ On récupère les infos du formateur
      trainer: {
        include: { user: true }
      }
    }
  });

  console.log("30mins UpcomingCourses", upcomingReminders)

  console.log(" dateNow", Date.now())
  console.log("One hour from now", oneHourFromNow)

  // 2. Envoi des e-mails
  // 2. Envoi des e-mails en une seule fois
  for (const course of upcomingReminders) {
    const studentEmails = course.purchases
      .map(p => p.user.email)
      .filter((email): email is string => !!email); // Sécurité pour filtrer les emails null/undefined

    // Email du formateur
    const trainerEmail = course.trainer?.user?.email;

    const allRecipients = [...studentEmails];
    if (trainerEmail) {
      allRecipients.push(trainerEmail);
    }
    console.log("Differents emails", studentEmails)

    const htmlContent = `<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #2563eb; font-size: 24px;">Rappel : Votre session approche !</h1>
  </div>

  <p>Bonjour,</p>
  
  <p>Ceci est un rappel automatique pour vous informer que votre formation <strong>"${course.title}"</strong> commence dans <strong>60 minutes</strong>.</p>

  <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Formation :</strong> ${course.title}</p>
    <p style="margin: 0;"><strong>Heure de début :</strong> ${new Date(course.date_start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} (Heure locale)</p>
  </div>

  <p>Nous vous recommandons de vous préparer quelques minutes à l'avance pour vérifier votre connexion et votre matériel.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://train.divlabs-tech.com/course_details?courseId=${course.id}&DL_LV=true#purchaseForm" 
       style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
      Accéder à la plateforme
    </a>
  </div>

  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />

  <p style="font-size: 12px; color: #666; text-align: center;">
    Ceci est un message automatique de <strong>DivLab Software</strong>.<br />
    Si vous avez un problème technique, veuillez contacter notre support.
  </p>
    <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://train.divlabs-tech.com/images/logo/logo.jpg" 
         alt="DivLab Logo" 
         style="width: 150px; height: auto; display: block; margin: 0 auto;" />
         <p> <strong> DIVLAB</strong> </p>
  </div>
</div>
`
    if (allRecipients.length > 0) {
      try {
        // ✅ Resend permet d'envoyer à plusieurs destinataires d'un coup
        await resend.emails.send({
          from: 'divlabsoftware@divlabs-tech.com',
          to: allRecipients,
          subject: `Rappel : "${course.title}" commence dans 1 heure !`,
          html: htmlContent
        });

        console.log("Email envoyes avec success")
      } catch (error) {
        console.error("Erreur Resend:", error);
      }
    }

    // ✅ On update Prisma
    await prisma.course.update({
      where: { id: course.id },
      data: { reminderSent: true }
    });
  }


  const coursesToStart = await prisma.course.findMany({
    where: {
      date_start: { lte: now },
      date_end: { gt: now },
      state: "upcoming",
    },
    select: { id: true },
  });


  const coursesToClose = await prisma.course.findMany({
    where: {
      date_end: { lte: now },
      state: { not: "closed" },
    },
    select: { id: true },
  });


  const [started, closed] = await Promise.all([
    prisma.course.updateMany({
      where: {
        id: { in: coursesToStart.map((course) => course.id) },
      },
      data: { state: "started" },
    }),
    prisma.course.updateMany({
      where: {
        id: { in: coursesToClose.map((course) => course.id) },
      },
      data: { state: "closed" },
    }),
  ]);

  await Promise.all([
    ...coursesToStart.map((course) =>
      broadcastCourseChange(course.id, "course.updated"),
    ),
    ...coursesToClose.map((course) =>
      broadcastCourseChange(course.id, "course.updated"),
    ),
  ]);

  if (coursesToStart.length > 0 || coursesToClose.length > 0) {
    revalidateTag("courses", "default");
  }

  return {
    started: started.count,
    closed: closed.count,
    onstartedCourse: coursesToStart,
    oncloseCourse: coursesToClose,
    checkedAt: now.toISOString(),
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse("Non autorise", { status: 401 });
  }

  try {
    return NextResponse.json(await runCourseStateUpdate());
  } catch (error) {
    console.error("Cron course update failed:", error);
    return NextResponse.json({ error: "Erreur DB" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
export const maxDuration = 60; // Autorise jusqu'à 60 secondes d'exécution (Vercel Hobby = 10s, Pro = 300s)
