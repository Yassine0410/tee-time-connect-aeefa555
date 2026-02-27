import { enUS, fr, type Locale } from "date-fns/locale";

export type Language = "en" | "fr";

const enTranslations = {
  "common.error": "Error",
  "common.user": "User",
  "common.unknown": "Unknown",
  "common.and": "and",
  "common.memberSince": "Member since {year}",
  "common.notSet": "Not set",

  "language.label": "Language",
  "language.english": "English",
  "language.french": "French",

  "nav.home": "Home",
  "nav.rounds": "My Rounds",
  "nav.create": "Create",
  "nav.chat": "Chat",
  "nav.profile": "Profile",

  "home.title": "Find Your Round",
  "home.subtitle": "Connect with golfers near you",
  "home.searchPlaceholder": "Search courses, formats...",
  "home.openRounds": "Open Rounds",
  "home.thisWeek": "This Week",
  "home.upcomingRounds": "Upcoming Rounds",
  "home.noRoundsFound": "No rounds found",
  "home.noRoundsHint": "Try adjusting your search or create a new round!",

  "profile.title": "Profile",
  "profile.handicap": "Handicap",
  "profile.club": "Club",
  "profile.memberSince": "Member since",
  "profile.editProfile": "Edit Profile",
  "profile.leaderboard": "Leaderboard",
  "profile.myRounds": "My Rounds",
  "profile.reviews": "Reviews",
  "profile.newGolfer": "New Golfer",
  "profile.noHomeClub": "No home club set",
  "profile.kpi.roundsPlayed": "Rounds Played",
  "profile.kpi.reliability": "Reliability",
  "profile.kpi.rating": "Rating",
  "profile.kpi.noRating": "No rating",
  "profile.kpi.loadingMeta": "Calculating reputation...",
  "profile.kpi.meta": "{count} reviews - attendance sample: {sample}",
  "profile.kpi.metaNoAttendance": "{count} reviews - no attendance data yet",
  "profile.signOut": "Sign Out",

  "createRound.title": "Create a Round",
  "createRound.date": "Date",
  "createRound.selectDate": "Select a date",
  "createRound.teeTime": "Tee Time",
  "createRound.selectTime": "Select a time",
  "createRound.golfCourse": "Golf Course",
  "createRound.selectCourse": "Select a course",
  "createRound.holesPar": "{holes} holes - Par {par}",
  "createRound.gameFormat": "Game Format",
  "createRound.players": "Number of Players",
  "createRound.playerLevel": "Player Level",
  "createRound.handicapAccepted": "Accepted handicap",
  "createRound.lowHandicap": "Low handicap",
  "createRound.intermediateHandicap": "Intermediate",
  "createRound.highHandicap": "High handicap",
  "createRound.invalidHandicapRange": "Invalid handicap range",
  "createRound.descriptionOptional": "Description (Optional)",
  "createRound.descriptionPlaceholder": "Add any details about your round...",
  "createRound.infoNote":
    "Your round will be visible to all golfers in the area. You can cancel or edit it anytime before it starts.",
  "createRound.creating": "Creating...",
  "createRound.publish": "Publish Round",
  "createRound.requiredFields": "Please fill in all required fields",
  "createRound.successTitle": "Round created successfully!",
  "createRound.successDesc": "Other golfers can now join your round.",
  "createRound.failTitle": "Failed to create round",

  "roundCard.full": "Full",
  "roundCard.spots": "{count} spots",

  "roundDetails.title": "Round Details",
  "roundDetails.notFoundTitle": "Round Not Found",
  "roundDetails.notFoundMessage": "This round doesn't exist or has been removed.",
  "roundDetails.backHome": "Back to Home",
  "roundDetails.leftRound": "You left the round",
  "roundDetails.joinedRound": "You joined the round!",
  "roundDetails.joinedRoundDesc": "See you at {course}!",
  "roundDetails.actionFailed": "Action failed",
  "roundDetails.linkCopied": "Link copied to clipboard!",
  "roundDetails.spotsLeft": "{count} spots left",
  "roundDetails.date": "Date",
  "roundDetails.teeTime": "Tee Time",
  "roundDetails.format": "Format",
  "roundDetails.level": "Level",
  "roundDetails.organizedBy": "ORGANIZED BY",
  "roundDetails.players": "PLAYERS ({current}/{total})",
  "roundDetails.you": "(You)",
  "roundDetails.spotAvailable": "{count} {word} available",
  "roundDetails.spot": "spot",
  "roundDetails.spotsWord": "spots",
  "roundDetails.leaveRound": "Leave Round",
  "roundDetails.roundIsFull": "Round is Full",
  "roundDetails.joinRound": "Join This Round",
  "roundDetails.groupChat": "Round Group Chat",
  "roundDetails.leaveReview": "Leave Reviews",
  "roundDetails.leaveConfirmTitle": "Leave this round?",
  "roundDetails.leaveConfirmHost_noPlayers": "You are the host and no one else has joined. This round will be permanently deleted.",
  "roundDetails.leaveConfirmHost_withPlayers": "You are the host. The host role will be transferred to the next player and the round will continue.",
  "roundDetails.leaveConfirmPlayer": "You will be removed from this round. You can rejoin later if spots are available.",
  "roundDetails.leaveConfirmCancel": "Cancel",
  "roundDetails.leaveConfirmAction": "Leave",
  "roundDetails.leaveConfirmDeleteAction": "Delete Round",
  "roundDetails.roundDeleted": "Round deleted",
  "roundDetails.hostTransferred": "You left. Host role transferred.",

  "myRounds.title": "My Rounds",
  "myRounds.subtitle": "Your upcoming and past games",
  "myRounds.upcoming": "Upcoming",
  "myRounds.past": "Past Rounds",
  "myRounds.noUpcomingTitle": "No upcoming rounds",
  "myRounds.noUpcomingHint": "Find a round to join or create your own!",
  "myRounds.createRound": "Create a Round",
  "myRounds.playedWith": "Played with {count} golfers",
  "myRounds.completed": "Completed",
  "myRounds.noPast": "No past rounds yet.",

  "leaderboard.title": "Leaderboard",
  "leaderboard.subtitle": "Based on wins",
  "leaderboard.noRankings": "No rankings yet",
  "leaderboard.noRankingsHint": "Rankings will appear once rounds are completed.",
  "leaderboard.victory": "win",
  "leaderboard.victories": "wins",
  "leaderboard.allPlayers": "All players",
  "leaderboard.you": "(you)",
  "leaderboard.played": "{count} played",

  "messages.title": "Messages",
  "messages.emptyTitle": "No conversations yet",
  "messages.emptyHint": "Conversations appear after the first message is sent.",
  "messages.roundPrefix": "Round",
  "messages.roundChatDefault": "Round Chat",
  "messages.noMessagesYet": "No messages yet",

  "reviews.title": "Reviews",
  "reviews.subtitle": "What other players said about you",
  "reviews.averageLabel": "Average rating",
  "reviews.totalLabel": "Total reviews",
  "reviews.noRating": "No rating",
  "reviews.emptyTitle": "No reviews yet",
  "reviews.emptyHint": "Complete rounds to start receiving reviews.",
  "reviews.roundMeta": "{course} - {date}",

  "roundReview.title": "Rate Players",
  "roundReview.subtitle": "Share your feedback after this round",
  "roundReview.notAllowedTitle": "Reviews unavailable",
  "roundReview.notAllowedHint": "Only participants can review completed rounds.",
  "roundReview.backToRound": "Back to Round",
  "roundReview.noTargetsTitle": "No players to review",
  "roundReview.noTargetsHint": "You already reviewed everyone in this round.",
  "roundReview.alreadyReviewed": "Already reviewed",
  "roundReview.ratingLabel": "Rating",
  "roundReview.commentLabel": "Comment (optional)",
  "roundReview.commentPlaceholder": "How was your experience with this player?",
  "roundReview.invalidRating": "Please choose a rating between 1 and 5",
  "roundReview.saving": "Saving...",
  "roundReview.save": "Save Review",
  "roundReview.saveSuccess": "Review saved",
  "roundReview.saveFailed": "Failed to save review",

  "chat.title": "Chat",
  "chat.roundChatDefault": "Round Chat",
  "chat.empty": "No messages yet. Say hello!",
  "chat.inputPlaceholder": "Type a message...",
  "chat.typingSingle": "{name} is typing…",
  "chat.typingMultiple": "{names} are typing…",
  "chat.typingMany": "{names} and {count} others are typing…",

  "auth.loginTagline": "Sign in to join your rounds",
  "auth.signupTagline": "Create your golfer account",
  "auth.forgotTagline": "Reset your password",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Name",
  "auth.loginLoading": "Signing in...",
  "auth.login": "Sign In",
  "auth.forgotPassword": "Forgot password?",
  "auth.createAccount": "Create account",
  "auth.namePlaceholder": "Your name",
  "auth.passwordMin": "Min. 6 characters",
  "auth.signupLoading": "Creating account...",
  "auth.signup": "Sign Up",
  "auth.backToLogin": "Back to sign in",
  "auth.sendLinkLoading": "Sending...",
  "auth.sendLink": "Send reset link",
  "auth.signupSuccessTitle": "Sign up successful!",
  "auth.signupSuccessDesc": "Check your email to confirm your account.",
  "auth.emailSentTitle": "Email sent",
  "auth.emailSentDesc": "Check your inbox to reset your password.",

  "reset.invalidLink": "Invalid or expired link.",
  "reset.title": "New password",
  "reset.newPassword": "New password",
  "reset.updateLoading": "Updating...",
  "reset.update": "Update password",
  "reset.updatedSuccess": "Password updated!",

  "editProfile.title": "Edit Profile",
  "editProfile.photoUpdated": "Photo updated!",
  "editProfile.invalidHandicapTitle": "Invalid handicap",
  "editProfile.invalidHandicapDesc": "Enter a value between -10 and 54",
  "editProfile.nameRequired": "Name is required",
  "editProfile.saved": "Profile saved!",
  "editProfile.tapToChange": "Tap to change your photo",
  "editProfile.name": "Name",
  "editProfile.namePlaceholder": "Your name",
  "editProfile.handicap": "Handicap",
  "editProfile.club": "Club",
  "editProfile.clubPlaceholder": "Your home golf club",
  "editProfile.bio": "Bio",
  "editProfile.bioPlaceholder": "A few words about you...",
  "editProfile.saving": "Saving...",
  "editProfile.save": "Save",
  "editProfile.cancel": "Cancel",

  "notFound.message": "Oops! Page not found",
  "notFound.returnHome": "Return to Home",
} as const;

