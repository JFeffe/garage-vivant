# Plan de test — V7 complète à V7.2

Référence : **version 0.7.2**, 11 octobre 2026. Ce plan couvre les systèmes conservés de la V7, les actions de la V7.1, les groupes de la V7.2 et leurs raccords à la scène. Les [quinze DDD](./gdd/documentation.md) décrivent les règles actuelles ; les anciens plans conservent aussi des propositions non réalisées.

Les tests ci-dessous constituent une liste à exécuter, pas une déclaration que chaque essai manuel a déjà réussi. La réception automatisée disponible est détaillée à la fin. Aucun essai ne doit ajouter une règle, offrir des relations, créer un groupe de secours ou modifier silencieusement une sauvegarde pour réussir.

## 1. Ordre de passage

| Passe | Objectif | Exécution |
|---|---|---|
| 1 — Vérification rapide | Bonne version, partie intacte, contrôles utilisables | Parcours de 20–30 minutes ci-dessous |
| 2 — Règles isolées | Piges, besoins, émotions, traits, actions et relations | Cas contrôlés du laboratoire et tests moteur |
| 3 — Boucles complètes | Composer → adopter → répéter → spectacle → bilan | Partie conservée, départs et rechargements inclus |
| 4 — Migration et robustesse | Anciennes parties, corruption, déterminisme et données permanentes | Fixtures, export/import, tests moteur |
| 5 — Expérience naturelle | Formation, stabilité, multigroupe et pratiques | Vingt graines sur 30 jours, trois prolongées à 90 jours |
| 6 — Présentation | Lecture, interactions et son sur plusieurs écrans | Chromium automatisé puis appareils réels |
| 7 — Publication | Même jeu et même documentation sur le site | Vérification après CI et déploiement Pages |

Priorités : **P0** bloque la livraison — perte de données, corruption, blocage, résultat doublé, règle supprimée encore active. **P1** concerne une règle centrale, un raccord ou une information indispensable. **P2** concerne la présentation et les cas secondaires ; une information indispensable illisible devient P1.

Un résultat probabiliste ne doit pas être garanti dans une séance isolée. Séparer admissibilité, chance, tirage et conséquence ; conserver aussi les refus et expirations. Les critères de fréquence portent sur un ensemble de parties, pas sur une partie préparée au laboratoire.

## 2. Préparer et conserver les preuves

1. Vérifier le numéro 0.7.2 dans le jeu et les notes de version. Après publication, recharger pour récupérer les nouveaux modules.
2. Exporter sa partie avant les essais. Conserver l’original sans l’écraser ; utiliser une origine locale ou un autre profil de navigateur pour les fixtures et manipulations.
3. Noter version, commit, graine si connue, population, paramètres, navigateur, appareil, taille d’écran et heure simulée de départ.
4. Utiliser Pause pendant les mesures. Un affichage en lecture continue peut évoluer entre deux captures.
5. Pour un cas contrôlé, noter toutes les interventions : incarnation, curseur, trait, sac, activité imposée, création de groupe de laboratoire ou commande moteur. Ce résultat n’est pas une preuve de formation naturelle.
6. Pour chaque anomalie, conserver JSON avant/après, étapes exactes, heure, événement et capture. Noter aussi le message d’un refus.

Réglages de référence : huit personnages, paramètres par défaut. Le moteur utilise `drain/music/social/conflict/learning/relations/emotionDecay/romance/compositionPace = 1`, `randomness = 0,3`. La vitesse de lecture est séparée de ces paramètres. Les essais moteur connaissent explicitement leur graine ; ne pas supposer qu’une commande d’interface permet de la changer si elle n’est pas proposée.

Le laboratoire peut préparer les conditions d’une règle rare. Il ne remplace pas la passe naturelle. Pour une donnée qui n’est pas éditable dans l’interface, utiliser les fixtures et fonctions existantes dans les tests moteur ; ne pas inventer un bouton ou une mécanique.

## 3. Parcours rapide à jouer — 20 à 30 minutes

| Étape | Manipulation | À vérifier |
|---|---|---|
| R01 | Ouvrir, mettre en pause, sélectionner deux voisins | Version, quatre besoins, deux axes, sac, activité et fiche ; aucune confiance, humeur globale ou jauge de confort actuelle |
| R02 | Lire à ×0,5 puis ×1, utiliser +1 h | Temps cohérent, pause respectée, déplacements visibles, contrôles encore accessibles |
| R03 | Imposer Détente, Pratiquer puis Jam au musicien incarné | Actions hors sac ; effets sur place, pratique sans expression directe, Jam utilisable seul |
| R04 | Lancer ou reprendre un projet, interrompre puis consulter sa fiche | Travail conservé ; projet distinct d’une chanson terminée, auteurs et sources lisibles |
| R05 | Utiliser un groupe existant, ou en créer un explicitement au laboratoire | Identité, membres, agrégats, attachement, Coordination et réputation visibles ; création manuelle identifiée |
| R06 | Adopter une composition admissible ; ouvrir sa fiche et le propriétaire | Auteur conservé, propriétaire unique, navigation cliquable, maîtrise distincte |
| R07 | Cliquer Répéter ; observer les files et réponses à la fin des activités | L’appel n’interrompt pas immédiatement ; sac inchangé ; refus/attente/expiration visibles ; deux présents nécessaires pour travailler collectivement |
| R08 | Préparer un show ou essayer la répétition générale | Scène intégrée, cartes de même format, Son visible, carte disparue avant le tir du musicien vers la foule |
| R09 | Mettre le show en pause, inspecter, fermer, sauter puis revoir | Quartier gelé, pause restaurée, bilan unique, replay sans seconde récompense |
| R10 | Filtrer le catalogue, chercher « adoption » puis « plan de test », exporter et recharger | Filtres utilisables, règles actuelles accessibles, plan trouvable, sauvegarde conservée |

