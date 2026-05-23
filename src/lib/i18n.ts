export type Locale = "fr" | "en";

type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = {
  fr: {
    "common.home": "Accueil",
    "common.dashboard": "Tableau de bord",
    "common.profile": "Profil",
    "common.calendar": "Calendrier",
    "common.menu": "Menu",
    "common.options": "Options",
    "common.support": "Support",
    "common.loading": "Chargement…",
    "common.loadingMore": "Chargement de la suite…",
    "common.search": "Rechercher une formation...",
    "common.noResults": "Aucun résultat pour : {query}",
    "common.free": "Gratuit",
    "common.notDefined": "Non défini",
    "common.notSpecified": "Non précisé",
    "common.notAvailable": "N/A",
    "common.unknown": "Inconnu",
    "common.close": "Fermer",
    "common.save": "Sauvegarder",
    "common.edit": "Modifier",
    "common.continue": "Continuer",
    "common.previousStep": "Étape précédente",
    "common.language": "Langue",
    "common.french": "Français",
    "common.english": "Anglais",
    "common.currency": "FCFA",
    "common.retry": "Réessayer",
    "common.or": "ou",
    "nav.courses": "Formations",
    "nav.myCourses": "Mes formations",
    "nav.myFollowedCourses": "Mes formations suivies",
    "nav.availableCourses": "Formations disponibles",
    "nav.launchCourse": "Lancer une formation",
    "nav.launchedCourses": "Mes formations lancées",
    "nav.audience": "Audience",
    "nav.participantsByCourse": "Participants par formation",
    "nav.authentication": "Authentification",
    "nav.signIn": "Se connecter",
    "nav.signUp": "Créer un compte",
    "nav.myProfile": "Mon profil",
    "courses.availableTitle": "Formations disponibles",
    "courses.myTitle": "Mes formations",
    "courses.launchedTitle": "Mes formations lancées",
    "courses.noAvailable": "Aucune formation disponible pour le moment",
    "courses.noOwned": "Vous n'avez aucune formation",
    "courses.noLaunched": "Vous n'avez encore lancé aucune formation",
    "courses.signInRequired": "Connexion requise pour voir vos formations.",
    "courses.signInCta": "Se connecter",
    "courses.signUpCta": "Créer un compte DIVLAB",
    "courses.domain": "Domaine",
    "courses.period": "Période",
    "courses.duration": "Durée",
    "courses.price": "Prix",
    "courses.language": "Langue",
    "courses.trainer": "Formateur",
    "courses.accessKey": "Votre clé d'accès",
    "courses.participants": "{count} participants",
    "courses.viewParticipants": "Voir les participants",
    "courses.details": "Plus de détails",
    "courses.participate": "Je participe",
    "courses.openRoom": "Accéder à la salle",
    "courses.waitTrainer": "Veuillez patienter pendant que le formateur se connecte",
    "courses.roomOpen": "Une fenêtre est déjà ouverte. Fermez-la à la fin de la formation.",
    "courses.restricted": "Accès restreint",
    "courses.update": "Mettre à jour",
    "courses.viewLaunchDetails": "Voir les détails",
    "courses.dayOf": "Journée du {date}",
    "courses.fromTo": "Du {start} au {end}",
    "courses.dateUndefined": "Date non définie",
    "courses.status.upcoming": "La formation n'a pas encore commencé",
    "courses.status.started": "La formation est en cours",
    "courses.status.completed": "La formation est terminée",
    "courses.catalog": "Catalogue",
    "courses.live": "En direct",
    "courses.connectedToDb": "Données synchronisées",
    "courses.joinErrorUnauthorized": "Vous n'êtes pas inscrit à cette formation",
    "courses.joinErrorPayment": "Votre paiement n'a pas été confirmé. Veuillez contacter le support.",
    "courses.joinErrorToken": "Accès invalide. Veuillez contacter le support.",
    "courses.joinErrorLog": "Erreur lors de l'enregistrement de votre accès. Veuillez réessayer.",
    "courses.navigationPending": "Navigation en cours…",
    "courses.navigationErrorTitle": "Navigation impossible",
    "courses.navigationErrorOffline": "Impossible de naviguer pour le moment. Vérifiez votre connexion réseau.",
    "courses.navigationErrorAuth": "Connexion requise pour accéder à cette page. Veuillez vous connecter.",

    "courses.waitTrainerOnButton": "Formateur non actif",
    "home.trainer.heroEyebrow": "Vue formateur",
    "home.trainer.heroTitle": "Pilotez vos formations, votre audience et vos revenus dans un seul espace.",
    "home.trainer.heroText": "Suivez vos sessions en cours, l'activité de vos participants et la performance de vos programmes avec des données issues de la plateforme.",
    "home.trainer.heroPrimary": "Créer une formation",
    "home.trainer.heroSecondary": "Voir mes formations",
    "home.trainer.heroTotalRevenue": "Revenus cumulés",
    "home.trainer.heroActiveCourses": "Formations actives",
    "home.trainer.heroUpcomingCourses": "Sessions à venir",
    "home.learner.learnMore": "En savoir plus sur Divlab",
    "home.learner.eyebrow": "Plateforme de formation",
    "home.learner.welcomeAuth": "Bienvenue sur DIVLAB Train",
    "home.learner.welcomeGuest": "Des formations en ligne concrètes, fluides et accessibles",
    "home.learner.textAuth": "Retrouvez vos formations, suivez les sessions en direct et explorez de nouveaux contenus sans quitter votre espace.",
    "home.learner.textGuest": "Explorez le catalogue DIVLAB, inscrivez-vous rapidement et rejoignez des sessions animées par des formateurs vérifiés.",
    "home.learner.explore": "Explorer les formations",
    "home.learner.featuredCourses": "Formations en vitrine",
    "home.learner.activeDomains": "Domaines actifs",
    "home.learner.freeCourses": "Formations gratuites",
    "home.learner.selection": "Sélection",
    "home.learner.popularCourses": "Formations populaires",
    "home.learner.popularText": "Un aperçu des contenus les plus consultés pour aider les nouveaux participants à trouver rapidement un point d'entrée.",
    "home.learner.emptyPopular": "Le catalogue populaire s'affichera ici dès qu'une formation sera disponible.",
    "stats.participants": "Participants cumulés",
    "stats.formations": "Formations publiées",
    "stats.activeCourses": "Formations actives",
    "stats.upcomingCourses": "Sessions à venir",
    "stats.audienceByMonth": "Audience par mois",
    "stats.audienceByMonthText": "Évolution mensuelle des inscriptions de vos participants.",
    "stats.revenueTarget": "Performance de revenus",
    "stats.revenueTargetText": "Comparaison entre le revenu du mois courant et votre meilleur mois.",
    "stats.performanceTitle": "Tendances d'activité",
    "stats.performanceText": "Participants, revenus et formations publiées sur 12 mois.",
    "stats.demography": "Démographie des participants",
    "stats.demographyText": "Répartition des participants par pays selon les achats enregistrés.",
    "stats.recentCourses": "Formations récentes",
    "stats.recentCoursesText": "Vos formations les plus récentes et leur niveau d'activité.",
    "stats.seeAll": "Voir tout",
    "stats.revenue": "Revenu",
    "stats.currentMonth": "Mois courant",
    "stats.bestMonth": "Meilleur mois",
    "stats.target": "Objectif dynamique",
    "stats.noData": "Aucune donnée exploitable pour le moment.",
    "stats.course": "Formation",
    "stats.status": "Statut",
    "stats.learners": "Participants",
    "stats.lastSession": "Dernière session",
    "profile.title": "Votre profil",
    "profile.trainerTitle": "Profil du formateur",
    "profile.personalInfo": "Informations personnelles",
    "profile.address": "Adresse",
    "profile.becomeTrainer": "Devenir formateur",
    "profile.loading": "Chargement du profil…",
    "profile.name": "Nom",
    "profile.surname": "Prénom",
    "profile.email": "Adresse email",
    "profile.phone": "Téléphone",
    "profile.bio": "Bio",
    "profile.profession": "Profession",
    "profile.sex": "Sexe",
    "profile.country": "Pays",
    "profile.city": "Ville / État",
    "profile.postalCode": "Code postal",
    "profile.userId": "Identifiant utilisateur",
  },
  en: {
    "common.home": "Home",
    "common.dashboard": "Dashboard",
    "common.profile": "Profile",
    "common.calendar": "Calendar",
    "common.menu": "Menu",
    "common.options": "Options",
    "common.support": "Support",
    "common.loading": "Loading...",
    "common.loadingMore": "Loading more...",
    "common.search": "Search a course...",
    "common.noResults": "No results for: {query}",
    "common.free": "Free",
    "common.notDefined": "Not defined",
    "common.notSpecified": "Not specified",
    "common.notAvailable": "N/A",
    "common.unknown": "Unknown",
    "common.close": "Close",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.continue": "Continue",
    "common.previousStep": "Previous step",
    "common.language": "Language",
    "common.french": "French",
    "common.english": "English",
    "common.currency": "XAF",
    "common.retry": "Retry",
    "common.or": "or",

    "nav.courses": "Courses",
    "nav.myCourses": "My courses",
    "nav.myFollowedCourses": "My enrolled courses",
    "nav.availableCourses": "Available courses",
    "nav.launchCourse": "Launch a course",
    "nav.launchedCourses": "My launched courses",
    "nav.audience": "Audience",
    "nav.participantsByCourse": "Participants by course",
    "nav.authentication": "Authentication",
    "nav.signIn": "Sign in",
    "nav.signUp": "Create account",
    "nav.myProfile": "My profile",
    "courses.availableTitle": "Available courses",
    "courses.myTitle": "My courses",
    "courses.launchedTitle": "My launched courses",
    "courses.noAvailable": "No courses are available right now",
    "courses.noOwned": "You do not have any courses yet",
    "courses.noLaunched": "You have not launched any courses yet",
    "courses.signInRequired": "You need to sign in to view your courses.",
    "courses.signInCta": "Sign in",
    "courses.signUpCta": "create a DIVLAB account",
    "courses.domain": "Domain",
    "courses.period": "Period",
    "courses.duration": "Duration",
    "courses.price": "Price",
    "courses.language": "Language",
    "courses.trainer": "Trainer",
    "courses.accessKey": "Your access key",
    "courses.participants": "{count} participants",
    "courses.viewParticipants": "View participants",
    "courses.details": "More details",
    "courses.participate": "Join course",
    "courses.openRoom": "Open room",
    "courses.waitTrainer": "Please wait for the trainer to connect",
    "courses.roomOpen": "A window is already open. Close it when the course ends.",
    "courses.restricted": "Restricted access",
    "courses.update": "Update",
    "courses.viewLaunchDetails": "View details",
    "courses.dayOf": "Single-day session on {date}",
    "courses.fromTo": "From {start} to {end}",
    "courses.dateUndefined": "Date not set",
    "courses.status.upcoming": "Course has not started yet",
    "courses.status.started": "Course is live",
    "courses.status.completed": "Course has ended",
    "courses.catalog": "Catalog",
    "courses.live": "Live",
    "courses.connectedToDb": "Database-backed data",
    "courses.joinErrorUnauthorized": "You are not enrolled in this course",
    "courses.joinErrorPayment": "Your payment has not been confirmed. Please contact support.",
    "courses.joinErrorToken": "Invalid access. Please contact support.",
    "courses.joinErrorLog": "Could not log your access. Please try again.",
    "courses.navigationPending": "Navigating...",
    "courses.navigationErrorTitle": "Navigation unavailable",
    "courses.navigationErrorOffline": "Unable to navigate right now. Please check your network connection.",
    "courses.navigationErrorAuth": "You must sign in to access this page.",
    "courses.waitTrainerOnButton": "Trainer not connected",
    "home.trainer.heroEyebrow": "Trainer view",
    "home.trainer.heroTitle": "Run your courses, audience, and revenue from one polished workspace.",
    "home.trainer.heroText": "Track live sessions, learner activity, and program performance with data pulled from the platform.",
    "home.trainer.heroPrimary": "Launch a course",
    "home.trainer.heroSecondary": "View my courses",
    "home.trainer.heroTotalRevenue": "Total revenue",
    "home.trainer.heroActiveCourses": "Active courses",
    "home.trainer.heroUpcomingCourses": "Upcoming sessions",
    "home.learner.learnMore": "Learn more about Divlab",
    "home.learner.eyebrow": "Learning platform",
    "home.learner.welcomeAuth": "Welcome to DIVLAB Train",
    "home.learner.welcomeGuest": "Concrete, smooth, accessible online learning",
    "home.learner.textAuth": "Find your courses, follow live sessions, and explore fresh content without leaving your workspace.",
    "home.learner.textGuest": "Browse the DIVLAB catalog, sign up quickly, and join sessions led by verified trainers.",
    "home.learner.explore": "Explore courses",
    "home.learner.featuredCourses": "Featured courses",
    "home.learner.activeDomains": "Active domains",
    "home.learner.freeCourses": "Free courses",
    "home.learner.selection": "Selection",
    "home.learner.popularCourses": "Popular courses",
    "home.learner.popularText": "A snapshot of the most viewed content to help new learners find a strong entry point quickly.",
    "home.learner.emptyPopular": "Popular courses will appear here once a course becomes available.",
    "stats.participants": "Total participants",
    "stats.formations": "Published courses",
    "stats.activeCourses": "Active courses",
    "stats.upcomingCourses": "Upcoming sessions",
    "stats.audienceByMonth": "Audience by month",
    "stats.audienceByMonthText": "Monthly growth of learner enrollments.",
    "stats.revenueTarget": "Revenue performance",
    "stats.revenueTargetText": "Current month revenue compared with your best month.",
    "stats.performanceTitle": "Activity trends",
    "stats.performanceText": "Participants, revenue, and published courses over 12 months.",
    "stats.demography": "Participant geography",
    "stats.demographyText": "Learner distribution by country based on recorded purchases.",
    "stats.recentCourses": "Recent courses",
    "stats.recentCoursesText": "Your latest courses and their engagement level.",
    "stats.seeAll": "See all",
    "stats.revenue": "Revenue",
    "stats.currentMonth": "Current month",
    "stats.bestMonth": "Best month",
    "stats.target": "Dynamic target",
    "stats.noData": "No meaningful data yet.",
    "stats.course": "Course",
    "stats.status": "Status",
    "stats.learners": "Learners",
    "stats.lastSession": "Last session",
    "profile.title": "Your profile",
    "profile.trainerTitle": "Trainer profile",
    "profile.personalInfo": "Personal information",
    "profile.address": "Address",
    "profile.becomeTrainer": "Become a trainer",
    "profile.loading": "Loading profile...",
    "profile.name": "Last name",
    "profile.surname": "First name",
    "profile.email": "Email address",
    "profile.phone": "Phone",
    "profile.bio": "Bio",
    "profile.profession": "Profession",
    "profile.sex": "Gender",
    "profile.country": "Country",
    "profile.city": "City / State",
    "profile.postalCode": "Postal code",
    "profile.userId": "User ID",
  },
};

