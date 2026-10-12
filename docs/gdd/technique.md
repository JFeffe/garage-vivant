# DDD — Architecture, sauvegardes et validation

Version d’interface : 0.7.9. Format du monde : 0.7.3. L’application reste statique, sans dépendance de simulation à l’exécution ni compte serveur.

## Modules et responsabilités

| Source dans dist/ | Responsabilité |
|---|---|
| `v7.mjs` | Sacs, défausse, catalogue de traits, seuils, pressions et probabilités V7 |
| `groups.mjs`, `group-rules.mjs` | Politiques, transitions et paramètres de groupe partagés ; migration et validation V7.2 |
| `map-labels.mjs` | Placement pur des libellés de carte sans collision |
| `v71.mjs` | Fourchettes, plateaux, choix instrumentaux, registre de noms, classement relatif, migration et validation V7.1 |
| `catalogue.mjs` | Filtres et tris de projets/chansons, détails des auteurs, rattachements et maîtrises |
| `engine.mjs` | Hasard du monde, activités, sommeil, séances, événements, projets, liens, orchestration minute et import |
| `social.mjs` | Migration V6 et compatibilité des commandes de sac; grief et réparation |
| `life.mjs` | Commandes de carrière, répertoire, déchéance, répétitions, départs et conséquences de shows |
| `calendar.mjs` | Quatre dates continues, créneaux, candidatures et moral collectif |
| `stage.mjs` | Tirage indépendant et physique musicale; snapshots de prestation versionnés |
| `v7-view.mjs` | Inspecteurs du sac, seuils, séance, traits, raccords et traces d’interaction |
| `app.mjs`, vues et CSS | Navigation, rendu, réglages, événements utilisateur et lecture |
| `runtime.mjs`, `show-playback.mjs` | Horloges de présentation, pause et positions, sans tirage de quartier |
| `release.mjs`, `doc-search.mjs` | Version visible, notes lues et recherche documentaire |

Le monde utilise un générateur pseudoaléatoire sérialisé. Rendu, lecture et audio n’en consomment pas. Les spectacles possèdent leur propre graine et trace; leur vitesse de lecture ne change pas leur résultat.

## Schéma V7.2

Chaque personnage conserve les besoins, émotions, traits, pressions et sommeil V7. Il ajoute `actionRanges`, `secondaryInstruments`, `learningWork`, `songMastery`, `drafts`, `excessEpisodes` et `decadenceTokens`. Les fourchettes et accumulations persistent ; aucun reroulage au rechargement.

`bag` contient six catégories dans `composition` (quantité cible), `cycleComposition` (inventaire du cycle), `remaining` (sac), `consumed` (défausse) et `pendingRemoval` (retraits restant à rencontrer). `reserved` reste nul pour la compatibilité de format. Invariant par catégorie : `cycleComposition = remaining + consumed`. Un jeton pigé est immédiatement défaussé. Retraits et acquisitions mettent à jour cet inventaire ; le remplissage transfère la défausse conservée au sac.

L’action sérialise durée indicative, temps personnel, cycle restant, cycles achevés, instrument, groupe, morceau, admission et tentatives. Une jam garde son horloge, ses paires présentes et ses paires créditées une seule fois pour la connaissance de chimie. Une séance sociale garde membres, prochaine interaction et intensité signée. Les probabilités et conséquences des échanges restent traçables ; un échange déjà admis a `rolls.acceptance: null`.

Les projets sérialisent auteurs, noms des auteurs, groupe de création, contributions, minutes, travail, cible et état, y compris abandonné. Les chansons ajoutent attribution, rattachement et classement relatif. `musicNames` réserve les identités, y compris historiques et archivées. Projet et chanson issue du projet gardent la même réservation. Les anciennes chansons ne sont pas réécrites par migration.

Une nouvelle prestation est `rulesVersion:71`. Ses exemplaires de cartes nuisibles ont des identifiants distincts, même quand le type se répète. Les anciennes prestations gardent leurs versions et snapshots.

## Migration V7 vers V7.1

Le format 0.7.0 est accepté. Il conserve personnages, compétences, seuils, émotions, chansons, projets, travail, cibles, groupes, calendriers et spectacles. Une ancienne réservation est placée en défausse ; aucun jeton n’est remboursé. Les stocks actuels restent conservés, puis les écarts d’édition anciens sont rapprochés de la cible par acquisitions ou retraits différés. La sixième catégorie commence à zéro ; la jauge de déchéance existante ajoute immédiatement sa quantité liée de jetons. Les anciens délais d’attente sociale sont retirés.