Cette passe vérifie que le jeu est utilisable. Elle n’attend pas qu’un groupe apparaisse spontanément en trente minutes réelles. Une répétition générale ne produit pas les conséquences d’un vrai show ; refaire le parcours avec une réservation réelle dans la passe complète.

## 4. Quartier, besoins, émotions et traits

Sources : [Personnages](./gdd/personnages.md), [Traits](./gdd/traits.md), [Temps](./gdd/temps.md), [Technique](./gdd/technique.md).

| ID / priorité | Conditions et essai | Résultat attendu |
|---|---|---|
| Q01 P0 | Partie neuve puis import courant | Quatre besoins et deux axes ; aucun champ actif confort, humeur, six anciennes émotions, attirance séparée ou confiance |
| Q02 P1 | Besoins entre leurs seuils, puis sous limite basse et critique | Pression basse ou critique selon la zone, jamais leur somme pour le même besoin ; arrêt de pression à la sortie |
| Q03 P1 | Un besoin critique et un autre comblé | Exaltation et détresse peuvent augmenter simultanément ; chaque jauge reste entre 0 et 100 |
| Q04 P1 | Même intervalle simulé à plusieurs vitesses et en petits pas | Mêmes règles et conséquences ; taux fondés sur les minutes, pas les images |
| Q05 P1 | Changer stabilité et Retour émotionnel dans un cas contrôlé | Retour des deux axes conforme ; les baisses d’événement ne reçoivent pas le multiplicateur des hausses |
| Q06 P0 | Export/rechargement sans avancer | Seuils personnels, associations, fourchettes et RNG inchangés ; inspection sans tirage |
| Q07 P1 | Association conditionnelle : juste sous, au seuil, puis sous le seuil | Trait activé au seuil inclus et retiré dessous ; aucun conflit instantané inventé |
| Q08 P0 | Même trait permanent et conditionnel, puis retrait de la condition | Source permanente conservée ; effet compté une seule fois |
| Q09 P1 | Éditer Alpha puis Bêta ; observer des échanges répétés | Incompatibilité respectée ; initiative influencée mais jamais garantie |
| Q10 P1 | Contrôler Solitaire, Perfectionniste, Oreille musicale et Oiseau de nuit | Effets annoncés appliqués à leurs consommateurs ; aucun changement du sac lié à la personnalité |
| Q11 P1 | Comparer deux sacs identiques avec besoins/personnalités différents | Chances de pige fondées uniquement sur les exemplaires restants |
| Q12 P2 | Lire sources, courbes et souvenirs, puis recharger | Historique personnel/quartier cohérent ; souvenir descriptif sans ancienne pression d’humeur |
| Q13 P1 | Lire Relax et Inspiré dans le catalogue | Relax indiqué débranché ; Inspiré agit sur l’écriture sans créer une jauge d’inspiration |
| Q14 P2 | Ajouter/retirer un voisin et éditer nom/âge/couleur | Identités et vues actualisées ; départs de groupes et références revalidés ; âge sans vieillissement simulé |

## 5. Sac Rapin, six actions et interruptions

Sources : [Actions](./gdd/actions.md), [Sommeil](./gdd/sommeil.md), [Déchéance](./gdd/decheance.md).

| ID / priorité | Conditions et essai | Résultat attendu |
|---|---|---|
| S01 P0 | Piger jusqu’à épuisement d’un des huit profils | Chaque exemplaire rencontré une fois ; jeton immédiatement en défausse, `reserved = null`, somme sac + défausse conforme au cycle |
| S02 P0 | Recherche sociale sans partenaire, refus, interruption et départ vers un show | Aucun remboursement ni jeton supplémentaire ; le jeton utilisé reste utilisé |
| S03 P0 | Fin d’action après dernière pige d’un sac | Remplissage au prochain besoin de pige depuis les exemplaires conservés ; aucun retrait ressuscité |
| S04 P0 | Augmenter une quantité en cours de cycle | Acquisition directement dans le sac courant, jamais en défausse |
| S05 P0 | Diminuer une quantité avec exemplaires dans sac et défausse | Retrait de la défausse disponible, solde en attente ; exemplaire encore dans le sac pigé avant retrait, son action réalisée |
| S06 P1 | Éditions négatives, fractionnaires, >100 ou inventaire entièrement vide | Refus explicite ; pas de mutation partielle ni jeton de secours |
| S07 P1 | Monde importé valide avec inventaire effectivement vide | Attente explicite sans boucle infinie ou remplissage fabriqué |
| S08 P1 | Trajet, contenu alterné et cycle d’une action | Pas de pige supplémentaire en trajet ou pour changer d’instrument/morceau |
| S09 P1 | Recharger puis exécuter plusieurs séances du même personnage | Fourchettes personnelles persistantes, durées variables ; minimum/maximum et décisions par cycles respectés |
| S10 P0 | Intervention manuelle puis sommeil ou spectacle prioritaire | Action imposée hors sac, ancienne action terminée, travail déjà acquis conservé |
| S11 P1 | Action en route puis arrivée | Aucun travail de morceau, apprentissage ou composition pendant le trajet |
| S12 P1 | Fin d’action avec invitation pendante | Sommeil obligatoire prioritaire ; sinon file avant pige ; refus puis invitation suivante ou pige |

