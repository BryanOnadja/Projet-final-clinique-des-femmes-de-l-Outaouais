// Langue de l'interface (français / anglais).
// Tous les textes affichés sont ici : pour changer une traduction, modifiez ce fichier.
// Utilisation dans un composant : const { t } = useLangue()  puis  t('nav.appels')
import { createContext, useContext, useEffect, useState } from 'react'

const pluriel = (n) => (n > 1 ? 's' : '')

const TEXTES = {
  fr: {
    'app.titre': 'Suivi des appels',
    'app.clinique': "Clinique des femmes de l'Outaouais",
    'langue.choix': "Langue de l'interface",

    'nav.appels': 'Appels',
    'nav.nouvel': '+ Nouvel appel',
    'nav.archives': 'Archives et recherche',
    'nav.admin': 'Administration',
    'nav.menu': 'Menu',
    'nav.direct': 'En direct',
    'nav.horsLigne': 'Hors ligne',
    'nav.directTitre': 'Mises à jour en temps réel',
    'nav.deconnexion': 'Déconnexion',

    'statut.nouveau': 'Nouveau',
    'statut.en_cours': 'En cours',
    'statut.en_attente': 'En attente',
    'statut.regle': 'Réglé',

    'source.boite_1': 'Boîte vocale 1',
    'source.boite_2': 'Boîte vocale 2',
    'source.boite_3': 'Boîte vocale 3',
    'source.boite_4': 'Boîte vocale 4',
    'source.reception': 'Réceptionniste',

    'langue.fr': 'Français',
    'langue.en': 'Anglais',
    'langue.es': 'Espagnol',

    'confidentiel.titre': 'Mesure de confidentialité demandée',
    'confidentiel.court': 'Confidentiel',

    'connexion.courriel': 'Courriel',
    'connexion.mdp': 'Mot de passe',
    'connexion.bouton': 'Se connecter',
    'connexion.note': 'Prototype étudiant (SED 2515) avec des données fictives. Compte de démo :',

    'tableau.titre': 'Appels à traiter',
    'tableau.actifs': ({ n }) => `${n} appel${pluriel(n)} actif${pluriel(n)}`,
    'tableau.avisNouvel': ({ nom }) => `Nouvel appel : ${nom}`,
    'tableau.nomInconnu': 'Nom inconnu',
    'tableau.motifConfidentiel': 'Confidentiel : ouvrir la fiche',
    'tableau.personne': 'Personne',
    'tableau.vide': 'Aucun appel à traiter 🎉',

    'filtre.recherche': 'Rechercher un nom ou un numéro',
    'filtre.rechercheLabel': 'Recherche',
    'filtre.statut': 'Statut',
    'filtre.tousStatuts': 'Tous les statuts',
    'filtre.service': 'Service',
    'filtre.tousServices': 'Tous les services',
    'filtre.langue': 'Langue',
    'filtre.toutesLangues': 'Toutes les langues',
    'filtre.effacer': 'Effacer',

    'col.recuLe': 'Reçu le',
    'col.appelante': 'Appelante',
    'col.telephone': 'Téléphone',
    'col.courriel': 'Courriel',
    'col.motif': 'Motif',
    'col.langue': 'Langue',
    'col.source': 'Source',
    'col.service': 'Service',
    'col.statut': 'Statut',
    'col.prisPar': 'Pris par',
    'col.derniereAction': 'Dernière action',

    'nouvel.titre': 'Nouvel appel',
    'nouvel.origine': "D'où vient l'appel ?",
    'nouvel.date': "Date et heure de l'appel",
    'nouvel.qui': 'Qui a appelé ?',
    'nouvel.nom': 'Nom',
    'nouvel.telephone': 'Téléphone *',
    'nouvel.langue': "Langue de l'appel",
    'nouvel.pourquoi': 'Pourquoi ?',
    'nouvel.aDeterminer': 'À déterminer',
    'nouvel.motif': "Motif de l'appel",
    'nouvel.confidentiel': '🔒 La personne demande une mesure de confidentialité',
    'nouvel.consigne': 'Consigne',
    'nouvel.consigneEx': 'Ex. : ne pas laisser de message',
    'nouvel.transcription': 'Transcription du message vocal',
    'nouvel.transcriptionAide': 'Collez ici le texte reçu par courriel du système téléphonique.',
    'nouvel.annuler': 'Annuler',
    'nouvel.creer': 'Créer la fiche',

    'fiche.retour': '← Retour à la liste',
    'fiche.archive': 'Archivé',
    'fiche.majCollegue': 'Mis à jour par une collègue',
    'fiche.jeMenOccupe': "✋ Je m'en occupe",
    'fiche.prisPar': 'Pris en charge par',
    'fiche.vous': 'vous',
    'fiche.liberer': 'Libérer',
    'fiche.relais': 'Prendre le relais',
    'fiche.confidentielDefaut': 'Vérifiez avant de laisser un message.',
    'fiche.creePar': 'Fiche créée par',
    'fiche.archiver': 'Archiver',
    'fiche.desarchiver': 'Sortir des archives',
    'fiche.historique': 'Historique',
    'fiche.noteRapide': 'Ajouter une note rapide',
    'fiche.completer': 'Compléter (facultatif)',
    'fiche.completerEx': 'Ex. : jeudi vers 14 h',
    'fiche.enregistrer': 'Enregistrer',
    'fiche.noteLibre': 'Note libre',
    'fiche.ecrire': 'Écrire une note...',
    'fiche.ajouterNote': 'Ajouter la note',
    'fiche.chargement': 'Chargement...',

    'archives.titre': 'Archives et recherche',
    'archives.label': 'Rechercher un numéro de téléphone ou un nom',
    'archives.exemple': 'Ex. : 819 555-0142',
    'archives.bouton': 'Rechercher',
    'archives.aide': 'La recherche couvre les appels actifs et archivés, même anciens.',
    'archives.trouves': ({ n, q }) => `${n} appel${pluriel(n)} trouvé${pluriel(n)} pour « ${q} »`,
    'archives.recents': ({ n }) => `${n} appels archivés, du plus récent au plus ancien`,
    'archives.vide': 'Aucun appel trouvé',

    'admin.titre': 'Administration',
    'admin.notes': 'Notes rapides',
    'admin.services': 'Services',
    'admin.comptes': "Comptes de l'équipe",
    'admin.notesAide': "Ces textes apparaissent comme boutons sur chaque fiche d'appel. Le statut choisi est appliqué à l'appel quand on clique sur la note.",
    'admin.ordre': 'Ordre',
    'admin.texte': 'Texte',
    'admin.statutDonne': "Statut donné à l'appel",
    'admin.active': 'Active',
    'admin.neChangePas': 'Ne change pas le statut',
    'admin.enregistrer': 'Enregistrer',
    'admin.nouvelleNote': 'Nouvelle note rapide',
    'admin.ajouter': 'Ajouter',
    'admin.noteEnregistree': "Note enregistrée : les boutons sont mis à jour chez toute l'équipe.",
    'admin.noteAjoutee': 'Note ajoutée.',
    'admin.servicesAide': 'Les services servent aux filtres et donnent sa couleur à chaque appel.',
    'admin.nom': 'Nom',
    'admin.couleur': 'Couleur',
    'admin.nouveauService': 'Nouveau service',
    'admin.serviceEnregistre': 'Service enregistré.',
    'admin.serviceAjoute': 'Service ajouté.',
    'admin.courriel': 'Courriel',
    'admin.role': 'Rôle',
    'admin.acces': 'Accès',
    'admin.membre': 'Membre',
    'admin.administratrice': 'Administratrice',
    'admin.desactiver': 'Désactiver',
    'admin.reactiver': 'Réactiver',
    'admin.ajouterCompte': 'Ajouter un compte',
    'admin.mdpMin': 'Mot de passe (8 caractères min.)',
    'admin.creer': 'Créer',
    'admin.compteMaj': 'Compte mis à jour.',
    'admin.compteCree': 'Compte créé.',
  },

  en: {
    'app.titre': 'Call tracking',
    'app.clinique': "Clinique des femmes de l'Outaouais",
    'langue.choix': 'Interface language',

    'nav.appels': 'Calls',
    'nav.nouvel': '+ New call',
    'nav.archives': 'Archive and search',
    'nav.admin': 'Administration',
    'nav.menu': 'Menu',
    'nav.direct': 'Live',
    'nav.horsLigne': 'Offline',
    'nav.directTitre': 'Real-time updates',
    'nav.deconnexion': 'Sign out',

    'statut.nouveau': 'New',
    'statut.en_cours': 'In progress',
    'statut.en_attente': 'Waiting',
    'statut.regle': 'Resolved',

    'source.boite_1': 'Voicemail 1',
    'source.boite_2': 'Voicemail 2',
    'source.boite_3': 'Voicemail 3',
    'source.boite_4': 'Voicemail 4',
    'source.reception': 'Receptionist',

    'langue.fr': 'French',
    'langue.en': 'English',
    'langue.es': 'Spanish',

    'confidentiel.titre': 'Confidentiality requested',
    'confidentiel.court': 'Confidential',

    'connexion.courriel': 'Email',
    'connexion.mdp': 'Password',
    'connexion.bouton': 'Sign in',
    'connexion.note': 'Student prototype (SED 2515) with fictional data. Demo account:',

    'tableau.titre': 'Calls to handle',
    'tableau.actifs': ({ n }) => `${n} active call${pluriel(n)}`,
    'tableau.avisNouvel': ({ nom }) => `New call: ${nom}`,
    'tableau.nomInconnu': 'Unknown name',
    'tableau.motifConfidentiel': 'Confidential: open the record',
    'tableau.personne': 'Nobody',
    'tableau.vide': 'No calls to handle 🎉',

    'filtre.recherche': 'Search a name or number',
    'filtre.rechercheLabel': 'Search',
    'filtre.statut': 'Status',
    'filtre.tousStatuts': 'All statuses',
    'filtre.service': 'Service',
    'filtre.tousServices': 'All services',
    'filtre.langue': 'Language',
    'filtre.toutesLangues': 'All languages',
    'filtre.effacer': 'Clear',

    'col.recuLe': 'Received',
    'col.appelante': 'Caller',
    'col.telephone': 'Phone',
    'col.courriel': 'Email',
    'col.motif': 'Reason',
    'col.langue': 'Language',
    'col.source': 'Source',
    'col.service': 'Service',
    'col.statut': 'Status',
    'col.prisPar': 'Handled by',
    'col.derniereAction': 'Last action',

    'nouvel.titre': 'New call',
    'nouvel.origine': 'Where did the call come from?',
    'nouvel.date': 'Call date and time',
    'nouvel.qui': 'Who called?',
    'nouvel.nom': 'Name',
    'nouvel.telephone': 'Phone *',
    'nouvel.langue': 'Language of the call',
    'nouvel.pourquoi': 'Why?',
    'nouvel.aDeterminer': 'To be determined',
    'nouvel.motif': 'Reason for the call',
    'nouvel.confidentiel': '🔒 The caller requests confidentiality',
    'nouvel.consigne': 'Instruction',
    'nouvel.consigneEx': 'E.g.: do not leave a message',
    'nouvel.transcription': 'Voicemail transcription',
    'nouvel.transcriptionAide': 'Paste the text received by email from the phone system.',
    'nouvel.annuler': 'Cancel',
    'nouvel.creer': 'Create record',

    'fiche.retour': '← Back to the list',
    'fiche.archive': 'Archived',
    'fiche.majCollegue': 'Updated by a colleague',
    'fiche.jeMenOccupe': "✋ I'll handle it",
    'fiche.prisPar': 'Handled by',
    'fiche.vous': 'you',
    'fiche.liberer': 'Release',
    'fiche.relais': 'Take over',
    'fiche.confidentielDefaut': 'Check before leaving a message.',
    'fiche.creePar': 'Record created by',
    'fiche.archiver': 'Archive',
    'fiche.desarchiver': 'Restore from archive',
    'fiche.historique': 'History',
    'fiche.noteRapide': 'Add a quick note',
    'fiche.completer': 'Add details (optional)',
    'fiche.completerEx': 'E.g.: Thursday around 2 pm',
    'fiche.enregistrer': 'Save',
    'fiche.noteLibre': 'Free note',
    'fiche.ecrire': 'Write a note...',
    'fiche.ajouterNote': 'Add note',
    'fiche.chargement': 'Loading...',

    'archives.titre': 'Archive and search',
    'archives.label': 'Search a phone number or a name',
    'archives.exemple': 'E.g.: 819 555-0142',
    'archives.bouton': 'Search',
    'archives.aide': 'The search covers active and archived calls, even old ones.',
    'archives.trouves': ({ n, q }) => `${n} call${pluriel(n)} found for “${q}”`,
    'archives.recents': ({ n }) => `${n} archived calls, newest first`,
    'archives.vide': 'No calls found',

    'admin.titre': 'Administration',
    'admin.notes': 'Quick notes',
    'admin.services': 'Services',
    'admin.comptes': 'Team accounts',
    'admin.notesAide': 'These texts appear as buttons on every call record. The chosen status is applied to the call when the note is clicked.',
    'admin.ordre': 'Order',
    'admin.texte': 'Text',
    'admin.statutDonne': 'Status given to the call',
    'admin.active': 'Active',
    'admin.neChangePas': 'Does not change the status',
    'admin.enregistrer': 'Save',
    'admin.nouvelleNote': 'New quick note',
    'admin.ajouter': 'Add',
    'admin.noteEnregistree': 'Note saved: the buttons are updated for the whole team.',
    'admin.noteAjoutee': 'Note added.',
    'admin.servicesAide': 'Services are used for filters and give each call its color.',
    'admin.nom': 'Name',
    'admin.couleur': 'Color',
    'admin.nouveauService': 'New service',
    'admin.serviceEnregistre': 'Service saved.',
    'admin.serviceAjoute': 'Service added.',
    'admin.courriel': 'Email',
    'admin.role': 'Role',
    'admin.acces': 'Access',
    'admin.membre': 'Member',
    'admin.administratrice': 'Administrator',
    'admin.desactiver': 'Deactivate',
    'admin.reactiver': 'Reactivate',
    'admin.ajouterCompte': 'Add an account',
    'admin.mdpMin': 'Password (8 characters min.)',
    'admin.creer': 'Create',
    'admin.compteMaj': 'Account updated.',
    'admin.compteCree': 'Account created.',
  },
}