Une action conserve son avancement et son temps restant. L’ancien Jam qui répétait explicitement un morceau de groupe devient Pratiquer avec ce morceau. Les nouvelles fourchettes sont attribuées une fois avec le hasard sérialisé. Les brouillons existants deviennent les premiers brouillons séparés ; les contributions historiques absentes ne sont pas inventées.

Un monde 0.7.3 importé est validé directement. Un monde 0.7.2 ne change que son champ version avant cette même validation. Aucun mécanisme de migration n’y masque un champ actuel manquant ou corrompu. Après export/import, le futur est exactement identique : tirages, projets, plateaux, séances et spectacles.

## Migration V1 à V6

Les formats acceptés sont 0.1.0, 0.2.0, 0.3.0, 0.4.0, 0.5.0, 0.5.1 et 0.6.0, puis 0.7.0, 0.7.1, 0.7.2 et 0.7.3. Les étapes historiques ajoutent d’abord les champs nécessaires; le raccord V7 s’applique une fois.

| Donnée ancienne | Traitement |
|---|---|
| Personnages, identités, âge, compétences, personnalité, déchéance, decks | Conservés; pas de réduction de niveau |
| Chansons terminées et leurs nuances | Conservées intégralement |
| Groupes, répertoire, coordination, moral, réputation et engagements | Conservés; anciens calendriers/slots passent par la migration continue existante |
| Show en cours, trace et résultats anciens | Conservés; leur version de règles garde la continuation et le replay |
| Émotions | Exaltation = joie + enthousiasme; détresse = tristesse + colère + peur, bornées à 100. Affection n’est pas convertie en amour |
| Sources émotionnelles | Trois dernières sources des familles correspondantes; provenance des projets conservée |
| Confort et attirance | Supprimés; `love` conservé, couple initialisé à faux sans inventer un ancien statut |
| Humeur et historique ancien | Ancien graphique retiré, nouvelles courbes commencent à la migration; sauvegarde d’origine disponible |
| Sac personnalisé V6 | Parts anciennes arrondies en jetons entiers; récupérer devient Détente; formation retirée. Si composition éveillée vide, utiliser l’échantillon de départ |
| Sac automatique | Échantillon selon identifiant; cycle initial complet |
| Action actuelle | Continuer hors sac; récupérer devient Détente. Formation en cours est annulée et journalisée; les autres actions gardent leur avancement |
| Compteurs de récupération et pauses | Additionnés dans Détente; nouveaux compteurs Dormir à zéro. Catégories originales gardées dans `legacyActionCounts` avec version |
| Projets inachevés | Garder travail, cible, séances, titre et sources; raccord de tonalité vers l’axe V7 courant. Recommencer les échantillons créatifs à deux axes, sans effacer le travail |
| Seuils, sommeil et associations | Attribués une fois avec le hasard sérialisé; persistants ensuite |
| Sessions de proximité V6 | Retirées; pas de déclencheur social concurrent |

La conversion préserve les productions; elle ne prétend pas reproduire les six nuances émotionnelles dans les nouvelles chansons. Le passage V7 consomme du hasard pour attribuer les champs nouveaux; un ancien monde ne doit pas continuer selon les anciennes règles. Un monde V7 reçoit ensuite le raccord V7.1 ; un monde V7.3 rechargé continue exactement le même futur.

## Stockage et sauvegarde invalide

La clé du monde reste `garage-vivant-v1`, pour reprendre les parties existantes. Avant migration dans l’interface, conserver une copie dans `garage-vivant-before-v7-3`. L’export JSON transporte le monde et ses archives; les préférences de modules et notes lues restent locales et séparées.

L’import travaille sur une copie et valide avant adoption. Un monde actuel avec valeurs non numériques, cycle incohérent, retrait différé invalide, séance personnelle invalide, champs retirés, incompatibilité Alpha/Bêta, seuils invalides ou trace invalide est refusé. Une sauvegarde locale illisible n’est pas écrasée automatiquement : l’interface demande un import valide ou un nouveau quartier explicite. Les sauvegardes dépendent du navigateur et de l’origine; exporter/importer pour changer d’hébergement.