### Détente et sommeil

| ID / priorité | Conditions et essai | Résultat attendu |
|---|---|---|
| A01 P1 | Détente sur place | Énergie/plaisir augmentent selon taux bruts, détresse baisse ; compter séparément l’usure normale |
| A02 P1 | Admission sociale acceptée pendant Détente | Détente terminée, socialisation hors sac ; aucune reprise du temps résiduel |
| A03 P1 | Admission refusée pendant Détente | Aucun passage social automatique ; distinguer demande et résultat |
| A04 P0 | Coucher pendant une action ou son trajet | Action interrompue, déplacement vers maison, sac inchangé par le sommeil |
| A05 P1 | Besoin 8 h, durée réellement dormie 4 h | Énergie au réveil au plus 50 ; trajet non compté comme sommeil |
| A06 P0 | Tous dorment : avance collective et simulation minute équivalente | Même monde final, y compris émotions, calendrier, déchéance et relations |
| A07 P1 | Coucher différé après minuit, trait nocturne et show nocturne | Prochaine nuit non sautée ; show confirmé prioritaire ; possibilité de dormir après engagement |
| A08 P1 | Pause, +1 h et onglet masqué pendant nuit collective | Pause respectée, +1 h limité à 60 minutes, aucun rattrapage d’onglet masqué |

## 6. Socialisation, relations et romance

Sources : [Interactions](./gdd/interactions.md), [Relations](./gdd/relations.md), [Groupes](./gdd/groupes.md).

| ID / priorité | Conditions et essai | Résultat attendu |
|---|---|---|
| I01 P0 | Demander à rejoindre une personne ou une séance déjà à trois | Une admission initiale par entrant ; proximité seule insuffisante ; aucune admission générale répétée avant chaque échange |
| I02 P1 | Échanges entre admis puis nouvelle arrivée | Un initiateur/destinataire par échange, cadence de séance conservée ; arrivée sans remise à zéro |
| I03 P0 | Inspecter admission puis échange favorable/neutre/défavorable | Chance et tirage de l’admission séparés du résultat ; `rolls.acceptance` nul pour échange entre admis |
| I04 P1 | Plusieurs échanges à trois ou quatre participants | Effets directs sur la paire choisie, pas sur tout le groupe ; nouvel initiateur possible au prochain échange |
| I05 P1 | Fin d’échange, fatigue, besoins satisfaits ou intensité très négative | Destinataire décide de rester/partir ; fin avec moins de deux inscrits ; pas de durée sociale fixe de 50 minutes |
| I06 P1 | Aucun partenaire admissible pendant 30 minutes de recherche sur place | Recherche terminée, aucun jeton rendu ni attente sociale supplémentaire de 15 minutes |
| I07 P1 | Même paire répétée, liens asymétriques, groupe commun et Inséparables | Poids directionnels, bonus fondé sur attachement du groupe commun ; chimie exacte non utilisée pour choisir le partenaire |
| I08 P1 | Soutien avec détresse suffisante, réussite puis issue défavorable | Effets propres identifiables, soutien favorable réduit détresse/déchéance ; aucun résultat favorable garanti |
| I09 P1 | Proposer une activité après ancienneté et affinité suffisantes | Interaction rare ; seul favorable lance une action existante commune hors sac ; autres membres poursuivent leur séance |
| I10 P1 | Proposition Pratiquer/Composer avec puis sans groupe commun | Contraintes de musique respectées ; aucune nouvelle action ou réunion de groupe ajoutée |
| I11 P0 | Deux directions de relation différentes ; tension et grief persistants | Valeurs non symétrisées arbitrairement ; refroidissement/plancher/érosion conformes, aucune confiance active |
| I12 P1 | Journée sans rencontre, souvenir expiré et source de composition | Érosion et archivage conformes ; pas de souvenir inventé ni ancien effet d’humeur |
| I13 P1 | Deux adultes, discussion favorable, lien amoureux initial nul | Naissance indépendante et probabiliste ; pas de conversion automatique de toute amitié en amour |
| I14 P0 | Avance admissible unilatérale puis refus et nouvelle tentative | Délai directionnel de 12 h ; amour de l’autre non offert ; statut de couple distinct |
| I15 P1 | Deux liens ≥40, puis l’un <25 | Formation/rupture probabilistes lors de l’examen horaire ; statut partagé, pas d’exclusivité nouvelle |

## 7. Pratiquer, Jam et Composer