type TranslationKey = keyof typeof enTranslations;

const frTranslations: Record<TranslationKey, string> = {
  "common.error": "Erreur",
  "common.user": "Utilisateur",
  "common.unknown": "Inconnu",
  "common.and": "et",
  "common.memberSince": "Membre depuis {year}",
  "common.notSet": "Non renseigné",

  "language.label": "Langue",
  "language.english": "Anglais",
  "language.french": "Français",

  "nav.home": "Accueil",
  "nav.rounds": "Mes parties",
  "nav.create": "Créer",
  "nav.chat": "Messages",
  "nav.profile": "Profil",

  "home.title": "Trouvez votre partie",
  "home.subtitle": "Connectez-vous avec des golfeurs près de chez vous",
  "home.searchPlaceholder": "Rechercher parcours, formats...",
  "home.openRounds": "Parties ouvertes",
  "home.thisWeek": "Cette semaine",
  "home.upcomingRounds": "Parties à venir",
  "home.noRoundsFound": "Aucune partie trouvée",
  "home.noRoundsHint": "Essayez d'ajuster votre recherche ou de créer une nouvelle partie !",

  "profile.title": "Profil",
  "profile.handicap": "Handicap",
  "profile.club": "Club",
  "profile.memberSince": "Membre depuis",
  "profile.editProfile": "Modifier le profil",
  "profile.leaderboard": "Classement",
  "profile.myRounds": "Mes parties",
  "profile.reviews": "Avis",
  "profile.newGolfer": "Nouveau golfeur",
  "profile.noHomeClub": "Aucun club défini",
  "profile.kpi.roundsPlayed": "Parties jouées",
  "profile.kpi.reliability": "Fiabilité",
  "profile.kpi.rating": "Note",
  "profile.kpi.noRating": "Pas de note",
  "profile.kpi.loadingMeta": "Calcul de la réputation...",
  "profile.kpi.meta": "{count} avis - échantillon de présence : {sample}",
  "profile.kpi.metaNoAttendance": "{count} avis - pas encore de données de présence",
  "profile.signOut": "Se déconnecter",

  "createRound.title": "Créer une partie",
  "createRound.date": "Date",
  "createRound.selectDate": "Choisir une date",
  "createRound.teeTime": "Heure de départ",
  "createRound.selectTime": "Choisir une heure",
  "createRound.golfCourse": "Parcours",
  "createRound.selectCourse": "Choisir un parcours",
  "createRound.holesPar": "{holes} trous - Par {par}",
  "createRound.gameFormat": "Format de jeu",
  "createRound.players": "Nombre de joueurs",
  "createRound.playerLevel": "Niveau des joueurs",
  "createRound.handicapAccepted": "Handicap accepté",
  "createRound.lowHandicap": "Handicap faible",
  "createRound.intermediateHandicap": "Intermédiaire",
  "createRound.highHandicap": "Handicap élevé",
  "createRound.invalidHandicapRange": "Plage de handicap invalide",
  "createRound.descriptionOptional": "Description (optionnel)",
  "createRound.descriptionPlaceholder": "Ajoutez des détails sur votre partie...",
  "createRound.infoNote":
    "Votre partie sera visible par tous les golfeurs de la région. Vous pourrez la modifier ou l'annuler à tout moment avant le départ.",
  "createRound.creating": "Création...",
  "createRound.publish": "Publier la partie",
  "createRound.requiredFields": "Veuillez remplir tous les champs obligatoires.",
  "createRound.successTitle": "Partie créée avec succès !",
  "createRound.successDesc": "Les autres golfeurs peuvent maintenant rejoindre votre partie.",
  "createRound.failTitle": "Échec de la création de la partie",

  "roundCard.full": "Complet",
  "roundCard.spots": "Places restantes : {count}",

  "roundDetails.title": "Détails de la partie",
  "roundDetails.notFoundTitle": "Partie introuvable",
  "roundDetails.notFoundMessage": "Cette partie n'existe pas ou a été supprimée.",
  "roundDetails.backHome": "Retour à l'accueil",
  "roundDetails.leftRound": "Vous avez quitté la partie",
  "roundDetails.joinedRound": "Vous avez rejoint la partie !",
  "roundDetails.joinedRoundDesc": "À bientôt sur {course} !",
  "roundDetails.actionFailed": "Échec de l'action",
  "roundDetails.linkCopied": "Lien copié dans le presse-papiers !",
  "roundDetails.spotsLeft": "Places restantes : {count}",
  "roundDetails.date": "Date",
  "roundDetails.teeTime": "Heure de départ",
  "roundDetails.format": "Format",
  "roundDetails.level": "Niveau",
  "roundDetails.organizedBy": "ORGANISÉ PAR",
  "roundDetails.players": "JOUEURS ({current}/{total})",
  "roundDetails.you": "(Vous)",
  "roundDetails.spotAvailable": "{count} {word} disponible(s)",
  "roundDetails.spot": "place",
  "roundDetails.spotsWord": "places",
  "roundDetails.leaveRound": "Quitter la partie",
  "roundDetails.roundIsFull": "Partie complète",
  "roundDetails.joinRound": "Rejoindre cette partie",
  "roundDetails.groupChat": "Discussion de groupe",
  "roundDetails.leaveReview": "Laisser des avis",
  "roundDetails.leaveConfirmTitle": "Quitter cette partie ?",
  "roundDetails.leaveConfirmHost_noPlayers":
    "Vous êtes l'organisateur et personne d'autre n'a rejoint. Cette partie sera définitivement supprimée.",
  "roundDetails.leaveConfirmHost_withPlayers":
    "Vous êtes l'organisateur. Le rôle sera transféré au joueur suivant et la partie continuera.",
  "roundDetails.leaveConfirmPlayer":
    "Vous serez retiré de cette partie. Vous pourrez la rejoindre plus tard s'il reste des places.",
  "roundDetails.leaveConfirmCancel": "Annuler",
  "roundDetails.leaveConfirmAction": "Quitter",
  "roundDetails.leaveConfirmDeleteAction": "Supprimer la partie",
  "roundDetails.roundDeleted": "Partie supprimée",
  "roundDetails.hostTransferred": "Vous avez quitté la partie. Le rôle d'organisateur a été transféré.",

  "myRounds.title": "Mes parties",
  "myRounds.subtitle": "Vos parties à venir et passées",
  "myRounds.upcoming": "À venir",
  "myRounds.past": "Parties passées",
  "myRounds.noUpcomingTitle": "Aucune partie à venir",
  "myRounds.noUpcomingHint": "Trouvez une partie à rejoindre ou créez la vôtre !",
  "myRounds.createRound": "Créer une partie",
  "myRounds.playedWith": "Jouée avec {count} golfeurs",
  "myRounds.completed": "Terminée",
  "myRounds.noPast": "Aucune partie passée.",

  "leaderboard.title": "Classement",
  "leaderboard.subtitle": "Basé sur les victoires",
  "leaderboard.noRankings": "Aucun classement pour le moment",
  "leaderboard.noRankingsHint": "Le classement apparaîtra après des parties terminées.",
  "leaderboard.victory": "victoire",
  "leaderboard.victories": "victoires",
  "leaderboard.allPlayers": "Tous les joueurs",
  "leaderboard.you": "(Vous)",
  "leaderboard.played": "{count} parties jouées",

  "messages.title": "Messages",
  "messages.emptyTitle": "Aucune discussion pour le moment",
  "messages.emptyHint": "Les discussions apparaissent après l'envoi du premier message.",
  "messages.roundPrefix": "Partie",
  "messages.roundChatDefault": "Discussion de partie",
  "messages.noMessagesYet": "Pas encore de messages",

  "reviews.title": "Avis",
  "reviews.subtitle": "Ce que les autres joueurs disent de vous",
  "reviews.averageLabel": "Note moyenne",
  "reviews.totalLabel": "Nombre d'avis",
  "reviews.noRating": "Pas de note",
  "reviews.emptyTitle": "Pas encore d'avis",
  "reviews.emptyHint": "Terminez des parties pour commencer à recevoir des avis.",
  "reviews.roundMeta": "{course} - {date}",

  "roundReview.title": "Noter les joueurs",
  "roundReview.subtitle": "Partagez votre retour après cette partie",
  "roundReview.notAllowedTitle": "Avis indisponibles",
  "roundReview.notAllowedHint": "Seuls les participants peuvent laisser un avis pour une partie terminée.",
  "roundReview.backToRound": "Retour à la partie",
  "roundReview.noTargetsTitle": "Aucun joueur à noter",
  "roundReview.noTargetsHint": "Vous avez déjà noté tous les joueurs de cette partie.",
  "roundReview.alreadyReviewed": "Déjà noté",
  "roundReview.ratingLabel": "Note",
  "roundReview.commentLabel": "Commentaire (facultatif)",
  "roundReview.commentPlaceholder": "Comment s'est passée votre expérience avec ce joueur ?",
  "roundReview.invalidRating": "Choisissez une note entre 1 et 5",
  "roundReview.saving": "Enregistrement...",
  "roundReview.save": "Enregistrer l'avis",
  "roundReview.saveSuccess": "Avis enregistré",
  "roundReview.saveFailed": "Impossible d'enregistrer l'avis",

  "chat.title": "Discussion",
  "chat.roundChatDefault": "Discussion de partie",
  "chat.empty": "Pas encore de messages. Dites bonjour !",
  "chat.inputPlaceholder": "Écrivez un message...",
  "chat.typingSingle": "{name} est en train d’écrire…",
  "chat.typingMultiple": "{names} sont en train d’écrire…",
  "chat.typingMany": "{names} et {count} autres sont en train d’écrire…",

  "auth.loginTagline": "Connectez-vous pour rejoindre vos parties",
  "auth.signupTagline": "Créez votre compte",
  "auth.forgotTagline": "Réinitialisez votre mot de passe",
  "auth.email": "E-mail",
  "auth.password": "Mot de passe",
  "auth.name": "Nom",
  "auth.loginLoading": "Connexion...",
  "auth.login": "Se connecter",
  "auth.forgotPassword": "Mot de passe oublié ?",
  "auth.createAccount": "Créer un compte",
  "auth.namePlaceholder": "Votre nom",
  "auth.passwordMin": "6 caractères minimum",
  "auth.signupLoading": "Inscription...",
  "auth.signup": "S'inscrire",
  "auth.backToLogin": "Retour à la connexion",
  "auth.sendLinkLoading": "Envoi...",
  "auth.sendLink": "Envoyer le lien",
  "auth.signupSuccessTitle": "Inscription réussie !",
  "auth.signupSuccessDesc": "Vérifiez votre e-mail pour confirmer votre compte.",
  "auth.emailSentTitle": "E-mail envoyé",
  "auth.emailSentDesc": "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",

  "reset.invalidLink": "Lien invalide ou expiré.",
  "reset.title": "Nouveau mot de passe",
  "reset.newPassword": "Nouveau mot de passe",
  "reset.updateLoading": "Mise à jour...",
  "reset.update": "Mettre à jour",
  "reset.updatedSuccess": "Mot de passe mis à jour !",

  "editProfile.title": "Modifier le profil",
  "editProfile.photoUpdated": "Photo mise à jour !",
  "editProfile.invalidHandicapTitle": "Handicap invalide",
  "editProfile.invalidHandicapDesc": "Saisissez une valeur entre -10 et 54",
  "editProfile.nameRequired": "Nom requis",
  "editProfile.saved": "Profil enregistré !",
  "editProfile.tapToChange": "Appuyez pour changer votre photo",
  "editProfile.name": "Nom",
  "editProfile.namePlaceholder": "Votre nom",
  "editProfile.handicap": "Handicap",
  "editProfile.club": "Club",
  "editProfile.clubPlaceholder": "Votre club de golf",
  "editProfile.bio": "Bio",
  "editProfile.bioPlaceholder": "Quelques mots sur vous...",
  "editProfile.saving": "Enregistrement...",
  "editProfile.save": "Enregistrer",
  "editProfile.cancel": "Annuler",

  "notFound.message": "Oups ! Page introuvable",
  "notFound.returnHome": "Retour à l'accueil",
};