export function translate(
  locale: Locale,
  key: string,
  values?: Record<string, string | number>,
) {
  const template = dictionaries[locale][key] ?? dictionaries.fr[key] ?? key;

  if (!values) {
    return template;
  }

  return Object.entries(values).reduce(
    (result, [placeholder, value]) =>
      result.replaceAll(`{${placeholder}}`, String(value)),
    template,
  );
}

export function formatCurrencyAmount(
  amount: number,
  locale: Locale,
  currency = locale === "en" ? "XAF" : "FCFA",
) {
  if (!Number.isFinite(amount)) {
    return `0 ${currency}`;
  }

  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    maximumFractionDigits: 0,
  }).format(amount) + ` ${currency}`;
}

export function formatUiDate(value: string | Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMonthLabel(value: string, locale: Locale) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    month: "short",
  }).format(date);
}

export function formatDurationLabel(totalMinutes: number, locale: Locale) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const labels: string[] = [];

  if (hours > 0) {
    labels.push(locale === "fr" ? `${hours} h` : `${hours} hr`);
  }

  if (minutes > 0) {
    labels.push(locale === "fr" ? `${minutes} min` : `${minutes} min`);
  }

  return labels.join(locale === "fr" ? " et " : " ");
}

export function normalizeCourseLanguage(value?: string | null, locale: Locale = "fr") {
  if (!value) {
    return locale === "fr" ? "Français" : "French";
  }

  const lower = value.toLowerCase();

  if (lower.includes("fr")) {
    return locale === "fr" ? "Français" : "French";
  }

  if (lower.includes("en")) {
    return locale === "fr" ? "Anglais" : "English";
  }

  return value;
}