Sources : [Musique](./gdd/musique.md), [Compositions](./gdd/compositions.md), [Groupes](./gdd/groupes.md).

| ID / priorité | Conditions et essai | Résultat attendu |
|---|---|---|
| M01 P1 | Pratique avec principal et secondaires admissibles | Principal favorisé à 85 %, secondaires parmi la liste persistante ; fréquence à mesurer sur plusieurs choix |
| M02 P1 | Suivre plusieurs cycles et une sauvegarde intermédiaire | Technique, instruments et morceaux peuvent alterner ; accumulation puis percées ; progrès conservés |
| M03 P0 | Pratique solo ou collective | Aucun gain direct d’expression par défaut ; distinguer les autres événements simultanés |
| M04 P1 | Conversation ordinaire vers un musicien qui pratique | Pas d’interruption sociale de la pratique ; demande de participation musicale selon les règles |
| M05 P0 | Deux présents répètent un morceau ; autre groupe commun parallèle | Maîtrise personnelle distincte ; Coordination et maîtrise collective créditées au seul groupe/morceau annoncé |
| M06 P1 | Principal très maîtrisé, plaisir/exaltation et trait musical différents | Modificateurs d’apprentissage existants et bornage appliqués ; aucun bonus de mémoire/chimie vers les plateaux |
| M07 P0 | Jam solo, admission d’un voisin hors groupe, départ des partenaires | Musique solo possible au début et à la fin ; aucune terminaison parce qu’un seul reste |
| M08 P1 | Jam collective puis consultation du groupe et répertoire | Expression/plaisir/relations possibles ; aucun gain direct de Coordination, maîtrise de répertoire ou réputation |
| M09 P1 | Résultats techniques successifs et même résultat répété | Six moments techniques distincts des échanges, atténuation de répétition, effets journalisés |
| M10 P1 | Jams terminées distinctes, inspection puis option Laboratoire | Connaissance de chimie progressive ; valeur exacte cachée normalement ; inspection sans RNG |
| C01 P0 | Deux projets du même auteur alternés et rechargés | Travail, sources et origine propres à chaque projet ; aucun mélange ni finalisation doublée |
| C02 P1 | Composer une séance, interrompre, reprendre | Fourchette de séance distincte de la cible totale ; généralement plusieurs séances, travail acquis conservé |
| C03 P1 | Exaltation/détresse élevées ensemble versus un seul axe | Élan lié au minimum des deux axes ; vitesse accrue sans garantie de qualité supérieure |
| C04 P0 | Deux coauteurs du même groupe, puis départ d’un auteur | Une chanson canonique ; auteurs et contributions conservés ; collaboration sans groupe refusée |
| C05 P1 | Projet sans travail réel durant 14 jours | Abandonné et consultable, pas chanson faible jouable ; lecture de fiche sans rafraîchir son activité |
| C06 P1 | Trois autres chansons de référence, nouvelles qualités contrastées | Référence relative sans auto-inclusion ; faible réévaluable, qualité d’origine inchangée |
| C07 P0 | Archiver/restaurer et mettre de côté/réactiver au répertoire | Deux opérations distinctes ; aucune suppression, copie ou perte de maîtrise/propriété |
| C08 P1 | Créer de nombreux titres et groupes, doublon normalisé ou identité proche | Registre persistant, créations refusées explicitement si nom indisponible ; aucun suffixe ou banque de secours |
| C09 P1 | Banque épuisée dans test moteur contrôlé | Refus fini sans mutation partielle, groupe fictif ou boucle infinie |
| C10 P1 | Auteur quitté/supprimé, morceau possédé et anciennes chansons | Attribution conservée avec noms disponibles, œuvres historiques non renommées ou recolorées |

**Frontière actuelle d’archivage :** l’archive du catalogue masque une œuvre, elle ne retire pas la propriété et ne désactive pas une ligne de répertoire. L’adoption autonome préfère les chansons non faibles quand elles existent, mais ne possède pas de filtre supplémentaire pour l’archive manuelle. Vérifier ce comportement réel et relever tout écart à l’intention de jeu ; ne pas prétendre que le classement bloque toutes les utilisations.

## 8. Groupes autonomes, adoption et invitations

Source : [Groupes](./gdd/groupes.md). Les valeurs ci-dessous sont celles de V7.2, pas celles proposées avant l’équilibrage.