## Vérifications de livraison

`npm test` couvre simulation déterministe, invariants sur plusieurs populations, V1–V7 réelles, travail créatif conservé, rencontres, multiset de sac, admission unique puis résultats directs, traces, seuils, sources permanentes, sommeil équivalent à l’avance minute, romance unilatérale, couples et corruption de sauvegarde. Les tests de carrière gardent engagements incompatibles, départs, setlists, skip/replay, récompenses uniques et 100 jours de calendrier.

`npm run docs:build` construit VitePress et l’index du jeu. `npm run test:browser` vérifie Chromium ordinateur/tactile, focus et scroll, éditeurs, recherche du jeu et de VitePress, seuils, catalogue et parcours de show. Les captures sont dans l’artefact CI `interface-v7` (nom historique de l’artefact). Un viewport tactile ne remplace pas un essai sur appareil réel.

La CI vérifie une PR sans déployer. `main` publie jeu et documentation ensemble après les mêmes gates. Contributions sur branche dédiée avec PR; le propriétaire décide l’intégration. Pas de multijoueur dans cette version.

Liens : [architecture documentaire](./documentation.md), [raccords](./raccords-v7.md), [temps](./temps.md), [guide](../index.md).

## Migration V7.1 vers V7.2

Sur une copie du monde, sans formation offerte et sans remise à zéro des affinités : archiver `trust` dans `legacyV71.trust`, puis le supprimer de toutes les relations actuelles. Les traces historiques gardent leur vocabulaire original. Initialiser files et état d’initiatives ; affecter une seule fois leurs échéances avec le hasard sérialisé. Les dates d’adhésion historiques restent inconnues (null), sans inventer le passé.

Ajouter `ownerGroupId` et `adoptedAt` aux chansons. Pour un ancien répertoire partagé, choisir le groupe avec la meilleure maîtrise collective ; égalité : date de création la plus ancienne, puis identifiant. Conserver sa maîtrise, archiver les autres entrées dans `legacyV71.sharedRepertoires` et enregistrer l’arbitrage dans `propertyResolutions`. Ne copier ni chanson ni maîtrise chez un nouveau propriétaire. Les auteurs, qualités, sources, titres et maîtrises personnelles sont conservés. Date d’adoption historique inconnue : null.

Les setlists déjà confirmées reçoivent `legacySetlist`, avec leur identifiant enregistré dans `legacyV71.confirmedBookings`. Leur continuation garde les morceaux historiques ; les nouvelles réservations utilisent le propriétaire courant. Une pratique historique privée de son ancien répertoire partagé continue personnellement, sans crédit collectif. Une archive ou un groupe déjà à zéro/sous deux membres devient terminal, conserve son histoire et annule ses engagements futurs ; une prestation en cours garde son snapshot.

La réputation historique est répartie : part spectacle = max(0 ; ancienne réputation − nouvelle part catalogue). Lorsque le catalogue dépasse l’ancienne réputation, le nouveau total reflète ce catalogue ; ce changement n’est pas un crédit répété. La couleur initiale historique est conservée, puis la couleur courante dérive des morceaux actifs.

Le format actuel sérialise `groupState` (demandes, échéances, propositions récentes, compteurs), `invitationQueue`, `memberships`, état terminal, parts de réputation et propriété canonique. Validation stricte de compteurs, identifiants, files, lieux, timestamps, propriétaire/répertoire, états et participations. Aucun trust courant autorisé ; un monde corrompu n’est pas automatiquement migré ou rempli. Après rechargement courant, le futur et le hasard restent identiques.

Les entités restent des données sérialisables, avec fonctions pures et transitions partagées ; pas de hiérarchie de classes imposée. `groupContext` fournit hasard, événements, début/fin d’activité et revalidation des engagements. Les commandes manuelles et initiatives autonomes utilisent les mêmes transitions d’adoption, appel, départ et dissolution. `npm run audit:groups` mesure formation et stabilité sur 20 graines, enregistre les étapes 3/5/10/30 jours, prolonge trois graines à 90 jours et vérifie la continuation des sauvegardes. [Rapport](../BALANCE_V7_2.md).

## Passage V7.2 vers V7.3