// Messages d'erreur du serveur (envoyés en français) -> anglais
const ERREURS_EN = {
  'Courriel et mot de passe requis': 'Email and password required',
  'Courriel ou mot de passe incorrect': 'Incorrect email or password',
  'Connexion requise': 'Sign-in required',
  'Session expirée, reconnectez-vous': 'Session expired, please sign in again',
  'Réservé aux administratrices': 'Administrators only',
  'Appel introuvable': 'Call not found',
  'Source invalide': 'Invalid source',
  'Le numéro de téléphone est obligatoire': 'The phone number is required',
  'Note rapide introuvable': 'Quick note not found',
  'La note est vide': 'The note is empty',
  'Le texte est obligatoire': 'Text is required',
  'Le nom est obligatoire': 'Name is required',
  'Nom et courriel obligatoires': 'Name and email are required',
  'Mot de passe : 8 caractères minimum': 'Password: 8 characters minimum',
  'Ce courriel est déjà utilisé': 'This email is already in use',
  'Vous ne pouvez pas retirer vos propres droits': 'You cannot remove your own rights',
  'Erreur du serveur': 'Server error',
  'Une erreur est survenue': 'An error occurred',
}

// Actions automatiques de l'historique (enregistrées en français) -> anglais.
// Les notes rapides et les notes libres restent telles qu'elles ont été écrites.
const STATUTS_EN = { Nouveau: 'New', 'En cours': 'In progress', 'En attente': 'Waiting', 'Réglé': 'Resolved' }
const ACTIONS_EN = [
  [/^Fiche créée \(message vocal\)$/, () => 'Record created (voicemail)'],
  [/^Fiche créée \(appel pris à la réception\)$/, () => 'Record created (call taken at reception)'],
  [/^Fiche créée à partir du message vocal$/, () => 'Record created from the voicemail'],
  [/^(.+) s'occupe de cet appel$/, (m) => `${m[1]} is handling this call`],
  [/^(.+) a libéré l'appel$/, (m) => `${m[1]} released the call`],
  [/^Statut changé : (.+)$/, (m) => `Status changed: ${STATUTS_EN[m[1]] || m[1]}`],
  [/^Appel archivé$/, () => 'Call archived'],
  [/^Appel sorti des archives$/, () => 'Call restored from archive'],
  [/^Service modifié$/, () => 'Service changed'],
  [/^Informations de la fiche modifiées$/, () => 'Record details updated'],
]

function lireLangueEnregistree() {
  try {
    const l = localStorage.getItem('langue')
    return l === 'en' || l === 'fr' ? l : 'fr'
  } catch {
    return 'fr'
  }
}

const LangueContext = createContext(null)

export function LangueProvider({ children }) {
  const [langue, setLangueEtat] = useState(lireLangueEnregistree)

  function setLangue(l) {
    setLangueEtat(l)
    try {
      localStorage.setItem('langue', l) // on s'en souvient sur cet ordinateur
    } catch {
      /* stockage indisponible : la langue reste valable pour la session */
    }
  }

  // Langue de la page et titre de l'onglet
  useEffect(() => {
    document.documentElement.lang = langue
    document.title = `${TEXTES[langue]['app.titre']} – ${TEXTES[langue]['app.clinique']}`
  }, [langue])

  // t('cle') ou t('cle', { n: 3 }) : renvoie le texte dans la langue choisie
  function t(cle, valeurs = {}) {
    const texte = TEXTES[langue][cle] ?? TEXTES.fr[cle] ?? cle
    return typeof texte === 'function' ? texte(valeurs) : texte
  }

  // Message d'erreur venant du serveur
  function tErreur(message) {
    if (!message || langue === 'fr') return message
    return ERREURS_EN[message] || message
  }

  // Ligne de l'historique
  function tAction(texte) {
    if (!texte || langue === 'fr') return texte
    for (const [motif, traduire] of ACTIONS_EN) {
      const m = texte.match(motif)
      if (m) return traduire(m)
    }
    return texte
  }

  // Date courte : l'année n'est affichée que si ce n'est pas l'année en cours
  const locale = langue === 'en' ? 'en-CA' : 'fr-CA'
  const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
  const formatCetteAnnee = new Intl.DateTimeFormat(locale, options)
  const formatAutreAnnee = new Intl.DateTimeFormat(locale, { ...options, year: 'numeric' })
  const dateHeure = (valeur) => {
    if (!valeur) return ''
    const d = new Date(valeur)
    return (d.getFullYear() === new Date().getFullYear() ? formatCetteAnnee : formatAutreAnnee).format(d)
  }

  return (
    <LangueContext.Provider value={{ langue, setLangue, t, tErreur, tAction, dateHeure }}>
      {children}
    </LangueContext.Provider>
  )
}

export const useLangue = () => useContext(LangueContext)

// Le bouton FR | EN
export function BoutonLangue({ taille = 'is-small' }) {
  const { langue, setLangue, t } = useLangue()
  return (
    <div className="buttons has-addons bouton-langue mb-0" role="group" aria-label={t('langue.choix')}>
      {['fr', 'en'].map((l) => (
        <button key={l} type="button"
          className={`button ${taille} mb-0 ${langue === l ? 'is-primary' : ''}`}
          aria-pressed={langue === l}
          lang={l}
          title={l === 'fr' ? 'Français' : 'English'}
          onClick={() => setLangue(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