| ID / priorité | Conditions et essai | Résultat attendu |
|---|---|---|
| G01 P0 | Affinités réciproques ≥12 ou amour réciproque ≥25, tension <60 | Admissibilité ; chimie musicale facultative ; un échange favorable ne garantit pas formation |
| G02 P1 | Affinité/amour unilatéral, forte tension, sommeil ou engagement | Motif d’inadmissibilité ; aucune confiance encore requise |
| G03 P0 | Proposition autonome puis manuelle, réussite et refus | Même acceptation et transitions ; émission omise seulement pour proposition manuelle ; laboratoire direct clairement distinct |
| G04 P1 | Après réussite puis refus ; duo déjà partagé | Délai réussi 48 h pour partenaires, proposition par paire 24 h ; première formation sans attente initiale ajoutée ; pas de duo doublon |
| G05 P1 | Recrutement avec liens vers moins puis au moins la moitié des membres | Règle de recrutement respectée ; attachement et appartenances freinent l’acceptation sans plafond arbitraire |
| G06 P1 | Même groupe, relations personnelles divergentes, réputation forte | Attachements individuels différents, coordination commune ; formule inspectable et calcul sans tirage |
| G07 P1 | Compétences égales puis différentes ; départ d’un membre | Moyenne/min/max recalculés, marqueurs coïncidents regroupés ; membres extrêmes identifiables |
| G08 P1 | Adopter plusieurs styles, égalité puis mise de côté | Couleur issue des morceaux actifs ; règle d’égalité et retour au genre initial sans morceau actif |
| G09 P0 | Adoption concurrente, auteur hors groupe ou chanson déjà possédée | Propriétaire unique, auteur membre requis ; aucune copie ni deuxième adoption |
| G10 P0 | Adoption puis auteur quitte ; maîtrise acquise et répertoire mis de côté | Crédits et maîtrises préservés ; groupe garde œuvre et maîtrise ; catalogue personnel indique propriétaire |
| G11 P1 | Adoption/pratique autonome à plusieurs échéances de six heures | Décisions avec variance, groupes du joueur inclus ; aucun appel garanti ou plafonnement caché à trois chansons |
| G12 P0 | Cliquer Répéter pendant une autre action | Demande unique, invitation par membre, action/sac inchangés ; lieu et morceau explicites |
| G13 P0 | Plusieurs invitations, refus de la première, expiration ou groupe quitté | File en ordre d’arrivée, réponses/motifs conservés ; poursuivre la file ou la pige sans créer/rembourser un jeton |
| G14 P1 | Invitation pendant sommeil ou show prochain | Sommeil ordinaire non interrompu ; invitation incompatible avec attente/pratique/trajet de show déclinée |
| G15 P0 | Premier arrivé seul puis deuxième arrivé | Attente au plus 120 min sans travail/apprentissage ; deux présents démarrent la séance |
| G16 P0 | Appel expiré à 12 h, morceau désactivé ou dissolution en attente | Demande fermée et participations correspondantes terminées ; sac intact |
| G17 P1 | Participant ayant pigé Pratiquer rejoint un appel compatible | Admission et déplacement, inscription à la demande ; crédit collectif uniquement après démarrage réel |
| G18 P0 | Après départ des autres, un seul participant continue | Travail personnel possible, aucun crédit collectif ; demandes/références nettoyées sans corruption |
| G19 P1 | Attachement <20 ou autre groupe rejoint +25, après grâce | Examen variable après 48 h puis chaque 12 h ; motifs réels, pas de groupe potentiel inventé |
| G20 P1 | Show confirmé du groupe dans moins de six heures | Examen de départ différé ; pas d’annulation autonome juste avant l’engagement |
| G21 P0 | Départ manuel/autonome, invitations et réservations pendantes | Historique conservé, participation fermée, engagement revalidé/annulé selon membres restants |
| G22 P0 | Coordination positive très faible, puis zéro ; moins de deux membres | Récupération possible tant que positif ; zéro/sous deux terminal, demandes/réservations fermées, aucune résurrection |
| G23 P0 | Recharger groupe dissous puis demander reprise ou nouvelle adoption | État terminal conservé, reprise refusée ; œuvres/historique gardés, aucun transfert de secours |
| G24 P1 | Adoption, plusieurs minutes, puis vrai show et replay | Réputation catalogue recalculée sans crédit répété ; part spectacle appliquée une fois ; moral existant conservé |

## 9. Déchéance et engagements de scène

Sources : [Déchéance](./gdd/decheance.md), [Shows](./gdd/shows.md), [Sommeil](./gdd/sommeil.md).