Aucun champ de simulation ajouté. Sur une copie, changer seulement `version` de 0.7.2 à 0.7.3, puis valider strictement : RNG, seuils, sacs, dates, projets, répertoires, maîtrises, files et historiques sont conservés. Aucun tirage de migration, compensation ni réparation de donnée corrompue. Les anciennes copies `garage-vivant-before-v7-2` restent en place ; l’interface utilise une copie distincte `garage-vivant-before-v7-3`. La fixture `v072-world.json` a été générée et validée avec le moteur publié V7.2 (`c13b861088347ffcc2508eb54d285499b8278093`), avant les corrections.

Les corrections s’appliquent à la prochaine transition : l’appel garde son morceau avant travail ; un auteur encore associé à un projet terminé ferme sa séance avant trajet ou nouveau travail. Les gains historiques restent inchangés. Le futur sous les nouvelles règles peut diverger de V7.2 ; deux continuations V7.3 du même monde sont identiques. `tests/v73.test.mjs` reproduit les quatre défauts et vérifie la vraie sauvegarde V7.2. `npm run audit:simulation` observe seize parties de quinze jours, vérifie chaque sauvegarde quotidienne, puis compare 240 minutes de continuation. Il échoue sur blocage, rechargement divergent ou invariant observé violé. [Protocole et résultats](../AUDIT_V7_3.md).

## Correctif d’interface V7.4 — Archives des groupes

Le navigateur de groupes sépare Actifs et Archives, conserve la sélection lors d’une dissolution et ouvre le bon état depuis les liens de propriétaire. Seuls filtres et sélection de vue changent ; aucune donnée, migration, politique de dissolution ni tirage du moteur modifié. Les groupes dissous étaient déjà stockés dans `world.groups`. `RELEASE_VERSION` et les paramètres de cache des ressources passent à 0.7.4 ; `VERSION` reste à 0.7.3, afin de ne pas migrer une sauvegarde inchangée. Le test Chromium suit une vraie prestation terminée, dissout son groupe dans une fixture contrôlée, puis vérifie archive, répertoire, anciens membres, bilan de show, navigation depuis une chanson et export/rechargement sur ordinateur et téléphone.

## Réglage de formation et recrutement V7.5

La version historique 0.7.5 ; le format du monde reste 0.7.3. Les délais et probabilités de `group-rules.mjs` distinguent désormais nouvelle formation et recrutement dans le band existant, via les mêmes politiques et transitions de `groups.mjs`. Aucun champ, migration, quota ou ordonnanceur supplémentaire. Les sauvegardes gardent groupes, historiques, horodatages et hasard ; les prochains choix appliquent les nouveaux coefficients. Une continuation exacte est garantie entre sauvegarde et rechargement exécutés avec la même version de règles, pas entre deux équilibrages différents.

L’audit accepte un chemin de sortie, conserve une [référence V7.4](../BALANCE_V7_5_BASELINE.json) séparée et publie tailles, première arrivée à trois membres, stabilité et multigroupe dans le [bilan V7.5](../BALANCE_V7_5.md). La simulation complète de cette version historique produit `AUDIT_V7_5.json` ; les rapports V7.2/V7.3 ne sont plus écrasés par la CI courante. Les tests ciblés couvrent recrutement successif, candidat indisponible, liens réciproques, refus et temporisation, sélection d’un groupe existant et freins au multigroupe.

## Modules d’affichage V7.9

`character-view.mjs` partage le dessin des accessoires entre carte, scène et portraits HTML générés sur canvas. Le cache de portraits est borné à 128 apparences; le nom est échappé dans les attributs HTML. `map-options.mjs` définit huit options booléennes et leurs valeurs par défaut. Préférences conservées dans `garage-vivant-map-options`, séparées du monde exporté; valeurs mal formées ignorées. Aucun tirage moteur ni effet sur les actions.

L’interface est 0.7.9, format du monde 0.7.3 avec surnom facultatif. `createWorld(seed,count,{setup})` est explicite : l’API moteur garde `none` pour les tests et laboratoires; l’interface crée par défaut `varied`. `seedStartingGroups` utilise le RNG du monde et `createGroup`; jamais appliqué à l’import. Les identifiants, sauvegardes et archives existantes ne sont pas réécrits.

Le journal copie désormais les identifiants des participants à la création d’un événement. Il ne conserve plus la référence mutable à la liste des membres d’un groupe; un recrutement ne modifie donc pas les anciens événements ni la continuité après rechargement.