const translations = {
  en: enTranslations,
  fr: frTranslations,
} as const;

export type TranslateParams = Record<string, string | number>;

function interpolate(template: string, params?: TranslateParams) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

export function translate(language: Language, key: TranslationKey, params?: TranslateParams) {
  const template = translations[language][key] ?? translations.en[key];
  return interpolate(template, params);
}

const roundFormatLabels: Record<string, Record<Language, string>> = {
  "Stroke Play": { en: "Stroke Play", fr: "Stroke Play" },
  Stableford: { en: "Stableford", fr: "Stableford" },
  "Match Play": { en: "Match Play", fr: "Match Play" },
  "Best Ball": { en: "Best Ball", fr: "Meilleure balle" },
  Scramble: { en: "Scramble", fr: "Scramble" },
  Skins: { en: "Skins", fr: "Skins" },
};

const handicapRangeLabels: Record<string, Record<Language, string>> = {
  "All Levels": { en: "All Levels", fr: "Tous niveaux" },
  "0-10": { en: "0-10", fr: "0-10" },
  "10-20": { en: "10-20", fr: "10-20" },
  "20-30": { en: "20-30", fr: "20-30" },
  "30+": { en: "30+", fr: "30+" },
};

const roundStatusLabels: Record<string, Record<Language, string>> = {
  completed: { en: "Completed", fr: "Terminée" },
  full: { en: "Full", fr: "Complet" },
  open: { en: "Open", fr: "Ouvert" },
  cancelled: { en: "Cancelled", fr: "Annulée" },
};

export function getRoundFormatLabel(format: string, language: Language) {
  return roundFormatLabels[format]?.[language] ?? format;
}

export function getHandicapRangeLabel(range: string, language: Language) {
  return handicapRangeLabels[range]?.[language] ?? range;
}

export function getHandicapRangeText(min: number, max: number, language: Language) {
  const clampedMin = Math.max(0, Math.min(36, Math.round(min)));
  const clampedMax = Math.max(0, Math.min(36, Math.round(max)));
  const normalizedMin = Math.min(clampedMin, clampedMax);
  const normalizedMax = Math.max(clampedMin, clampedMax);

  if (normalizedMin === 0 && normalizedMax === 36) {
    return handicapRangeLabels["All Levels"][language];
  }
  return `${normalizedMin}-${normalizedMax}`;
}

export function getRoundStatusLabel(status: string, language: Language) {
  return roundStatusLabels[status]?.[language] ?? status;
}

export const dateLocales: Record<Language, Locale> = {
  en: enUS,
  fr,
};

export const availableLanguages: Language[] = ["en", "fr"];