| ID / priorité | Conditions et essai | Résultat attendu |
|---|---|---|
| D01 P1 | Plusieurs cycles d’une séance puis nouvelles séances rapprochées | Un épisode par séance ; chaîne dans fenêtre 12 h, pas un nouvel épisode par cycle |
| D02 P0 | Deck musical de neuf cartes, déchéance 0/19/20/99/100 | Quantité liée `min(ceil(9×0,6), floor(déchéance/20))` : 0/0/1/4/5 cartes et jetons nuisibles |
| D03 P0 | Seuil maintenu puis récupération avec jetons encore dans le sac | Aucun ajout répété chaque minute ; retrait différé depuis défausse, sans effacer les exemplaires non rencontrés |
| D04 P1 | Sommeil, détente, soutien favorable et nuit sacrifiée | Récupération/coûts existants ; réussite de show sans augmentation automatique de déchéance |
| D05 P0 | Préparer show contaminé puis inspecter/recharger/rejouer | Cartes musicales conservées, exemplaires nuisibles distincts, cinq pigés sans remise ; ancienne prestation non réécrite |
| H01 P1 | Calendrier au départ puis plusieurs événements terminés | Quatre dates futures, identifiants permanents, grosse scène toutes les quatre occasions |
| H02 P0 | Réserver petite scène, candidature grosse scène et engagement incompatible | Conditions/confirmations existantes, au plus un engagement futur par groupe ; refus possible avant confirmation |
| H03 P1 | Clôture de grosse scène, accepté puis rejeté | Affiche tirée selon règles ; refus donne moral temporaire, pas de perte de réputation |
| H04 P0 | Modifier/annuler setlist ou participants avant départ | Validation avant mutation, engagement revalidé ; morceaux possédés actifs pour nouveaux choix |
| H05 P0 | Positions différentes, actions/sommeil en cours, show confirmé | Départs individuels calculés, interruption au bon moment, trajet réel et marge de dix minutes ; aucun jeton rendu |
| H06 P0 | Musicien avec énergie nulle au départ ou à l’arrivée | Pas de deuxième refus ordinaire ni recharge d’attente ; énergie influence la performance |
| H07 P0 | Déchéance sous 90 puis 90–100 au départ | Exception seulement extrême, chance jusqu’à 20 %, un tirage par engagement/personnage ; absence enregistrée sans pénalité relationnelle nouvelle |
| H08 P0 | Moins de deux arrivés à l’heure, vingt minutes plus tard | Créneau manqué explicitement, autres groupes continuent ; pas de téléportation ni musicien fantôme |
| H09 P0 | Une ou plusieurs chansons, commencer puis changer vitesse/pause/onglet | Quartier gelé, public commun, présentation 30 s/chanson à ×1 ; résultats indépendants de la vitesse |
| H10 P0 | Lire, sauter, interrompre, recommencer en répétition générale et revoir | Saut applique mêmes résultats ; replay et preview sans nouveaux gains ; interruption sans récompense de secours |
| H11 P0 | Fin puis rechargement, replay et chanson suivante | Un seul bilan par prestation, réputation/moral/énergie/relations appliqués une fois ; trace historique conservée |
| H12 P1 | Groove, crescendo, soutien, erreur, émotion et euphorie | Effets réels visibles, jauges bornées ; une réaction majeure par fan, mini-cubes sans double comptage de personne |
| H13 P0 | Ancien show en cours et setlist confirmée V7.1 partagée | Snapshot versionné conservé ; exception historique enregistrée, pas étendue aux nouveaux engagements |

## 10. Interface, catalogue, son et documentation

La clarté fait partie de la réception : une valeur juste mais cachée peut empêcher de comprendre le jeu.

| ID / priorité | Essai | Résultat attendu |
|---|---|---|
| U01 P1 | Carte avec foule, actions, émotions, noms longs et nuit | Libellés d’activité distincts et au-dessus des effets ; lien au bon voisin, bande sous carte lisible sur téléphone |
| U02 P1 | Organiser, masquer/déplacer un module, sélectionner puis recharger | Préférences conservées séparément du monde ; absence de saut de scroll/focus ou perte du curseur édité |
| U03 P1 | Groupe actif puis archive et plusieurs appartenances | Liste filtrable, groupes actifs/dissous distingués, membres/fondateurs/anciens/histoire visibles |
| U04 P1 | Compétences, détails d’attachement, réputation et invitations | Moyenne/min/max, facteurs, parts de réputation, ordre/échéances/réponses et prochains examens compréhensibles |
| U05 P1 | Catalogue ≥140 œuvres : recherche, filtres combinés et Voir davantage | Pagination par 50, faibles/archives/abandons accessibles, pas de titre perdu ni qualité provisoire présentée comme finale |
| U06 P1 | Chanson personnelle/adoptée, projet, auteur parti ; tri par maîtrise | Propriétaire/contexte distincts ; pas de maîtrise universelle inventée ; auteur/propriétaire cliquables quand présents |
| U07 P1 | Fenêtre de chanson puis auteur ou groupe ; retour au catalogue | Fenêtre fermée pour navigation, fiche correcte ; filtres et position conservés |
| U08 P0 | Dropdown relationnel, éditeurs, aide et nouvelles traces | Aucune confiance active, humeur globale ou confort ; mentions historiques clairement inertes |
| U09 P1 | Scène prête, révélation, visée, tir, impact, erreur et combo | Même taille/place de carte ; disparition avant tir depuis le musicien vers la foule ; BANG dans le canvas |
| U10 P1 | Inspecter cartes, fan, musicien et deck ; fenêtres imbriquées | Cible exacte, pas de carte future révélée ; X/Échap/clic extérieur restaurent l’état de pause antérieur |
| U11 P1 | Son OFF/ON puis inspection, skip et show suivant | Bouton visible, démarrage sonore à l’initiative du joueur, tir/contact distincts ; aucun bruit continu gossant ou boucle doublée |
| U12 P2 | Effets réduits puis capture comparative | Résultats et cibles inchangés, secousses/recul/éclats retirés, jauges et indications conservées |
| U13 P1 | Recherche jeu et VitePress : adoption, défausse, seuils, Solitaire, plan de test | Résultats actuels, liens/ancres valides, navigation clavier ; plan accessible par architecture documentaire et VitePress |
| U14 P1 | Version puis notes, fermer/revenir/recharger | v0.7.2 et note correcte ; notes lues conservées, pause/focus restaurés |
| U15 P1 | Nom avec accents, apostrophes et contenu de type HTML | Nom affiché comme texte, jamais exécuté ; unicité normalisée ; contrôles dans leurs cartes |

Matrice minimale de scène : **1440×900, 1200×768, 900×850, 390×844, 390×667, 844×390**. Vérifier titre, nom du groupe, cartes, decks, foule, commandes et jauges sans défilement extérieur. Le quartier et les fiches peuvent défiler ; leur contenu ne doit pas déborder horizontalement.

En complément de Chromium automatisé : Chrome/Edge de bureau, Firefox/Safari si disponibles, un téléphone Android et un iPhone réels. Vérifier toucher, rotation, clavier, défilement, audio et reprise après changement d’onglet. Les essais sur appareils réels restent à faire ; un viewport de téléphone n’en constitue pas la preuve.

## 11. Sauvegardes, migrations et commandes refusées

Source : [Technique](./gdd/technique.md). Utiliser les JSON historiques de `tests/` sur une origine de test.

| ID / priorité | Essai | Résultat attendu |
|---|---|---|
| V01 P0 | Import V1/V2/V3/V4/V5/V6/V7.0/V7.1 | Conversion 0.7.2 validée sur copie ; productions, compétences, auteurs et traces conservés selon migration documentée |
| V02 P0 | Vraie fixture `tests/v071-world.json` | Confiance archivée sans affinité offerte ; une chanson partagée attribuée à la meilleure maîtrise puis date/identifiant |
| V03 P0 | Ancien partage, réservation confirmée et auteur qui quitte | Maîtrises personnelles conservées, entrée perdante archivée, arbitrage traçable, exception de setlist historique enregistrée |
| V04 P0 | Groupe archivé, zéro Coordination ou moins de deux membres à l’import | État terminal, histoire et œuvres gardées, engagements futurs annulés ; aucune reprise offerte |
| V05 P0 | Recharger une partie 0.7.2 en trajet, attente, pratique, sommeil ou show | Aucun reroll, nouvelle migration ou reset de délai ; mêmes commandes produisent le même futur |
| V06 P0 | Exporter/importer, comparer monde à pause égale | Aucune perte de demandes, files, propriété, seuils, références ou RNG ; préférences d’interface séparées |
| V07 P0 | Corrompre copie : NaN, compteurs, sac, références, propriétaire ou état terminal | Rejet explicite ; sauvegarde valide précédente non remplacée ni réparée silencieusement |
| V08 P0 | Sauvegarde locale illisible, rechargement puis attente | Pas d’écrasement automatique ; nouvelle partie/import seulement sur action explicite |
| V09 P0 | Refus de nom, groupe, morceau, projet, action ou réservation inadmissible | Message compréhensible ; pas de mutation partielle ; refus probabiliste conserve seulement ses conséquences documentées |
| V10 P1 | Supprimer un personnage ou dissoudre un groupe pendant files/réservations | Références revalidées, historique/attribution conservés, pas de participant ou propriétaire fantôme |
| V11 P0 | Lire/filtrer/inspecter le même monde deux fois | RNG et simulation non modifiés par rendu, documentation ou audio |
| V12 P1 | Changer d’origine/navigateur après export | Import possible ; aucune promesse de synchronisation automatique ou de multijoueur |

## 12. Formation naturelle et stabilité

Commande reproductible : `npm run audit:groups`. Elle simule vingt graines avec huit personnages, sans création manuelle ni préparation des relations : `2040`, `1` à `18`, `713`. Elle applique les commandes existantes de saut des shows avec leurs conséquences, valide aux jours 3/5/10/30 et compare exactement une continuation de 240 minutes après recharge. Les graines 2040, 1 et 2 continuent jusqu’à J90.

| Critère de cette passe | Référence V7.2 mesurée | Lecture |
|---|---|---|
| ≥80 % des graines avec première formation avant J10 | 20/20 | Pas de groupe forcé pour atteindre la cible |
| Majorité en groupe unique parmi attachement ≥60 à J30 | 71/77 | Multigroupe possible, marginal parmi les attachés |
| Groupes durables au-delà des délais initiaux | 39/48 actifs à J30 âgés d’au moins 7 j | Existence durable, pas garantie de succès de tous les groupes |
| Répétitions réellement commencées | 700 démarrages cumulés à J30 | Distinguer demande émise, réponses, réunion et travail |
| Stabilité prolongée sur trois graines | À J90 : 8 groupes actifs âgés d’au moins 30 j, 19/19 attachés en groupe unique | Échantillon limité à ces trois parties |
| Sauvegarde et futur | Rechargements et continuation conformes | Pas seulement une validation de schéma |

Le [rapport](./BALANCE_V7_2.md) et ses [données](./BALANCE_V7_2.json) constituent la référence. Le script réécrit le JSON ; conserver le rapport initial avant un nouvel équilibrage et comparer les mêmes réglages. Une graine isolée sans groupe à J10 ne justifie pas une mécanique de secours.

Compléments manuels à mesurer sans les annoncer déjà réussis : populations 2/4/12/24, sacs édités, paramètres extrêmes mais valides, évolution d’une vraie partie V7.1 importée, rotations de membres et lisibilité d’un grand catalogue. Les critères chiffrés à huit personnages ne se transfèrent pas automatiquement aux autres configurations. Relever une file interminable, une famine de pige, une succession permanente de duos ou une disparition d’œuvres ; conserver la partie pour diagnostic.

## 13. Limites et tests d’absence de mécanique

Les quatorze identifiants du [registre](./gdd/raccords-v7.md) doivent être visibles dans Réglages et documentés. Leur absence de consommateur est une frontière de version, pas un test en échec.

| Identifiant | Contrôle de frontière |
|---|---|
| `inspiration-resourcing` | Pas de jauge d’inspiration ; Détente conserve ses effets réels |
| `personal-agenda` | Pas d’agenda général ; sommeil, appels et engagements existants seulement |
| `memory-learning` | Souvenirs/source conservés, pas de bonus direct aux plateaux |
| `chemistry-learning` | Chimie musicale existante, pas de multiplicateur de plateau de répétition |
| `social-search-pressure` | Usure/pressions normales en recherche, pas de déprime supplémentaire automatique |
| `absolute-archive` | Seuil absolu historique inerte, classement relatif actif |
| `memory-mood` | Intensité descriptive, pas de calcul d’humeur caché |
| `six-tones` | Chansons historiques intactes, nouvelles chansons à deux axes |
| `personality-choice` | Personnalité aux consommateurs existants, pas à la pige |
| `lazy-choice` | Relax visible sans ancien bonus de choix |
| `absence-drama` | Absence extrême et présence revalidée, pas de pénalités relationnelles particulières ajoutées |
| `group-albums-fans` | Couleur/réputation existantes, pas d’album, diffusion, palmarès ou fans persistants |
| `song-transfer` | Propriété conservée après départ/dissolution, pas de transfert ou duplication |
| `group-social-meeting` | Social dans activités existantes, pas de nouvelle réunion autonome |

Ne pas exiger ces mécanismes pour accepter la V7.2. Si un raccord restant actif casse le jeu, consigner un défaut réel ; ne pas le masquer en remplissant le sac, restaurant la Coordination, inventant un remplaçant ou transférant les chansons.

## 14. Commandes et couverture déjà automatisée

Avec Node 22, depuis la racine du dépôt :

```sh
npm ci --ignore-scripts
npm test
npm run audit:groups
npx playwright install --with-deps chromium
npm run docs:build
npm run test:browser
git diff --check
```

Pour une partie locale indépendante : `python3 -m http.server 8000 --directory dist`, puis ouvrir `http://localhost:8000/`. La construction documentaire précède les tests navigateur et génère les pages ainsi que l’index du jeu.

| Suites / outil | Garanties exercées automatiquement |
|---|---|
| `engine`, `systems`, `v4`, `v5`, `v6` | Simulation, données, carrière, calendrier, contraintes, setlists et versions historiques |
| `v7` | Sac, pressions, sources de traits, admission, partenaire, sommeil, romance, migrations et continuation |
| `v71` | Six actions, retraits différés, projets séparés, plateaux, qualité relative, noms et déchéance |
| `v72` | Vraie V7.1, propriétaire unique, attachement/agrégats, file/attente, présence, dissolution et corruption |
| `runtime`, `show` | Horloges, gel du quartier, scène, vitesses, reprise, skip/replay et résultats uniques |
| `interface`, `docs` | Rendu, valeurs cachées, contenu échappé, traits/raccords, versions, liens et termes cherchables |
| `browser`, `show-layout` | Chromium, desktop/tactile, scroll/focus, contrôles, catalogue, recherches, scènes et six viewports |
| `audit:groups` | Émergence/stabilité multi-graines, métriques, rechargements et prolongement à J90 |

La réception de la PR V7.2 a réussi ces commandes : `npm test` rapporte 20 tests, zéro échec ; [CI 29](https://github.com/jutrasimon/garage-vivant/actions/runs/38106457451) verte. Ce nombre agrège des suites contenant de nombreuses assertions ; il ne signifie pas que toutes les lignes de ce plan ont été jouées par une personne. La CI du dernier commit et celle de `main` restent les références pour la publication correspondante.

Les mesures CI sont conservées dans `equilibrage-v72`, les captures dans `interface-v7`. Les captures CI expirent après sept jours : conserver celles nécessaires à un défaut avant expiration. Aucune couverture chiffrée de code, validation de plaisir humain ou certification d’appareil réel n’est revendiquée.

## 15. Compte rendu et décision

Pour chaque ID : **À faire / Réussi / Échec / Non applicable**, avec preuve et raison. « Non applicable » est réservé à une condition réellement absente ou une limite déclarée ; ne pas l’utiliser pour un blocage.

| ID | Version / graine / appareil | Préparation et étapes | Attendu | Observé | Statut / priorité | JSON / capture / événement |
|---|---|---|---|---|---|---|
| À remplir | | | | | | |

Livraison acceptable : automatisations vertes sur le commit final, aucun P0 ouvert, P1 corrigés ou limites précisément déclarées, vraie sauvegarde ancienne préservée, parcours complet jouable et documentation cohérente. Un résultat probabiliste conforme n’est pas un bug ; une absence de trace, une mutation incohérente ou une règle documentée fausse en est un.

Après fusion et succès de Pages : vérifier version, recherche « plan de test », ouverture de cette page et téléchargement du rapport JSON sur le site public. Conserver la date de publication et le commit. Les essais humains et appareils réels restent consignés séparément des résultats automatisés.
